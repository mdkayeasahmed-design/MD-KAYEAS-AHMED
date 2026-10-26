package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class ProductVariation(
    @SerializedName("variation_id") val variationId: Int,
    val attributes: Map<String, String>? = null,
    val price: Double = 0.0,
    @SerializedName("formatted_price") val formattedPrice: String = "",
    @SerializedName("is_in_stock") val isInStock: Boolean = true,
    val sku: String? = null
)

data class ProductItem(
    val id: Int,
    val name: String,
    val sku: String? = null,
    val price: Double = 0.0,
    @SerializedName("regular_price") val regularPrice: Double = 0.0,
    @SerializedName("formatted_price") val formattedPrice: String = "",
    @SerializedName("stock_status") val stockStatus: String = "instock",
    @SerializedName("manage_stock") val manageStock: Boolean = false,
    @SerializedName("stock_quantity") val stockQuantity: Int? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    val type: String = "simple",
    val variations: List<ProductVariation> = emptyList()
)

data class ProductsResponse(
    val products: List<ProductItem>,
    val total: Int,
    val pages: Int,
    val page: Int
)
