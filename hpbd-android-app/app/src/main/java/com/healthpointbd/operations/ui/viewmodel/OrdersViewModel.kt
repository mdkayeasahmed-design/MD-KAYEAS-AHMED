package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.OrderSummary
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.repository.OrderRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class OrdersUiState(
    val isLoading: Boolean = false,
    val orders: List<OrderSummary> = emptyList(),
    val totalOrders: Int = 0,
    val currentPage: Int = 1,
    val totalPages: Int = 1,
    val searchQuery: String = "",
    val selectedStatus: String = "all",
    val customizedOnly: Boolean = false,
    val errorMessage: String? = null
)

class OrdersViewModel(private val orderRepository: OrderRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    fun loadOrders(page: Int = 1) {
        viewModelScope.launch {
            val query = _uiState.value.searchQuery
            val status = if (_uiState.value.selectedStatus == "all") "" else _uiState.value.selectedStatus
            val customizedOnly = _uiState.value.customizedOnly

            orderRepository.getOrders(
                query = query,
                status = status,
                page = page,
                limit = 20,
                customizedOnly = customizedOnly
            ).collect { result ->
                when (result) {
                    is Resource.Loading -> _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
                    is Resource.Success -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        orders = result.data.orders,
                        totalOrders = result.data.total,
                        currentPage = result.data.page,
                        totalPages = result.data.pages,
                        errorMessage = null
                    )
                    is Resource.Error -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.message
                    )
                }
            }
        }
    }

    fun onSearchQueryChanged(newQuery: String) {
        _uiState.value = _uiState.value.copy(searchQuery = newQuery)
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(400) // Debounce typing
            loadOrders(page = 1)
        }
    }

    fun onStatusFilterChanged(status: String) {
        _uiState.value = _uiState.value.copy(selectedStatus = status)
        loadOrders(page = 1)
    }

    fun toggleCustomizedOnly(customized: Boolean) {
        _uiState.value = _uiState.value.copy(customizedOnly = customized)
        loadOrders(page = 1)
    }
}
