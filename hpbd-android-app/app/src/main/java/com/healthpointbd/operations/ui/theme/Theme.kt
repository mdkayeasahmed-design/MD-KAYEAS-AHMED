package com.healthpointbd.operations.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = HpbdCrimson,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFEE2E2),
    onPrimaryContainer = HpbdCrimsonDark,
    secondary = MediumSlate,
    onSecondary = Color.White,
    background = BackgroundLight,
    onBackground = DarkCharcoal,
    surface = SurfaceLight,
    onSurface = DarkCharcoal,
    outline = BorderLight,
    error = StatusCancelled,
    onError = Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = HpbdCrimsonLight,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF450A0A),
    onPrimaryContainer = Color(0xFFFECACA),
    secondary = LightSlate,
    background = Color(0xFF0F172A),
    onBackground = Color(0xFFF8FAFC),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFF8FAFC),
    outline = Color(0xFF334155),
    error = Color(0xFFF87171)
)

@Composable
fun HpbdTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
