package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class CreateOrderCustomization(
    val label: String,
    val value: String,
    val category: String = "general"
)

data class CreateOrderLineItem(
    @SerializedName("product_id") val productId: Int,
    @SerializedName("variation_id") val variationId: Int? = null,
    val quantity: Int = 1,
    @SerializedName("unit_price") val unitPrice: Double? = null,
    val customizations: List<CreateOrderCustomization> = emptyList()
)

data class CreateOrderRequest(
    @SerializedName("customer_name") val customerName: String,
    val phone: String,
    val email: String? = null,
    val address: String,
    val district: String,
    val upazila: String? = null,
    val status: String = "processing",
    @SerializedName("payment_method") val paymentMethod: String = "cod",
    @SerializedName("delivery_charge") val deliveryCharge: Double = 0.0,
    val discount: Double = 0.0,
    @SerializedName("customer_note") val customerNote: String? = null,
    @SerializedName("internal_note") val internalNote: String? = null,
    val source: String = "Manual",
    val priority: String = "Normal",
    val items: List<CreateOrderLineItem> = emptyList()
)

data class CreateOrderResponse(
    val success: Boolean,
    val message: String,
    @SerializedName("order_id") val orderId: Int,
    val order: OrderSummary? = null,
    val idempotent: Boolean = false
)

data class DailySheetItem(
    val id: Int,
    val number: String,
    val status: String,
    val customer: String,
    val phone: String,
    val city: String? = null,
    val total: String,
    val customizations: List<String> = emptyList(),
    @SerializedName("items_count") val itemsCount: Int = 1
)

data class DailySheetResponse(
    val date: String,
    @SerializedName("total_orders") val totalOrders: Int,
    val orders: List<DailySheetItem> = emptyList()
)
