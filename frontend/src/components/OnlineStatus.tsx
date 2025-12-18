'use client';

import { useState, useEffect } from 'react';

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
        <span className="text-sm text-gray-500">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm">{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
    </div>
  );
}