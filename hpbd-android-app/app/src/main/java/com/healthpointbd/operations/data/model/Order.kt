package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class OrderBadges(
    @SerializedName("has_customization") val hasCustomization: Boolean = false,
    val engraving: Boolean = false,
    val embroidery: Boolean = false,
    val nameplate: Boolean = false
)

data class OrderSummary(
    val id: Int,
    val number: String,
    val status: String,
    val customer: String,
    val phone: String,
    val email: String? = null,
    val total: String,
    val created: String,
    val fulfillment: String? = null,
    val customization: List<String> = emptyList(),
    val badges: OrderBadges? = null
)

data class OrdersListResponse(
    val orders: List<OrderSummary>,
    val total: Int,
    val page: Int,
    val pages: Int,
    val limit: Int
)

data class CustomizationField(
    val label: String,
    val value: String,
    val category: String // "engraving", "embroidery", "nameplate", "general"
)

data class OrderLineItem(
    val id: Int,
    val name: String,
    val quantity: Int,
    val subtotal: String,
    val total: String,
    val sku: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    val customizations: List<CustomizationField> = emptyList()
)

data class OrderActivityItem(
    val id: Int,
    val date: String,
    val author: String,
    val content: String,
    @SerializedName("customer_note") val customerNote: Boolean = false
)

data class AllowedStatus(
    val key: String,
    val label: String
)

data class OrderDetailResponse(
    val order: OrderSummary,
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("billing_email") val billingEmail: String,
    @SerializedName("billing_phone") val billingPhone: String,
    @SerializedName("billing_city") val billingCity: String? = null,
    @SerializedName("billing_state") val billingState: String? = null,
    @SerializedName("shipping_address") val shippingAddress: String,
    @SerializedName("customer_note") val customerNote: String? = null,
    @SerializedName("payment_method") val paymentMethod: String? = null,
    @SerializedName("shipping_method") val shippingMethod: String? = null,
    @SerializedName("shipping_total") val shippingTotal: String? = null,
    @SerializedName("discount_total") val discountTotal: String? = null,
    @SerializedName("order_total") val orderTotal: String,
    val items: List<OrderLineItem> = emptyList(),
    val activity: List<OrderActivityItem> = emptyList(),
    @SerializedName("allowed_statuses") val allowedStatuses: List<AllowedStatus> = emptyList(),
    @SerializedName("has_customization") val hasCustomization: Boolean = false
)

data class UpdateStatusRequest(
    val status: String,
    val note: String = ""
)

data class UpdateStatusResponse(
    val success: Boolean,
    val message: String,
    val order: OrderSummary? = null
)
