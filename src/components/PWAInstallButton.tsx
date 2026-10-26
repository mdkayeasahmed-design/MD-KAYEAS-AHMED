import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on the home screen
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Installed on Phone</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition animate-pulse"
          title="Directly install HPBD Operations onto your Android home screen"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on Phone</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition border border-slate-700"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Add to iOS</span>
        </button>
      ) : (
        <button
          onClick={() => setShowAndroidGuide(true)}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          title="Install app icon to your Android phone home screen"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on Phone (PWA)</span>
        </button>
      )}

      {/* Android Direct Installation Modal Guide */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ফোনে সরাসরি ইন্সটল করার নিয়ম
                </h3>
                <p className="text-[11px] text-slate-500">Android Chrome / Samsung Internet</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                <span>আপনার ফোনের ব্রাউজারের (যেমন Google Chrome) উপরে ডানদিকের <strong>তিনটি ডট (⋮ Menu)</strong> বাটনে চাপ দিন।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                <span>মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                <span>পপ-আপে <strong>"Install"</strong> বাটনে চাপ দিন। সাথে সাথে আপনার ফোনের অ্যাপ লিস্ট ও হোম স্ক্রিনে HPBD Operations অ্যাপ যুক্ত হয়ে যাবে!</span>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300">
              ✓ ব্রাউজারের অ্যাড্রেস বার ছাড়া ফুলস্ক্রিন নেটিভ অ্যাপের মত চলবে。<br />
              ✓ কোনো পিসি বা কম্পিউটার ছাড়াই সরাসরি ফোন থেকে চালানো যাবে।
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}

      {/* iOS Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
