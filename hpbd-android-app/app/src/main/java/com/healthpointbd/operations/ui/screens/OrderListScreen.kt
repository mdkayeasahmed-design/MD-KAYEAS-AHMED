package com.healthpointbd.operations.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.healthpointbd.operations.R
import com.healthpointbd.operations.data.model.OrderSummary
import com.healthpointbd.operations.ui.theme.*
import com.healthpointbd.operations.ui.viewmodel.OrdersViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderListScreen(
    viewModel: OrdersViewModel,
    onOrderClick: (Int) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadOrders(uiState.currentPage)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.nav_orders),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.loadOrders(uiState.currentPage) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Input Field
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                placeholder = { Text(stringResource(R.string.search_hint)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
            )

            // Horizontal Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "all" to stringResource(R.string.filter_all),
                    "pending" to stringResource(R.string.stat_pending),
                    "processing" to stringResource(R.string.stat_processing),
                    "completed" to stringResource(R.string.stat_completed),
                    "on-hold" to stringResource(R.string.stat_on_hold),
                    "cancelled" to stringResource(R.string.stat_cancelled)
                ).forEach { (statusKey, label) ->
                    FilterChip(
                        selected = uiState.selectedStatus == statusKey,
                        onClick = { viewModel.onStatusFilterChanged(statusKey) },
                        label = { Text(label) }
                    )
                }

                FilterChip(
                    selected = uiState.customizedOnly,
                    onClick = { viewModel.toggleCustomizedOnly(!uiState.customizedOnly) },
                    label = { Text("✨ " + stringResource(R.string.badge_customized)) },
                    leadingIcon = if (uiState.customizedOnly) {
                        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    } else null
                )
            }

            if (uiState.isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }

            if (uiState.errorMessage != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = uiState.errorMessage ?: "",
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadOrders(1) }) {
                            Text(stringResource(R.string.btn_retry))
                        }
                    }
                }
            }

            // Orders List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item { Spacer(modifier = Modifier.height(6.dp)) }

                if (uiState.orders.isEmpty() && !uiState.isLoading && uiState.errorMessage == null) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = stringResource(R.string.empty_orders),
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    items(uiState.orders) { order ->
                        OrderSummaryCard(
                            order = order,
                            onClick = { onOrderClick(order.id) }
                        )
                    }
                }

                // Pagination Row
                if (uiState.totalPages > 1) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertizontally
                        ) {
                            IconButton(
                                onClick = { viewModel.loadOrders(uiState.currentPage - 1) },
                                enabled = uiState.currentPage > 1 && !uiState.isLoading
                            ) {
                                Icon(Icons.Default.ChevronLeft, contentDescription = "Previous")
                            }

                            Text(
                                text = "${uiState.currentPage} / ${uiState.totalPages}",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )

                            IconButton(
                                onClick = { viewModel.loadOrders(uiState.currentPage + 1) },
                                enabled = uiState.currentPage < uiState.totalPages && !uiState.isLoading
                            ) {
                                Icon(Icons.Default.ChevronRight, contentDescription = "Next")
                            }
                        }
                    }
                }

                item { Spacer(modifier = Modifier.height(10.dp)) }
            }
        }
    }
}

@Composable
fun OrderSummaryCard(
    order: OrderSummary,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header: Order #, Status Chip, Price
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertizontally
            ) {
                Text(
                    text = "#${order.number}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                OrderStatusBadge(status = order.status)
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Customer Name & Phone
            Text(
                text = order.customer,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertizontally
            ) {
                Text(
                    text = order.phone.ifEmpty { "No phone listed" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = order.total,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            // Customization Badges (Engraving, Embroidery, Nameplate)
            if (order.badges != null && order.badges.hasCustomization) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (order.badges.engraving) {
                        CustomizationBadge(label = "Engraving", color = BadgeEngraving)
                    }
                    if (order.badges.embroidery) {
                        CustomizationBadge(label = "Embroidery", color = BadgeEmbroidery)
                    }
                    if (order.badges.nameplate) {
                        CustomizationBadge(label = "Nameplate", color = BadgeNameplate)
                    }
                }
            }

            if (order.customization.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                order.customization.take(2).forEach { customText ->
                    Text(
                        text = "• $customText",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = order.created,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun OrderStatusBadge(status: String) {
    val (bgColor, textColor) = when (status.lowercase()) {
        "completed" -> Color(0xFFD1FAE5) to Color(0xFF065F46)
        "processing" -> Color(0xFFDBEAFE) to Color(0xFF1E40AF)
        "pending" -> Color(0xFFFEF3C7) to Color(0xFF92400E)
        "on-hold" -> Color(0xFFFEE2E2) to Color(0xFF991B1B)
        "cancelled" -> Color(0xFFF3F4F6) to Color(0xFF374151)
        else -> Color(0xFFF1F5F9) to Color(0xFF475569)
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = textColor
        )
    }
}

@Composable
fun CustomizationBadge(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.12f))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = "★ $label",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold,
            color = color
        )
    }
}
