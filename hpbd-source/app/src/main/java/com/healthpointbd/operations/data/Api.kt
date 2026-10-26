package com.healthpointbd.operations.data

import android.content.Context
import android.util.Base64
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

data class ApiUser(val id: Int, val name: String, val roles: List<String> = emptyList(), val capabilities: Map<String, Boolean> = emptyMap())
data class SessionResponse(val user: ApiUser, val permissions: Map<String, Boolean> = emptyMap())
data class OrderSummary(val id: Int, val number: String, val status: String, val customer: String, val phone: String, val total: String, val created: String, val fulfillment: String = "", val customization: List<String> = emptyList())
data class OrdersResponse(val orders: List<OrderSummary>, val total: Int, val page: Int, val pages: Int)
data class ActivityItem(val date: String, val author: String, val content: String, val customerNote: Boolean = false)
data class OrderDetailResponse(val order: OrderSummary, val address: String, val items: List<String>, val activity: List<ActivityItem>, val allowedStatuses: List<String> = emptyList())
data class StatusRequest(val status: String)
data class MessageResponse(val message: String)

interface HpbdApi {
    @GET("wp-json/hpbd-mobile/v1/session") suspend fun session(): SessionResponse
    @GET("wp-json/hpbd-mobile/v1/orders") suspend fun orders(@Query("q") query: String = "", @Query("page") page: Int = 1): OrdersResponse
    @GET("wp-json/hpbd-mobile/v1/orders/{id}") suspend fun order(@Path("id") id: Int): OrderDetailResponse
    @POST("wp-json/hpbd-mobile/v1/orders/{id}/status") suspend fun updateStatus(@Path("id") id: Int, @Body body: StatusRequest): MessageResponse
}

class CredentialStore(context: Context) {
    private val prefs = EncryptedSharedPreferences.create(context, "hpbd_secure_login", MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(), EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)
    fun save(baseUrl: String, username: String, appPassword: String) { prefs.edit().putString("base", baseUrl.trim().trimEnd('/') + "/").putString("username", username.trim()).putString("password", appPassword.replace(" ", "")).apply() }
    fun base() = prefs.getString("base", "") ?: ""
    fun username() = prefs.getString("username", "") ?: ""
    fun password() = prefs.getString("password", "") ?: ""
    fun clear() = prefs.edit().clear().apply()
    fun configured() = base().startsWith("https://") && username().isNotBlank() && password().isNotBlank()
}

class ApiFactory(private val store: CredentialStore) {
    fun create(): HpbdApi {
        require(store.base().startsWith("https://")) { "Use your site's HTTPS URL." }
        val client = OkHttpClient.Builder().connectTimeout(20, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).addInterceptor(Interceptor { chain ->
            val token = Base64.encodeToString("${store.username()}:${store.password()}".toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
            val request = chain.request().newBuilder().header("Authorization", "Basic $token").header("Accept", "application/json").build()
            chain.proceed(request)
        }).build()
        return Retrofit.Builder().baseUrl(store.base()).client(client).addConverterFactory(GsonConverterFactory.create()).build().create(HpbdApi::class.java)
    }
}
