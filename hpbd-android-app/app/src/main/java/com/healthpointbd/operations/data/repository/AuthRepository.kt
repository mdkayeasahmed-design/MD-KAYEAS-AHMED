package com.healthpointbd.operations.data.repository

import com.healthpointbd.operations.data.model.SessionResponse
import com.healthpointbd.operations.data.remote.ApiFactory
import com.healthpointbd.operations.data.remote.Resource
import com.healthpointbd.operations.data.security.CredentialStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import retrofit2.HttpException
import java.io.IOException

class AuthRepository(private val credentialStore: CredentialStore) {

    fun authenticate(baseUrl: String, username: String, appPassword: String): Flow<Resource<SessionResponse>> = flow {
        emit(Resource.Loading)

        if (!baseUrl.trim().startsWith("https://")) {
            emit(Resource.Error("HTTPS is strictly required for WordPress Mobile API connection."))
            return@flow
        }

        try {
            // Temporarily store credentials to build service
            credentialStore.saveCredentials(baseUrl, username, appPassword)
            val service = ApiFactory(credentialStore).createService()
            val session = service.getSession()

            // Verify permission
            if (!session.permissions.readOrders) {
                credentialStore.clear()
                emit(Resource.Error("Permission denied: Your account lacks 'hpbd_ops_access' permission."))
                return@flow
            }

            emit(Resource.Success(session))
        } catch (e: HttpException) {
            credentialStore.clear()
            val msg = when (e.code()) {
                401 -> "Invalid credentials. Verify your WordPress username and Application Password."
                403 -> "Access denied. HTTPS required or account lacking 'hpbd_ops_access' role."
                404 -> "HPBD Mobile Bridge plugin is not active on this WordPress site."
                429 -> "Rate limit exceeded. Please wait a minute before retrying."
                else -> "Server error (${e.code()}): ${e.message()}"
            }
            emit(Resource.Error(msg, e.code()))
        } catch (e: IOException) {
            credentialStore.clear()
            emit(Resource.Error("Network error: Unable to connect to host. Check your internet connection."))
        } catch (e: Exception) {
            credentialStore.clear()
            emit(Resource.Error("Authentication error: ${e.localizedMessage ?: "Unknown error"}"))
        }
    }.flowOn(Dispatchers.IO)

    fun logout() {
        credentialStore.clear()
    }

    fun isLoggedIn(): Boolean = credentialStore.isConfigured()
}
