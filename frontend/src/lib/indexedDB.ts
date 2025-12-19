// lib/indexedDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FormDB extends DBSchema {
  forms: {
    key: string;
    value: {
      id: string;
      title: string;
      description: string;
      fields: any[];
      rules: any[];
      createdAt: string;
      updatedAt: string;
      syncStatus: 'synced' | 'pending';
      lastSyncAttempt?: string;
    };
    indexes: { 'by-syncStatus': string };
  };
}

class FormDatabase {
  private db: IDBPDatabase<FormDB> | null = null;
  private readonly dbName = 'formBuilderDB';
  private readonly dbVersion = 2;
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async init(): Promise<void> {
    this.db = await openDB<FormDB>(this.dbName, this.dbVersion, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Version 1: forms store oluştur
        if (oldVersion < 1) {
          const formStore = db.createObjectStore('forms', { keyPath: 'id' });
          formStore.createIndex('by-syncStatus', 'syncStatus');
        }

        // Version 2: rules alanı ekle
        if (oldVersion < 2) {
          // Store'u yeniden oluşturmak yerine migration yapabiliriz
          // Ancak basit tutmak için store'u silip yeniden oluşturuyoruz
          if (db.objectStoreNames.contains('forms')) {
            db.deleteObjectStore('forms');
          }
          const formStore = db.createObjectStore('forms', { keyPath: 'id' });
          formStore.createIndex('by-syncStatus', 'syncStatus');
        }
      },
    });
  }

  private async ensureDB(): Promise<IDBPDatabase<FormDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async saveForm(formData: any): Promise<string> {
    const db = await this.ensureDB();
    
    const formWithSync = {
      ...formData,
      syncStatus: 'pending' as const,
      lastSyncAttempt: new Date().toISOString(),
    };

    await db.put('forms', formWithSync);
    console.log('Form saved to IndexedDB:', formData.id);
    return formData.id;
  }

  async getForms(): Promise<any[]> {
    const db = await this.ensureDB();
    return await db.getAll('forms');
  }

  async getForm(id: string): Promise<any | null> {
    const db = await this.ensureDB();
    return await db.get('forms', id) || null;
  }

  async deleteForm(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('forms', id);
  }

  async clearForms(): Promise<void> {
    const db = await this.ensureDB();
    await db.clear('forms');
  }

  async getPendingForms(): Promise<any[]> {
    const db = await this.ensureDB();
    const tx = db.transaction('forms', 'readonly');
    const index = tx.store.index('by-syncStatus');
    return await index.getAll('pending');
  }

  async getSyncedForms(): Promise<any[]> {
    const db = await this.ensureDB();
    const tx = db.transaction('forms', 'readonly');
    const index = tx.store.index('by-syncStatus');
    return await index.getAll('synced');
  }

  async syncWithBackend(): Promise<{ success: boolean; synced: number; failed: number }> {
    const pendingForms = await this.getPendingForms();
    let synced = 0;
    let failed = 0;

    console.log(`Syncing ${pendingForms.length} forms with backend...`);

    for (const form of pendingForms) {
      try {
        // Backend'e gönder
        const response = await fetch(`${this.API_URL}/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          // Sync başarılı, durumu güncelle
          const db = await this.ensureDB();
          await db.put('forms', {
            ...form,
            syncStatus: 'synced' as const,
            lastSyncAttempt: new Date().toISOString(),
          });
          synced++;
          console.log(`Form ${form.id} synced successfully`);
        } else {
          console.warn(`Form ${form.id} sync failed: ${response.status}`);
          failed++;
        }
      } catch (error) {
        console.error(`Form ${form.id} sync error:`, error);
        failed++;
      }
    }

    return { success: failed === 0, synced, failed };
  }

  async markFormAsSynced(id: string): Promise<void> {
    const db = await this.ensureDB();
    const form = await db.get('forms', id);
    
    if (form) {
      await db.put('forms', {
        ...form,
        syncStatus: 'synced' as const,
        lastSyncAttempt: new Date().toISOString(),
      });
    }
  }

  async getSyncStats(): Promise<{
    total: number;
    pending: number;
    synced: number;
    lastSyncAttempt?: string;
  }> {
    const forms = await this.getForms();
    const pendingForms = await this.getPendingForms();
    const syncedForms = await this.getSyncedForms();

    let lastSyncAttempt: string | undefined;
    for (const form of forms) {
      if (form.lastSyncAttempt && (!lastSyncAttempt || form.lastSyncAttempt > lastSyncAttempt)) {
        lastSyncAttempt = form.lastSyncAttempt;
      }
    }

    return {
      total: forms.length,
      pending: pendingForms.length,
      synced: syncedForms.length,
      lastSyncAttempt,
    };
  }

  async retryFailedSyncs(): Promise<{ success: boolean; retried: number }> {
    const forms = await this.getForms();
    let retried = 0;

    for (const form of forms) {
      // Son sync denemesi 5 dakikadan eskiyse tekrar dene
      if (form.syncStatus === 'pending') {
        const lastAttempt = new Date(form.lastSyncAttempt || 0);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (lastAttempt < fiveMinutesAgo) {
          try {
            const response = await fetch(`${this.API_URL}/forms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });

            if (response.ok) {
              await this.markFormAsSynced(form.id);
              retried++;
            }
          } catch (error) {
            console.error(`Retry failed for form ${form.id}:`, error);
          }
        }
      }
    }

    return { success: retried > 0, retried };
  }
}

// Singleton instance
export const formDB = new FormDatabase();