package com.healthpointbd.operations

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

    private fun updateLocale(languageCode: String) {
        val locale = Locale(languageCode)
        Locale.setDefault(locale)
        val config = Configuration(resources.configuration)
        config.setLocale(locale)
        resources.updateConfiguration(config, resources.displayMetrics)
    }
}
