package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class DashboardStats(
    val total: Int = 0,
    @SerializedName("today_orders") val todayOrders: Int = 0,
    val pending: Int = 0,
    val processing: Int = 0,
    val completed: Int = 0,
    val cancelled: Int = 0,
    @SerializedName("on_hold") val onHold: Int = 0,
    val failed: Int = 0,
    @SerializedName("customized_orders") val customizedOrders: Int = 0
)
