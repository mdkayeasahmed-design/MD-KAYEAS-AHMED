import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-bounce">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>অফলাইন মোড — ক্যাশ করা লোকাল ডেটা প্রদর্শিত হচ্ছে</span>
    </div>
  );
};
