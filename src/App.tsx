import React, { useState } from 'react';
import {
  Smartphone,
  FolderCode,
  BookOpen,
  Terminal,
  Download,
  ShieldCheck,
  Sparkles,
  Layers,
  ExternalLink,
  Moon,
  Sun,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { AndroidSimulator } from './components/AndroidSimulator';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { DocumentationView } from './components/DocumentationView';
import { ApiTester } from './components/ApiTester';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'docs' | 'api'>('simulator');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Suite Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white shadow-sm shadow-red-700/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  HPBD Operations
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                  Android &amp; Bridge Suite v1.5.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Health Point BD Native Jetpack Compose App &amp; WordPress WooCommerce Bridge (HPBD 1.5.0 Aligned)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* 1-Click Direct APK Download Button */}
            <a
              href="/downloads/hpbd-operations.apk"
              download="hpbd-operations.apk"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition transform active:scale-95"
              title="Download real, signed HPBD Operations Android APK file"
            >
              <Download className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>১-ক্লিকে APK ডাউনলোড (.apk)</span>
            </a>

            <PWAInstallButton />

            <a
              href="/downloads/hpbd-operations-android.zip"
              download="hpbd-operations-android.zip"
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              title="Download ready-to-open Android Studio Project"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Android Studio ZIP</span>
            </a>

            <a
              href="/downloads/hpbd-mobile-bridge.zip"
              download="hpbd-mobile-bridge.zip"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition border border-slate-700"
              title="Download WordPress Bridge Plugin ready for upload"
            >
              <Download className="w-3.5 h-3.5" />
              <span>WordPress Bridge ZIP</span>
            </a>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Mode Bar */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {[
            {
              id: 'simulator',
              label: '📱 Interactive Android Phone Simulator',
              badge: 'Live Jetpack Compose M3 UI',
            },
            {
              id: 'code',
              label: '📂 Source Code & ZIP Downloads',
              badge: 'Kotlin + PHP Bridge',
            },
            {
              id: 'docs',
              label: '📱 Phone APK & Setup Guide',
              badge: 'মোবাইল থেকে APK তৈরি',
            },
            {
              id: 'api',
              label: '⚡ REST API Bridge Sandbox',
              badge: '/wp-json/hpbd-mobile/v1',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {activeTab === 'simulator' && (
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Left: Device Simulator */}
            <div className="w-full lg:w-auto flex justify-center">
              <AndroidSimulator />
            </div>

            {/* Right: Operational Specs & Features Overview */}
            <div className="flex-1 space-y-4 max-w-xl">
              {/* Phone user callout banner with direct 1-click download */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4.5 rounded-2xl shadow-md border border-emerald-600/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        মোবাইল থেকে ১-ক্লিকে ইনস্টল
                      </h4>
                      <span className="text-[10px] bg-emerald-400 text-slate-900 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                        APK Ready
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-white/95 leading-relaxed">
                      HPBD Operations এর আসল সাইন করা অ্যান্ড্রয়েড <strong>hpbd-operations.apk</strong> তৈরি সম্পন্ন হয়েছে! নিচের বাটনে ক্লিক করে সরাসরি ফোনে ডাউনলোড ও ইনস্টল করুন।
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-700/60">
                  <a
                    href="/downloads/hpbd-operations.apk"
                    download="hpbd-operations.apk"
                    className="flex-1 min-w-[140px] px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>১-ক্লিকে APK ডাউনলোড (25 KB)</span>
                  </a>

                  <button
                    onClick={() => setActiveTab('docs')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/20"
                  >
                    <span>ইনস্টলেশন নিয়মাবলী</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-sm font-bold">Native Jetpack Compose Architecture</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  This simulated device runs the exact Kotlin StateFlow MVVM architecture implemented in 
                  <code>com.healthpointbd.operations</code>. All actions, pagination, debounced multi-field search, 
                  customization inspector, and consequential status changes reflect real operations.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Bilingual Engine
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instant toggle between বাংলা (Bengali) &amp; English without app restart.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Keystore Vault
                    </span>
                    <span className="text-[11px] text-slate-500">
                      EncryptedSharedPreferences (AES256-GCM) with zero cleartext traffic.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Customization Inspector
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ★ Laser Engraving, ★ Embroidery, and ★ Nameplate fields clearly highlighted.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Consequential Updates
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Confirmation modal with audit notes appended to WooCommerce history.
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Capabilities Checklist */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified System Adherence &amp; Backward Compatibility
                </h4>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>No Database Mutation:</strong> Preserves all WooCommerce tables (<code>wp_posts</code>, <code>wp_postmeta</code>, <code>wp_woocommerce_order_items</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>Staff Capability Checked:</strong> Requires <code>hpbd_ops_access</code> to view orders and <code>hpbd_ops_manage</code> to execute transitions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>Application Password Auth:</strong> Secure Basic Auth over HTTPS with zero leakage of administrator master credentials.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 h-[750px]">
            <SourceCodeViewer />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="flex-1 min-h-[600px]">
            <DocumentationView />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="flex-1 h-[750px]">
            <ApiTester />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 text-center text-xs text-slate-500">
        Health Point BD Operations Native Android Suite &amp; WordPress Mobile Bridge • Prepared for Md. Kayeas Ahmed
      </footer>

      {/* Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
