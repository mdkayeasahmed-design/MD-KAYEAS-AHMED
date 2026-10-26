package com.healthpointbd.operations.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.healthpointbd.operations.HpbdApplication
import com.healthpointbd.operations.R
import com.healthpointbd.operations.ui.navigation.Screen
import com.healthpointbd.operations.ui.viewmodel.*

@Composable
fun HpbdRootScreen(
    app: HpbdApplication,
    currentLanguage: String,
    onLanguageChange: (String) -> Unit
) {
    val navController = rememberNavController()
    val authViewModel = remember { AuthViewModel(app.authRepository, app.credentialStore) }
    val authState by authViewModel.uiState.collectAsState()

    if (!authState.isAuthenticated) {
        LoginScreen(
            authViewModel = authViewModel,
            currentLanguage = currentLanguage,
            onLanguageChange = onLanguageChange
        )
    } else {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route

        val showBottomBar = currentRoute in listOf(
            Screen.Dashboard.route,
            Screen.Orders.route,
            Screen.CreateOrder.route,
            Screen.WebBrowser.route,
            Screen.Settings.route
        )

        Scaffold(
            bottomBar = {
                if (showBottomBar) {
                    NavigationBar {
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                            label = { Text(stringResource(R.string.nav_dashboard)) },
                            selected = currentRoute == Screen.Dashboard.route,
                            onClick = {
                                navController.navigate(Screen.Dashboard.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.ListAlt, contentDescription = "Orders") },
                            label = { Text(stringResource(R.string.nav_orders)) },
                            selected = currentRoute?.startsWith("orders") == true,
                            onClick = {
                                navController.navigate(Screen.Orders.createRoute()) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.AddCircle, contentDescription = "New Order") },
                            label = { Text(stringResource(R.string.nav_create_order)) },
                            selected = currentRoute == Screen.CreateOrder.route,
                            onClick = {
                                navController.navigate(Screen.CreateOrder.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Language, contentDescription = "Web Portal") },
                            label = { Text(stringResource(R.string.nav_browser)) },
                            selected = currentRoute == Screen.WebBrowser.route,
                            onClick = {
                                navController.navigate(Screen.WebBrowser.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                            label = { Text(stringResource(R.string.nav_settings)) },
                            selected = currentRoute == Screen.Settings.route,
                            onClick = {
                                navController.navigate(Screen.Settings.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Screen.Dashboard.route,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable(Screen.Dashboard.route) {
                    val dashboardVm = remember { DashboardViewModel(app.orderRepository) }
                    DashboardScreen(
                        viewModel = dashboardVm,
                        onNavigateToOrders = { statusFilter ->
                            navController.navigate(Screen.Orders.createRoute(status = statusFilter))
                        },
                        onNavigateToDetail = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        }
                    )
                }

                composable(Screen.CreateOrder.route) {
                    val createVm = remember { CreateOrderViewModel(app.orderRepository) }
                    CreateOrderScreen(
                        viewModel = createVm,
                        onOrderCreated = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        },
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(
                    route = Screen.Orders.route,
                    arguments = listOf(
                        navArgument("query") { type = NavType.StringType; defaultValue = "" },
                        navArgument("status") { type = NavType.StringType; defaultValue = "all" }
                    )
                ) {
                    val ordersVm = remember { OrdersViewModel(app.orderRepository) }
                    OrderListScreen(
                        viewModel = ordersVm,
                        onOrderClick = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        }
                    )
                }

                composable(
                    route = Screen.OrderDetail.route,
                    arguments = listOf(
                        navArgument("orderId") { type = NavType.IntType }
                    )
                ) { backStackEntry ->
                    val orderId = backStackEntry.arguments?.getInt("orderId") ?: 0
                    val detailVm = remember(orderId) { OrderDetailViewModel(app.orderRepository, orderId) }
                    OrderDetailScreen(
                        viewModel = detailVm,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.WebBrowser.route) {
                    WebBrowserScreen(
                        baseUrl = app.credentialStore.getBaseUrl(),
                        onSwitchToNative = { navController.navigate(Screen.Dashboard.route) }
                    )
                }

                composable(Screen.Settings.route) {
                    SettingsScreen(
                        credentialStore = app.credentialStore,
                        currentLanguage = currentLanguage,
                        onLanguageChange = onLanguageChange,
                        onLogout = { authViewModel.logout() }
                    )
                }
            }
        }
    }
}
