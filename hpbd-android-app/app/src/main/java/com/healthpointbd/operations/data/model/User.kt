package com.healthpointbd.operations.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    val id: Int,
    val username: String,
    val name: String,
    val email: String? = null,
    val roles: List<String> = emptyList(),
    val avatar: String? = null
)

data class UserPermissions(
    @SerializedName("read_orders") val readOrders: Boolean = true,
    @SerializedName("update_order_status") val updateOrderStatus: Boolean = false,
    @SerializedName("manage_settings") val manageSettings: Boolean = false
)

data class SessionResponse(
    val user: UserProfile,
    val permissions: UserPermissions,
    @SerializedName("server_time") val serverTime: String? = null,
    @SerializedName("bridge_version") val bridgeVersion: String? = null
)
