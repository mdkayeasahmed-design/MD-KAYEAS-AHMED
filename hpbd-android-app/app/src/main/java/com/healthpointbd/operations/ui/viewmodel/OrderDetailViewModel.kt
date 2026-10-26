package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.OrderDetailResponse
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.repository.OrderRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class OrderDetailUiState(
    val isLoading: Boolean = false,
    val isUpdating: Boolean = false,
    val orderDetail: OrderDetailResponse? = null,
    val updateSuccessMessage: String? = null,
    val errorMessage: String? = null
)

class OrderDetailViewModel(
    private val orderRepository: OrderRepository,
    private val orderId: Int
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderDetailUiState())
    val uiState: StateFlow<OrderDetailUiState> = _uiState.asStateFlow()

    init {
        loadDetail()
    }

    fun loadDetail() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            orderRepository.getOrderDetail(orderId).collect { result ->
                when (result) {
                    is Resource.Success -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        orderDetail = result.data,
                        errorMessage = null
                    )
                    is Resource.Error -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.message
                    )
                    is Resource.Loading -> {}
                }
            }
        }
    }

    fun updateStatus(newStatus: String, auditNote: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUpdating = true, errorMessage = null, updateSuccessMessage = null)
            orderRepository.updateOrderStatus(orderId, newStatus, auditNote).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isUpdating = false,
                            updateSuccessMessage = result.data.message
                        )
                        // Reload order detail to refresh activity log and current status
                        loadDetail()
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isUpdating = false,
                            errorMessage = result.message
                        )
                    }
                    is Resource.Loading -> {}
                }
            }
        }
    }

    fun dismissSuccessMessage() {
        _uiState.value = _uiState.value.copy(updateSuccessMessage = null)
    }
}
