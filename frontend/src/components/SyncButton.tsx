'use client';

import React, { useState } from 'react';
import { formDB } from '@/lib/indexedDB';

const SyncButton: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    synced: number;
    failed: number;
  } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await formDB.syncWithBackend();
      setSyncResult(result);
      
      if (result.success) {
        alert(`✅ ${result.synced} form başarıyla senkronize edildi!`);
      } else if (result.failed > 0) {
        alert(`⚠️ ${result.failed} form senkronize edilemedi. Lütfen tekrar deneyin.`);
      } else {
        alert('ℹ️ Senkronize edilecek form bulunamadı.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Senkronizasyon sırasında bir hata oluştu.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors
          ${isSyncing 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium
        `}
      >
        {isSyncing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Senkronize Ediliyor...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Offline Formları Senkronize Et
          </>
        )}
      </button>

      {syncResult && (
        <div className="text-sm text-gray-600">
          Son senkronizasyon: {syncResult.synced} başarılı, {syncResult.failed} başarısız
        </div>
      )}
    </div>
  );
};

export default SyncButton;