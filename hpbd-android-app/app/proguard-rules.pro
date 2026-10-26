# Proguard rules for HPBD Operations Android App

# Retrofit & OkHttp
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions
-keepattributes *Annotation*

# Gson rules for model classes
-keep class com.healthpointbd.operations.data.model.** { *; }
-keepclassmembers class com.healthpointbd.operations.data.model.** { *; }

# Security Crypto
-keep class androidx.security.crypto.** { *; }
