package com.healthpointbd.operations.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.healthpointbd.operations.R
import com.healthpointbd.operations.data.model.ProductItem
import com.healthpointbd.operations.ui.theme.*
import com.healthpointbd.operations.ui.viewmodel.CartItem
import com.healthpointbd.operations.ui.viewmodel.CreateOrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateOrderScreen(
    viewModel: CreateOrderViewModel,
    onOrderCreated: (Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    var showProductSearchDialog by remember { mutableStateOf(false) }
    var districtMenuExpanded by remember { mutableStateOf(false) }

    // Dialog when order created successfully
    if (uiState.createdOrder != null) {
        val created = uiState.createdOrder!!
        AlertDialog(
            onDismissRequest = { viewModel.resetForm() },
            title = {
                Row(verticalAlignment = Alignment.CenterVertizontally) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Order Created Successfully!")
                }
            },
            text = {
                Column {
                    Text(
                        text = "WooCommerce Order #${created.orderId} has been created and synced with HPBD Operations.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Customer: ${uiState.customerName} (${uiState.phone})",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val orderId = created.orderId
                        viewModel.resetForm()
                        onOrderCreated(orderId)
                    }
                ) {
                    Text("View Order Details")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        viewModel.resetForm()
                        onNavigateBack()
                    }
                ) {
                    Text("Back to Dashboard")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.title_create_order),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(4.dp)) }

            // 1. Customer Information Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertizontally) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = stringResource(R.string.customer_info_heading),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        OutlinedTextField(
                            value = uiState.customerName,
                            onValueChange = { viewModel.onCustomerFieldChange(name = it) },
                            label = { Text("Customer Name *") },
                            placeholder = { Text("e.g. Dr. Kayeas Ahmed") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = uiState.phone,
                                onValueChange = { viewModel.onCustomerFieldChange(phone = it) },
                                label = { Text("Phone Number *") },
                                placeholder = { Text("+88017...") },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )

                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onCustomerFieldChange(email = it) },
                                label = { Text("Email (optional)") },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        OutlinedTextField(
                            value = uiState.address,
                            onValueChange = { viewModel.onCustomerFieldChange(address = it) },
                            label = { Text("Full Delivery Address *") },
                            placeholder = { Text("House, Road, Area...") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )

                        // District and Upazila
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(modifier = Modifier.weight(1f)) {
                                OutlinedTextField(
                                    value = uiState.district,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("District *") },
                                    trailingIcon = {
                                        IconButton(onClick = { districtMenuExpanded = true }) {
                                            Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )

                                DropdownMenu(
                                    expanded = districtMenuExpanded,
                                    onDismissRequest = { districtMenuExpanded = false }
                                ) {
                                    viewModel.bangladeshDistricts.forEach { dist ->
                                        DropdownMenuItem(
                                            text = { Text(dist) },
                                            onClick = {
                                                viewModel.onCustomerFieldChange(district = dist)
                                                districtMenuExpanded = false
                                            }
                                        )
                                    }
                                }
                            }

                            OutlinedTextField(
                                value = uiState.upazila,
                                onValueChange = { viewModel.onCustomerFieldChange(upazila = it) },
                                label = { Text("Upazila / Thana") },
                                placeholder = { Text("e.g. Dhanmondi") },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Order Source (HPBD 1.5.0) & Priority Controls
                        var sourceMenuExpanded by remember { mutableStateOf(false) }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(modifier = Modifier.weight(1f)) {
                                OutlinedTextField(
                                    value = uiState.source,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("Order Source") },
                                    trailingIcon = {
                                        IconButton(onClick = { sourceMenuExpanded = true }) {
                                            Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )

                                DropdownMenu(
                                    expanded = sourceMenuExpanded,
                                    onDismissRequest = { sourceMenuExpanded = false }
                                ) {
                                    viewModel.orderSources.forEach { src ->
                                        DropdownMenuItem(
                                            text = { Text(src) },
                                            onClick = {
                                                viewModel.onSourceChange(src)
                                                sourceMenuExpanded = false
                                            }
                                        )
                                    }
                                }
                            }

                            // Priority Chip
                            Row(
                                modifier = Modifier
                                    .weight(1f)
                                    .align(Alignment.CenterVertically),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                FilterChip(
                                    selected = uiState.priority == "Normal",
                                    onClick = { viewModel.onPriorityChange("Normal") },
                                    label = { Text("Normal") }
                                )
                                FilterChip(
                                    selected = uiState.priority == "Urgent",
                                    onClick = { viewModel.onPriorityChange("Urgent") },
                                    label = { Text("Urgent 🔥") }
                                )
                            }
                        }
                    }
                }
            }

            // 2. Products and Customizations Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertizontally
                ) {
                    Text(
                        text = "Products in Order (${uiState.cartItems.size})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Button(
                        onClick = {
                            viewModel.searchProducts("")
                            showProductSearchDialog = true
                        },
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Product")
                    }
                }
            }

            if (uiState.cartItems.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No products added yet. Click '+ Add Product' to search WooCommerce catalog.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                itemsIndexed(uiState.cartItems) { index, item ->
                    CartItemRow(
                        item = item,
                        onQuantityChange = { qty -> viewModel.updateCartItemQuantity(index, qty) },
                        onRemove = { viewModel.removeCartItem(index) },
                        onCustomizationChange = { eng, emb, np, size, col, inst ->
                            viewModel.updateCartItemCustomization(index, eng, emb, np, size, col, inst)
                        }
                    )
                }
            }

            // 3. Payment & Delivery Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Financial & Delivery Breakdown",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Products Subtotal:", style = MaterialTheme.typography.bodyMedium)
                            Text("৳${viewModel.calculateSubtotal()}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Delivery Fee (${uiState.district}):", style = MaterialTheme.typography.bodyMedium)
                            Text("৳${uiState.deliveryCharge}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                        }

                        Divider(color = MaterialTheme.colorScheme.outlineVariant)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Grand Total:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("৳${viewModel.calculateTotal()}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Customer Note & Internal Note
                        OutlinedTextField(
                            value = uiState.customerNote,
                            onValueChange = { viewModel.onNotesChange(customerNote = it) },
                            label = { Text("Customer Note (Delivery instructions)") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = uiState.internalNote,
                            onValueChange = { viewModel.onNotesChange(internalNote = it) },
                            label = { Text("Internal Staff Note (Recorded in WooCommerce audit history)") },
                            placeholder = { Text("e.g. Approved by Operations Manager") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // Error display
            if (uiState.errorMessage != null) {
                item {
                    Text(
                        text = uiState.errorMessage ?: "",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            // Submit Button
            item {
                Button(
                    onClick = { viewModel.submitOrder() },
                    enabled = !uiState.isSubmitting && uiState.cartItems.isNotEmpty(),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    if (uiState.isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White, strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text("Creating Order in WooCommerce…")
                    } else {
                        Icon(Icons.Default.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Create Order in WooCommerce (৳${viewModel.calculateTotal()})", fontWeight = FontWeight.Bold)
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }

    // Product Search Modal Dialog
    if (showProductSearchDialog) {
        Dialog(onDismissRequest = { showProductSearchDialog = false }) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.85f),
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    var searchInput by remember { mutableStateOf("") }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertizontally
                    ) {
                        Text("Select WooCommerce Product", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { showProductSearchDialog = false }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = searchInput,
                        onValueChange = {
                            searchInput = it
                            viewModel.searchProducts(it)
                        },
                        placeholder = { Text("Search by product name or SKU...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    if (uiState.isSearchingProducts) {
                        LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                    }

                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.searchResults.size) { idx ->
                            val product = uiState.searchResults[idx]
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        viewModel.addProductToCart(product)
                                        showProductSearchDialog = false
                                    },
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertizontally
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(product.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                        if (!product.sku.isNullOrBlank()) {
                                            Text("SKU: ${product.sku}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }
                                    Text(product.formattedPrice.ifEmpty { "৳${product.price}" }, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit,
    onCustomizationChange: (String?, String?, String?, String?, String?, String?) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header Row: Product name, Price, Quantity
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertizontally
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.product.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                    Text("Unit Price: ৳${item.unitPrice}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Row(verticalAlignment = Alignment.CenterVertizontally) {
                    IconButton(onClick = { onQuantityChange(item.quantity - 1) }) {
                        Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease")
                    }
                    Text("${item.quantity}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    IconButton(onClick = { onQuantityChange(item.quantity + 1) }) {
                        Icon(Icons.Default.AddCircleOutline, contentDescription = "Increase")
                    }
                    IconButton(onClick = onRemove) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Remove", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Divider(color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(8.dp))

            // Customization Inputs
            Text(
                text = "Customization Specifications (Engraving / Embroidery / Nameplate):",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Engraving Name
            OutlinedTextField(
                value = item.engravingName,
                onValueChange = { onCustomizationChange(it, null, null, null, null, null) },
                label = { Text("Laser Engraving Name (e.g. Dr. Kayeas Ahmed)") },
                leadingIcon = { Icon(Icons.Default.AutoFixHigh, contentDescription = null, tint = BadgeEngraving) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Embroidery Name
            OutlinedTextField(
                value = item.embroideryName,
                onValueChange = { onCustomizationChange(null, it, null, null, null, null) },
                label = { Text("Embroidery Name / Dept (e.g. Cardiology)") },
                leadingIcon = { Icon(Icons.Default.Style, contentDescription = null, tint = BadgeEmbroidery) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Nameplate Name
            OutlinedTextField(
                value = item.nameplateName,
                onValueChange = { onCustomizationChange(null, null, it, null, null, null) },
                label = { Text("Chamber Nameplate Specification") },
                leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null, tint = BadgeNameplate) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
