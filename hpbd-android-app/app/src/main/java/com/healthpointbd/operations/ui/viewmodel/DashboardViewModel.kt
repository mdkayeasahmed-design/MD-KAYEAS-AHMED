package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.DashboardStats
import com.healthpointbd.operations.data.model.OrderSummary
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.repository.OrderRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = false,
    val stats: DashboardStats = DashboardStats(),
    val recentOrders: List<OrderSummary> = emptyList(),
    val errorMessage: String? = null
)

class DashboardViewModel(private val orderRepository: OrderRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        refreshDashboard()
    }

    fun refreshDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            // Fetch Stats
            orderRepository.getDashboardStats().collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(
                            stats = result.data,
                            isLoading = false
                        )
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            errorMessage = result.message,
                            isLoading = false
                        )
                    }
                    is Resource.Loading -> {}
                }
            }

            // Fetch Recent Orders (limit 5)
            orderRepository.getOrders(limit = 5).collect { result ->
                if (result is Resource.Success) {
                    _uiState.value = _uiState.value.copy(
                        recentOrders = result.data.orders
                    )
                }
            }
        }
    }
}
