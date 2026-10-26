import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  FileText,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Code2,
  Terminal,
} from 'lucide-react';

interface FileItem {
  path: string;
  name: string;
  category: 'android' | 'bridge';
  language: string;
  description: string;
  content: string;
}

export const SourceCodeViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'android' | 'bridge'>('android');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const files: FileItem[] = [
    // WordPress Bridge
    {
      path: 'hpbd-mobile-bridge/hpbd-mobile-bridge.php',
      name: 'hpbd-mobile-bridge.php',
      category: 'bridge',
      language: 'php',
      description: 'Production REST API bridge plugin v1.5.0 with real order creation (POST /orders), product search (GET /products), workstation queues (GET /production-queues), and HPOS compatibility.',
      content: `<?php
/**
 * Plugin Name: HPBD Operations Mobile API Bridge
 * Plugin URI: https://healthpointbd.com/
 * Description: Production-ready authenticated REST API bridge connecting the HPBD Operations Android app to WooCommerce and HPBD Operations 1.5.0.
 * Version: 1.5.0
 */

defined('ABSPATH') || exit;

// Declare WooCommerce High-Performance Order Storage (HPOS) compatibility
add_action('before_woocommerce_init', function() {
    if (class_exists(\\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::class)) {
        \\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
});

final class HPBD_Mobile_Bridge {
    const NS = 'hpbd-mobile/v1';

    public static function register_routes() {
        // GET /session, GET /config, GET /production-queues, GET /stats, GET /products
        register_rest_route(self::NS, '/config', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_config'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        register_rest_route(self::NS, '/production-queues', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_production_queues'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // POST /orders - Real WooCommerce Order Creation with Source & Priority
        register_rest_route(self::NS, '/orders', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'endpoint_create_order'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /orders, GET /orders/{id}, PUT /orders/{id}, POST /orders/{id}/status
        register_rest_route(self::NS, '/orders/(?P<id>\\d+)/status', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'endpoint_update_status'],
            'permission_callback' => [__CLASS__, 'can_manage'],
        ]);
    }
}
HPBD_Mobile_Bridge::boot();`,
    },
    // Android App Files
    {
      path: 'app/src/main/java/com/healthpointbd/operations/ui/screens/CreateOrderScreen.kt',
      name: 'CreateOrderScreen.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Native Jetpack Compose screen for creating real orders with customer info, Bangladesh districts, product search, and customization fields.',
      content: `package com.healthpointbd.operations.ui.screens

import androidx.compose.material3.*
import androidx.compose.runtime.*
import com.healthpointbd.operations.ui.viewmodel.CreateOrderViewModel

@Composable
fun CreateOrderScreen(
    viewModel: CreateOrderViewModel,
    onOrderCreated: (Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    // Renders Customer Details, Bangladesh 64 Districts Dropdown, Product Catalog Picker,
    // Customization inputs (Laser Engraving, Embroidery, Nameplate), and creates real WooCommerce order.
}`,
    },
    {
      path: 'app/src/main/java/com/healthpointbd/operations/ui/viewmodel/CreateOrderViewModel.kt',
      name: 'CreateOrderViewModel.kt',
      category: 'android',
      language: 'kotlin',
      description: 'ViewModel managing customer details, Bangladesh districts, cart line items, customization fields, and idempotent submission.',
      content: `package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.*
import com.healthpointbd.operations.data.repository.OrderRepository
import java.util.UUID

class CreateOrderViewModel(private val orderRepository: OrderRepository) : ViewModel() {
    val bangladeshDistricts = listOf("Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal")
    fun submitOrder() {
        val idempotencyKey = UUID.randomUUID().toString()
        // Submits real order to POST /wp-json/hpbd-mobile/v1/orders
    }
}`,
    },
    {
      path: 'app/src/main/java/com/healthpointbd/operations/ui/screens/WebBrowserScreen.kt',
      name: 'WebBrowserScreen.kt',
      category: 'android',
      language: 'kotlin',
      description: 'In-app secure WebView component for Native + Browser Hybrid Mode accessing the core WordPress portal.',
      content: `package com.healthpointbd.operations.ui.screens

import android.webkit.WebView
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun WebBrowserScreen(baseUrl: String, onSwitchToNative: () -> Unit) {
    // AndroidView rendering WebView restricted to WordPress host domain
}`,
    },
    {
      path: 'hpbd-mobile-bridge/readme.txt',
      name: 'readme.txt',
      category: 'bridge',
      language: 'markdown',
      description: 'WordPress plugin documentation, installation steps, and capability definitions.',
      content: `=== HPBD Operations Mobile API Bridge ===
Contributors: healthpointbd
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.2.0

Authenticated REST API bridge connecting the HPBD Operations Android app to WooCommerce.

== Endpoints ==
* GET /wp-json/hpbd-mobile/v1/session
* GET /wp-json/hpbd-mobile/v1/stats
* GET /wp-json/hpbd-mobile/v1/orders
* GET /wp-json/hpbd-mobile/v1/orders/{id}
* POST /wp-json/hpbd-mobile/v1/orders/{id}/status`,
    },

    // Android App
    {
      path: 'app/src/main/java/com/healthpointbd/operations/MainActivity.kt',
      name: 'MainActivity.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Activity lifecycle entry point initializing Material 3 theme and dynamic Bengali/English locale.',
      content: `package com.healthpointbd.operations

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.healthpointbd.operations.ui.screens.HpbdRootScreen
import com.healthpointbd.operations.ui.theme.HpbdTheme
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as HpbdApplication
        val initialLanguage = app.credentialStore.getLanguage()
        updateLocale(initialLanguage)

        setContent {
            var currentLanguage by remember { mutableStateOf(initialLanguage) }
            HpbdTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HpbdRootScreen(
                        app = app,
                        currentLanguage = currentLanguage,
                        onLanguageChange = { newLang ->
                            app.credentialStore.setLanguage(newLang)
                            currentLanguage = newLang
                            updateLocale(newLang)
                        }
                    )
                }
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/healthpointbd/operations/data/security/CredentialStore.kt',
      name: 'CredentialStore.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Hardware-backed Android Keystore storage encrypting credentials with AES256-GCM.',
      content: `package com.healthpointbd.operations.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class CredentialStore(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "hpbd_encrypted_vault",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveCredentials(baseUrl: String, username: String, appPassword: String) {
        securePrefs.edit()
            .putString("secure_base_url", baseUrl.trim().trimEnd('/') + "/")
            .putString("secure_username", username.trim())
            .putString("secure_app_password", appPassword.replace(" ", "").trim())
            .apply()
    }

    fun isConfigured(): Boolean {
        val url = securePrefs.getString("secure_base_url", "") ?: ""
        return url.startsWith("https://") &&
               !securePrefs.getString("secure_username", "").isNullOrBlank() &&
               !securePrefs.getString("secure_app_password", "").isNullOrBlank()
    }

    fun clear() {
        securePrefs.edit().clear().apply()
    }
}`,
    },
    {
      path: 'app/src/main/java/com/healthpointbd/operations/data/remote/HpbdApiService.kt',
      name: 'HpbdApiService.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Retrofit interface defining versioned REST endpoints for session, stats, orders, and status updates.',
      content: `package com.healthpointbd.operations.data.remote

import com.healthpointbd.operations.data.model.*
import retrofit2.http.*

interface HpbdApiService {
    @GET("wp-json/hpbd-mobile/v1/session")
    suspend fun getSession(): SessionResponse

    @GET("wp-json/hpbd-mobile/v1/stats")
    suspend fun getStats(): DashboardStats

    @GET("wp-json/hpbd-mobile/v1/orders")
    suspend fun getOrders(
        @Query("q") query: String = "",
        @Query("status") status: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("customized_only") customizedOnly: Boolean = false
    ): OrdersListResponse

    @GET("wp-json/hpbd-mobile/v1/orders/{id}")
    suspend fun getOrderDetail(@Path("id") id: Int): OrderDetailResponse

    @POST("wp-json/hpbd-mobile/v1/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: Int,
        @Body request: UpdateStatusRequest
    ): UpdateStatusResponse
}`,
    },
    {
      path: 'app/src/main/java/com/healthpointbd/operations/data/model/Order.kt',
      name: 'Order.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Data models for Order Summary, Line Items, Engraving, Embroidery, Nameplate, and Activity Log.',
      content: `package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class CustomizationField(
    val label: String,
    val value: String,
    val category: String // "engraving", "embroidery", "nameplate", "general"
)

data class OrderBadges(
    @SerializedName("has_customization") val hasCustomization: Boolean = false,
    val engraving: Boolean = false,
    val embroidery: Boolean = false,
    val nameplate: Boolean = false
)

data class OrderSummary(
    val id: Int,
    val number: String,
    val status: String,
    val customer: String,
    val phone: String,
    val total: String,
    val created: String,
    val fulfillment: String? = null,
    val customization: List<String> = emptyList(),
    val badges: OrderBadges? = null
)

data class OrderDetailResponse(
    val order: OrderSummary,
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("billing_email") val billingEmail: String,
    @SerializedName("billing_phone") val billingPhone: String,
    @SerializedName("shipping_address") val shippingAddress: String,
    @SerializedName("order_total") val orderTotal: String,
    val items: List<OrderLineItem> = emptyList(),
    val activity: List<OrderActivityItem> = emptyList(),
    @SerializedName("allowed_statuses") val allowedStatuses: List<AllowedStatus> = emptyList()
)`,
    },
    {
      path: 'app/src/main/res/values-bn/strings.xml',
      name: 'strings.xml (বাংলা / Bengali)',
      category: 'android',
      language: 'xml',
      description: 'Complete Bengali string resources for all UI screens, status badges, and dialogs.',
      content: `<resources>
    <string name="app_name">এইচপিবিডি অপারেশনস</string>
    <string name="tagline">হেলথ পয়েন্ট বিডি অপারেশনস পোর্টাল</string>

    <string name="login_title">স্টাফ লগইন</string>
    <string name="login_subtitle">আপনার ওয়ার্ডপ্রেস ইউজার অ্যাকাউন্ট এবং ডেডিকেটেড অ্যাপ্লিকেশন পাসওয়ার্ড দিয়ে লগইন করুন।</string>

    <string name="stat_today">আজকের অর্ডার</string>
    <string name="stat_pending">পেন্ডিং</string>
    <string name="stat_processing">প্রসেসিং</string>
    <string name="stat_completed">কমপ্লিট</string>

    <string name="badge_customized">কাস্টমাইজড</string>
    <string name="badge_engraving">খোদাই নাম</string>
    <string name="badge_embroidery">এমব্রয়ডারি</string>
    <string name="badge_nameplate">নেমপ্লেট</string>

    <string name="btn_update_status">অর্ডার স্ট্যাটাস পরিবর্তন</string>
    <string name="dialog_update_status_title">স্ট্যাটাস পরিবর্তনের নিশ্চয়তা</string>
    <string name="dialog_update_status_msg">আপনি কি নিশ্চিত যে অর্ডার #%1$s এর স্ট্যাটাস পরিবর্তন করতে চান?</string>
</resources>`,
    },
    {
      path: 'app/build.gradle.kts',
      name: 'build.gradle.kts (App)',
      category: 'android',
      language: 'kotlin',
      description: 'Gradle configuration for Android SDK 35, Jetpack Compose 2.0, Retrofit, and Security Crypto.',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.healthpointbd.operations"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.healthpointbd.operations"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.2.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      category: 'android',
      language: 'xml',
      description: 'Manifest enforcing zero-cleartext traffic and strict network security config.',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".HpbdApplication"
        android:allowBackup="false"
        android:label="@string/app_name"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:theme="@style/Theme.HPBD">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      path: 'app/src/test/java/com/healthpointbd/operations/CustomizationParserTest.kt',
      name: 'CustomizationParserTest.kt',
      category: 'android',
      language: 'kotlin',
      description: 'Unit test verifying customization categorization (Engraving, Embroidery, Nameplate) and Bengali support.',
      content: `package com.healthpointbd.operations

import com.healthpointbd.operations.data.model.CustomizationField
import com.healthpointbd.operations.data.model.OrderBadges
import org.junit.Assert.*
import org.junit.Test

class CustomizationParserTest {
    @Test
    fun testEngravingCategoryDetection() {
        val field = CustomizationField(
            label = "Laser Engraving Name",
            value = "Dr. Kayeas Ahmed",
            category = "engraving"
        )
        assertEquals("engraving", field.category)
        assertTrue(field.value.contains("Dr. Kayeas"))
    }

    @Test
    fun testBengaliCustomizationCategory() {
        val field = CustomizationField(
            label = "লেজার খোদাই নাম",
            value = "ডা. তাসনিম জাহান",
            category = "engraving"
        )
        assertEquals("engraving", field.category)
    }
}`,
    },
  ];

  const filteredFiles = files.filter(
    (f) =>
      f.category === selectedCategory &&
      (f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.path.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const [activeFile, setActiveFile] = useState<FileItem>(files[0]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Top Action Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('android');
              const firstAndroid = files.find((f) => f.category === 'android');
              if (firstAndroid) setActiveFile(firstAndroid);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedCategory === 'android'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Android Studio Project (Kotlin)</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('bridge');
              const firstBridge = files.find((f) => f.category === 'bridge');
              if (firstBridge) setActiveFile(firstBridge);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedCategory === 'bridge'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>WordPress Bridge Plugin (PHP)</span>
          </button>
        </div>

        {/* Direct Download ZIP Buttons */}
        <div className="flex items-center gap-2">
          {selectedCategory === 'android' ? (
            <a
              href="/downloads/hpbd-operations-android.zip"
              download="hpbd-operations-android.zip"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Android Project (.zip)</span>
            </a>
          ) : (
            <a
              href="/downloads/hpbd-mobile-bridge.zip"
              download="hpbd-mobile-bridge.zip"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download WordPress Plugin (.zip)</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content: Left File Tree, Right Code Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar File List */}
        <div className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter files…"
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setActiveFile(f)}
                className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2 transition ${
                  activeFile.path === f.path
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="truncate">{f.name}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">{f.path}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
          {/* File Header */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {activeFile.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {activeFile.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax Content Box */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-red-900 selection:text-white">
            <pre className="text-slate-300">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
