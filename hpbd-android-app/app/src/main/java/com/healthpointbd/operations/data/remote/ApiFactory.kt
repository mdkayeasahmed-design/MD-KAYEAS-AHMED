package com.healthpointbd.operations.data.remote

import android.util.Base64
import com.healthpointbd.operations.data.security.CredentialStore
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class ApiFactory(private val credentialStore: CredentialStore) {

    fun createService(): HpbdApiService {
        val baseUrl = credentialStore.getBaseUrl()
        require(baseUrl.startsWith("https://")) {
            "Security violation: Mobile API requires strict HTTPS."
        }

        val authInterceptor = Interceptor { chain ->
            val credentials = "${credentialStore.getUsername()}:${credentialStore.getAppPassword()}"
            val encodedAuth = Base64.encodeToString(credentials.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)

            val request = chain.request().newBuilder()
                .header("Authorization", "Basic $encodedAuth")
                .header("Accept", "application/json")
                .header("User-Agent", "HPBD-Operations-Android/1.2.0")
                .build()

            chain.proceed(request)
        }

        val loggingInterceptor = HttpLoggingInterceptor().apply {
            // Level BASIC avoids leaking sensitive auth headers or customer details in logs
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .retryOnConnectionFailure(true)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(HpbdApiService::class.java)
    }
}
