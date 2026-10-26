package com.healthpointbd.operations.ui.screens

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.webkit.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WebBrowserScreen(
    baseUrl: String,
    targetPath: String = "hpbd-operations/?hpbd_tab=create",
    onSwitchToNative: () -> Unit
) {
    var currentPath by remember { mutableStateOf(targetPath) }
    val fullUrl = remember(baseUrl, currentPath) {
        val cleanBase = baseUrl.trim().trimEnd('/')
        "$cleanBase/$currentPath"
    }

    var webView: WebView? by remember { mutableStateOf(null) }
    var isLoading by remember { mutableStateOf(true) }
    var pageTitle by remember { mutableStateOf("HPBD Operations Web Portal") }
    var canGoBack by remember { mutableStateOf(false) }

    val portalTabs = listOf(
        "Create Order" to "hpbd-operations/?hpbd_tab=create",
        "All Orders" to "hpbd-operations/?hpbd_tab=orders",
        "Customization" to "hpbd-operations/?hpbd_tab=customization",
        "Production" to "hpbd-operations/?hpbd_tab=production",
        "Print Center" to "hpbd-operations/?hpbd_tab=print"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(pageTitle, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(baseUrl, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                actions = {
                    IconButton(onClick = { webView?.reload() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Reload")
                    }
                    IconButton(onClick = onSwitchToNative) {
                        Icon(Icons.Default.PhoneAndroid, contentDescription = "Switch to Native Mode")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Quick Portal Tab Bar
            ScrollableTabRow(
                selectedTabIndex = portalTabs.indexOfFirst { it.second == currentPath }.coerceAtLeast(0),
                edgePadding = 8.dp
            ) {
                portalTabs.forEach { (title, path) ->
                    Tab(
                        selected = currentPath == path,
                        onClick = {
                            currentPath = path
                            webView?.loadUrl("${baseUrl.trim().trimEnd('/')}/$path")
                        },
                        text = { Text(title, style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }

            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.allowContentAccess = true
                        settings.setSupportZoom(true)
                        settings.builtInZoomControls = true
                        settings.displayZoomControls = false

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                isLoading = true
                                canGoBack = view?.canGoBack() == true
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                isLoading = false
                                pageTitle = view?.title ?: "HPBD Operations"
                                canGoBack = view?.canGoBack() == true
                            }

                            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                val url = request?.url?.toString() ?: ""
                                // Security domain restriction: keep within WordPress host
                                if (url.startsWith(baseUrl)) {
                                    return false
                                }
                                return true // Block navigation to untrusted external sites
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onReceivedTitle(view: WebView?, title: String?) {
                                if (!title.isNullOrBlank()) {
                                    pageTitle = title
                                }
                            }
                        }

                        loadUrl(fullUrl)
                        webView = this
                    }
                },
                update = {
                    webView = it
                }
            )
        }
    }
}
