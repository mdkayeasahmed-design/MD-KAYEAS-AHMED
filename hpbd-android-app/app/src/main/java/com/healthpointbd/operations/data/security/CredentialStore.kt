package com.healthpointbd.operations.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Android Keystore-backed secure credential storage.
 * Encrypts WordPress credentials using AES256-GCM.
 */
class CredentialStore(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_FILENAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveCredentials(baseUrl: String, username: String, appPassword: String) {
        val normalizedUrl = baseUrl.trim().trimEnd('/') + "/"
        securePrefs.edit()
            .putString(KEY_BASE_URL, normalizedUrl)
            .putString(KEY_USERNAME, username.trim())
            .putString(KEY_APP_PASSWORD, appPassword.replace(" ", "").trim())
            .apply()
    }

    fun getBaseUrl(): String = securePrefs.getString(KEY_BASE_URL, "") ?: ""
    fun getUsername(): String = securePrefs.getString(KEY_USERNAME, "") ?: ""
    fun getAppPassword(): String = securePrefs.getString(KEY_APP_PASSWORD, "") ?: ""

    fun isConfigured(): Boolean {
        val url = getBaseUrl()
        return url.startsWith("https://") &&
                getUsername().isNotBlank() &&
                getAppPassword().isNotBlank()
    }

    fun clear() {
        securePrefs.edit().clear().apply()
    }

    // App Preferences (Language & UI)
    fun setLanguage(lang: String) {
        securePrefs.edit().putString(KEY_LANGUAGE, lang).apply()
    }

    fun getLanguage(): String = securePrefs.getString(KEY_LANGUAGE, "bn") ?: "bn"

    companion object {
        private const val PREFS_FILENAME = "hpbd_encrypted_vault"
        private const val KEY_BASE_URL = "secure_base_url"
        private const val KEY_USERNAME = "secure_username"
        private const val KEY_APP_PASSWORD = "secure_app_password"
        private const val KEY_LANGUAGE = "pref_app_language"
    }
}
