class FormDB {
  private dbName = 'FormBuilderDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Forms store
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { keyPath: 'id' });
          formsStore.createIndex('title', 'title', { unique: false });
          formsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Form submissions store
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { keyPath: 'id' });
          submissionsStore.createIndex('formId', 'formId', { unique: false });
          submissionsStore.createIndex('submittedAt', 'submittedAt', { unique: false });
        }
      };
    });
  }

  async saveForm(form: any) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const request = store.put({
        ...form,
        id: form.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        isOffline: true
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getForms() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async syncWithBackend() {
    // Bu fonksiyon offline kayıtları backend'e senkronize eder
    const forms = await this.getForms() as any[];
    const offlineForms = forms.filter(f => f.isOffline);
    
    for (const form of offlineForms) {
      try {
        // Backend'e gönder
        const response = await fetch('http://localhost:3001/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });

        if (response.ok) {
          // Backend'e kaydedildi, local'den sil
          await this.deleteForm(form.id);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }

  async deleteForm(id: string) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

export const formDB = new FormDB();