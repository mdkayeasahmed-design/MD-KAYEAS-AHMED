package com.healthpointbd.operations.data.remote

import com.healthpointbd.operations.data.model.*
import retrofit2.http.*

interface HpbdApiService {

    @GET("wp-json/hpbd-mobile/v1/session")
    suspend fun getSession(): SessionResponse

    @GET("wp-json/hpbd-mobile/v1/stats")
    suspend fun getStats(): DashboardStats

    @GET("wp-json/hpbd-mobile/v1/products")
    suspend fun getProducts(
        @Query("q") query: String = "",
        @Query("limit") limit: Int = 30,
        @Query("page") page: Int = 1
    ): ProductsResponse

    @GET("wp-json/hpbd-mobile/v1/orders")
    suspend fun getOrders(
        @Query("q") query: String = "",
        @Query("status") status: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("customized_only") customizedOnly: Boolean = false
    ): OrdersListResponse

    @POST("wp-json/hpbd-mobile/v1/orders")
    suspend fun createOrder(
        @Header("X-Idempotency-Key") idempotencyKey: String,
        @Body request: CreateOrderRequest
    ): CreateOrderResponse

    @GET("wp-json/hpbd-mobile/v1/orders/{id}")
    suspend fun getOrderDetail(@Path("id") id: Int): OrderDetailResponse

    @PUT("wp-json/hpbd-mobile/v1/orders/{id}")
    suspend fun updateOrder(
        @Path("id") id: Int,
        @Body body: Map<String, Any>
    ): UpdateStatusResponse

    @POST("wp-json/hpbd-mobile/v1/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: Int,
        @Body request: UpdateStatusRequest
    ): UpdateStatusResponse

    @GET("wp-json/hpbd-mobile/v1/reports/daily-sheet")
    suspend fun getDailySheet(
        @Query("date") date: String = "today",
        @Query("status") status: String = "all"
    ): DailySheetResponse
}
