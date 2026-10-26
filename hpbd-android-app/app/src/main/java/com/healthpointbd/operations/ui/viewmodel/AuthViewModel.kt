package com.healthpointbd.operations.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthpointbd.operations.data.model.SessionResponse
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.repository.AuthRepository
import com.healthpointbd.operations.data.security.CredentialStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val session: SessionResponse? = null,
    val errorMessage: String? = null
)

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val credentialStore: CredentialStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState(isAuthenticated = authRepository.isLoggedIn()))
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(baseUrl: String, username: String, appPassword: String) {
        viewModelScope.launch {
            authRepository.authenticate(baseUrl, username, appPassword).collect { result ->
                when (result) {
                    is Resource.Loading -> _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
                    is Resource.Success -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = true,
                        session = result.data,
                        errorMessage = null
                    )
                    is Resource.Error -> _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = false,
                        errorMessage = result.message
                    )
                }
            }
        }
    }

    fun logout() {
        authRepository.logout()
        _uiState.value = AuthUiState(isAuthenticated = false)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
