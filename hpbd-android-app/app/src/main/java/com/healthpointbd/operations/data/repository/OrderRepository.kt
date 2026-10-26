package com.healthpointbd.operations.data.repository

import com.healthpointbd.operations.data.model.*
import com.healthpointbd.operations.data.remote.ApiFactory
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.security.CredentialStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import retrofit2.HttpException
import java.io.IOException

class OrderRepository(private val credentialStore: CredentialStore) {

    private fun getService() = ApiFactory(credentialStore).createService()

    fun getDashboardStats(): Flow<Resource<DashboardStats>> = flow {
        emit(Resource.Loading)
        try {
            val stats = getService().getStats()
            emit(Resource.Success(stats))
        } catch (e: HttpException) {
            emit(Resource.Error("Server error (${e.code()}): ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Cannot reach server."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to load dashboard metrics."))
        }
    }.flowOn(Dispatchers.IO)

    fun searchProducts(query: String = "", limit: Int = 30): Flow<Resource<List<ProductItem>>> = flow {
        emit(Resource.Loading)
        try {
            val resp = getService().getProducts(query = query, limit = limit)
            emit(Resource.Success(resp.products))
        } catch (e: HttpException) {
            emit(Resource.Error("Product search failed (${e.code()}): ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Unable to load products."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to load product catalog."))
        }
    }.flowOn(Dispatchers.IO)

    fun createOrder(request: CreateOrderRequest, idempotencyKey: String): Flow<Resource<CreateOrderResponse>> = flow {
        emit(Resource.Loading)
        try {
            val resp = getService().createOrder(idempotencyKey = idempotencyKey, request = request)
            if (resp.success) {
                emit(Resource.Success(resp))
            } else {
                emit(Resource.Error(resp.message))
            }
        } catch (e: HttpException) {
            val msg = when (e.code()) {
                400 -> "Validation error: Check customer details and product selection."
                401 -> "Authentication expired. Please re-login."
                403 -> "Permission denied: Lacks order creation capability."
                429 -> "Rate limit reached. Please wait a moment."
                else -> "Order creation failed (${e.code()}): ${e.message()}"
            }
            emit(Resource.Error(msg, e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Order creation could not be completed. Please check your connection."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to create order."))
        }
    }.flowOn(Dispatchers.IO)

    fun getOrders(
        query: String = "",
        status: String = "",
        page: Int = 1,
        limit: Int = 20,
        customizedOnly: Boolean = false
    ): Flow<Resource<OrdersListResponse>> = flow {
        emit(Resource.Loading)
        try {
            val resp = getService().getOrders(
                query = query,
                status = status,
                page = page,
                limit = limit,
                customizedOnly = customizedOnly
            )
            emit(Resource.Success(resp))
        } catch (e: HttpException) {
            emit(Resource.Error("Server error (${e.code()}) while fetching orders.", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Please check your connection."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to retrieve orders."))
        }
    }.flowOn(Dispatchers.IO)

    fun getOrderDetail(orderId: Int): Flow<Resource<OrderDetailResponse>> = flow {
        emit(Resource.Loading)
        try {
            val detail = getService().getOrderDetail(orderId)
            emit(Resource.Success(detail))
        } catch (e: HttpException) {
            emit(Resource.Error("Server error (${e.code()}): Order not found or unauthorized.", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Could not load order details."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to load order."))
        }
    }.flowOn(Dispatchers.IO)

    fun updateOrder(orderId: Int, updates: Map<String, Any>): Flow<Resource<UpdateStatusResponse>> = flow {
        emit(Resource.Loading)
        try {
            val resp = getService().updateOrder(orderId, updates)
            emit(Resource.Success(resp))
        } catch (e: HttpException) {
            emit(Resource.Error("Update failed (${e.code()}): ${e.message()}", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Unable to update order."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to update order."))
        }
    }.flowOn(Dispatchers.IO)

    fun updateOrderStatus(
        orderId: Int,
        newStatus: String,
        auditNote: String = ""
    ): Flow<Resource<UpdateStatusResponse>> = flow {
        emit(Resource.Loading)
        try {
            val req = UpdateStatusRequest(status = newStatus, note = auditNote)
            val resp = getService().updateOrderStatus(orderId, req)
            emit(Resource.Success(resp))
        } catch (e: HttpException) {
            val msg = when (e.code()) {
                403 -> "Permission denied: 'hpbd_ops_manage' capability required."
                404 -> "Order not found."
                400 -> "Invalid order status requested."
                else -> "Update failed (${e.code()}): ${e.message()}"
            }
            emit(Resource.Error(msg, e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error: Update could not reach server."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to update status."))
        }
    }.flowOn(Dispatchers.IO)

    fun getDailySheet(date: String = "today", status: String = "all"): Flow<Resource<DailySheetResponse>> = flow {
        emit(Resource.Loading)
        try {
            val resp = getService().getDailySheet(date = date, status = status)
            emit(Resource.Success(resp))
        } catch (e: HttpException) {
            emit(Resource.Error("Failed to fetch daily sheet (${e.code()}).", e.code()))
        } catch (e: IOException) {
            emit(Resource.Error("Network error loading report."))
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Failed to load report."))
        }
    }.flowOn(Dispatchers.IO)
}
