package com.healthpointbd.operations.ui.navigation

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Dashboard : Screen("dashboard")
    data object CreateOrder : Screen("create_order")
    data object Orders : Screen("orders?query={query}&status={status}") {
        fun createRoute(query: String = "", status: String = ""): String =
            "orders?query=$query&status=$status"
    }
    data object OrderDetail : Screen("order_detail/{orderId}") {
        fun createRoute(orderId: Int): String = "order_detail/$orderId"
    }
    data object WebBrowser : Screen("web_browser")
    data object Reports : Screen("reports")
    data object Settings : Screen("settings")
    data object Profile : Screen("profile")
}
