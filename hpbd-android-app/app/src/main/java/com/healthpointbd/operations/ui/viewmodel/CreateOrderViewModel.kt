package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.*
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.repository.OrderRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

data class CartItem(
    val product: ProductItem,
    val selectedVariation: ProductVariation? = null,
    var quantity: Int = 1,
    var unitPrice: Double = selectedVariation?.price ?: product.price,
    var engravingName: String = "",
    var embroideryName: String = "",
    var nameplateName: String = "",
    var selectedSize: String = "",
    var selectedColor: String = "",
    var specialInstructions: String = ""
)

data class CreateOrderUiState(
    val isSubmitting: Boolean = false,
    val isSearchingProducts: Boolean = false,
    val searchResults: List<ProductItem> = emptyList(),
    val cartItems: List<CartItem> = emptyList(),
    val customerName: String = "",
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val district: String = "Dhaka",
    val upazila: String = "",
    val deliveryCharge: Double = 120.0, // Default ৳120 inside Dhaka, ৳150 outside
    val discount: Double = 0.0,
    val paymentMethod: String = "cod",
    val status: String = "processing",
    val source: String = "Manual",
    val priority: String = "Normal",
    val customerNote: String = "",
    val internalNote: String = "",
    val createdOrder: CreateOrderResponse? = null,
    val errorMessage: String? = null
)

class CreateOrderViewModel(private val orderRepository: OrderRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(CreateOrderUiState())
    val uiState: StateFlow<CreateOrderUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    // Allowed HPBD Operations Sources
    val orderSources = listOf("Manual", "Messenger", "Facebook Comment", "WhatsApp", "Website")
    val priorityLevels = listOf("Normal", "Urgent")

    // Bangladesh 64 Districts List
    val bangladeshDistricts = listOf(
        "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh",
        "Gazipur", "Narayanganj", "Comilla", "Brahmanbaria", "Feni", "Noakhali", "Cox's Bazar",
        "Bogra", "Pabna", "Sirajganj", "Dinajpur", "Jessore", "Kushtia", "Faridpur", "Tangail",
        "Jamalpur", "Netrokona", "Sherpur", "Kishoreganj", "Manikganj", "Munshiganj", "Narsingdi"
    )

    fun onCustomerFieldChange(
        name: String? = null,
        phone: String? = null,
        email: String? = null,
        address: String? = null,
        district: String? = null,
        upazila: String? = null
    ) {
        val currentDistrict = district ?: _uiState.value.district
        // Automatically adjust standard delivery fee based on district
        val standardDelivery = if (currentDistrict.equals("Dhaka", ignoreCase = true)) 120.0 else 150.0

        _uiState.value = _uiState.value.copy(
            customerName = name ?: _uiState.value.customerName,
            phone = phone ?: _uiState.value.phone,
            email = email ?: _uiState.value.email,
            address = address ?: _uiState.value.address,
            district = currentDistrict,
            upazila = upazila ?: _uiState.value.upazila,
            deliveryCharge = standardDelivery
        )
    }

    fun onDeliveryOrDiscountChange(deliveryCharge: Double? = null, discount: Double? = null) {
        _uiState.value = _uiState.value.copy(
            deliveryCharge = deliveryCharge ?: _uiState.value.deliveryCharge,
            discount = discount ?: _uiState.value.discount
        )
    }

    fun onNotesChange(customerNote: String? = null, internalNote: String? = null) {
        _uiState.value = _uiState.value.copy(
            customerNote = customerNote ?: _uiState.value.customerNote,
            internalNote = internalNote ?: _uiState.value.internalNote
        )
    }

    fun onSourceChange(source: String) {
        _uiState.value = _uiState.value.copy(source = source)
    }

    fun onPriorityChange(priority: String) {
        _uiState.value = _uiState.value.copy(priority = priority)
    }

    fun onPaymentMethodChange(method: String) {
        _uiState.value = _uiState.value.copy(paymentMethod = method)
    }

    fun searchProducts(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSearchingProducts = true)
            delay(300)
            orderRepository.searchProducts(query).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isSearchingProducts = false,
                            searchResults = result.data
                        )
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(isSearchingProducts = false)
                    }
                    is Resource.Loading -> {}
                }
            }
        }
    }

    fun addProductToCart(product: ProductItem, variation: ProductVariation? = null) {
        val currentCart = _uiState.value.cartItems.toMutableList()
        val existingIndex = currentCart.indexOfFirst {
            it.product.id == product.id && it.selectedVariation?.variationId == variation?.variationId
        }

        if (existingIndex >= 0) {
            val item = currentCart[existingIndex]
            currentCart[existingIndex] = item.copy(quantity = item.quantity + 1)
        } else {
            currentCart.add(
                CartItem(
                    product = product,
                    selectedVariation = variation,
                    quantity = 1,
                    unitPrice = variation?.price ?: product.price
                )
            )
        }
        _uiState.value = _uiState.value.copy(cartItems = currentCart)
    }

    fun updateCartItemQuantity(index: Int, qty: Int) {
        if (qty <= 0) {
            removeCartItem(index)
            return
        }
        val currentCart = _uiState.value.cartItems.toMutableList()
        if (index in currentCart.indices) {
            currentCart[index] = currentCart[index].copy(quantity = qty)
            _uiState.value = _uiState.value.copy(cartItems = currentCart)
        }
    }

    fun updateCartItemCustomization(
        index: Int,
        engravingName: String? = null,
        embroideryName: String? = null,
        nameplateName: String? = null,
        size: String? = null,
        color: String? = null,
        instructions: String? = null
    ) {
        val currentCart = _uiState.value.cartItems.toMutableList()
        if (index in currentCart.indices) {
            val item = currentCart[index]
            currentCart[index] = item.copy(
                engravingName = engravingName ?: item.engravingName,
                embroideryName = embroideryName ?: item.embroideryName,
                nameplateName = nameplateName ?: item.nameplateName,
                selectedSize = size ?: item.selectedSize,
                selectedColor = color ?: item.selectedColor,
                specialInstructions = instructions ?: item.specialInstructions
            )
            _uiState.value = _uiState.value.copy(cartItems = currentCart)
        }
    }

    fun removeCartItem(index: Int) {
        val currentCart = _uiState.value.cartItems.toMutableList()
        if (index in currentCart.indices) {
            currentCart.removeAt(index)
            _uiState.value = _uiState.value.copy(cartItems = currentCart)
        }
    }

    fun calculateSubtotal(): Double {
        return _uiState.value.cartItems.sumOf { it.unitPrice * it.quantity }
    }

    fun calculateTotal(): Double {
        val sub = calculateSubtotal()
        val total = sub + _uiState.value.deliveryCharge - _uiState.value.discount
        return maxOf(0.0, total)
    }

    fun submitOrder() {
        val state = _uiState.value
        if (state.customerName.isBlank() || state.phone.isBlank() || state.address.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Please fill in Customer Name, Phone, and Full Address.")
            return
        }
        if (state.cartItems.isEmpty()) {
            _uiState.value = state.copy(errorMessage = "Add at least one product to the order.")
            return
        }

        val requestItems = state.cartItems.map { cartItem ->
            val customs = mutableListOf<CreateOrderCustomization>()
            if (cartItem.engravingName.isNotBlank()) {
                customs.add(CreateOrderCustomization("Laser Engraving Name", cartItem.engravingName, "engraving"))
            }
            if (cartItem.embroideryName.isNotBlank()) {
                customs.add(CreateOrderCustomization("Embroidery Name", cartItem.embroideryName, "embroidery"))
            }
            if (cartItem.nameplateName.isNotBlank()) {
                customs.add(CreateOrderCustomization("Nameplate Name", cartItem.nameplateName, "nameplate"))
            }
            if (cartItem.selectedSize.isNotBlank()) {
                customs.add(CreateOrderCustomization("Size", cartItem.selectedSize, "general"))
            }
            if (cartItem.selectedColor.isNotBlank()) {
                customs.add(CreateOrderCustomization("Color", cartItem.selectedColor, "general"))
            }
            if (cartItem.specialInstructions.isNotBlank()) {
                customs.add(CreateOrderCustomization("Custom Instructions", cartItem.specialInstructions, "general"))
            }

            CreateOrderLineItem(
                productId = cartItem.product.id,
                variationId = cartItem.selectedVariation?.variationId,
                quantity = cartItem.quantity,
                unitPrice = cartItem.unitPrice,
                customizations = customs
            )
        }

        val request = CreateOrderRequest(
            customerName = state.customerName.trim(),
            phone = state.phone.trim(),
            email = state.email.trim().ifEmpty { null },
            address = state.address.trim(),
            district = state.district,
            upazila = state.upazila.trim().ifEmpty { null },
            status = state.status,
            paymentMethod = state.paymentMethod,
            deliveryCharge = state.deliveryCharge,
            discount = state.discount,
            customerNote = state.customerNote.trim().ifEmpty { null },
            internalNote = state.internalNote.trim().ifEmpty { null },
            source = state.source,
            priority = state.priority,
            items = requestItems
        )

        // Generate UUID idempotency key to prevent double creation
        val idempotencyKey = UUID.randomUUID().toString()

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmitting = true, errorMessage = null)
            orderRepository.createOrder(request, idempotencyKey).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            createdOrder = result.data,
                            errorMessage = null
                        )
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            errorMessage = result.message
                        )
                    }
                    is Resource.Loading -> {}
                }
            }
        }
    }

    fun resetForm() {
        _uiState.value = CreateOrderUiState()
    }
}
