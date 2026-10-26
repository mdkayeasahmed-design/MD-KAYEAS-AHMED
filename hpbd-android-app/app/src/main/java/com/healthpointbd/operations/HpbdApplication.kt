package com.healthpointbd.operations

import android.app.Application
import com.healthpointbd.operations.data.repository.AuthRepository
import com.healthpointbd.operations.data.repository.OrderRepository
import com.healthpointbd.operations.data.security.CredentialStore

class HpbdApplication : Application() {

    lateinit var credentialStore: CredentialStore
        private set

    lateinit var authRepository: AuthRepository
        private set

    lateinit var orderRepository: OrderRepository
        private set

    override fun onCreate() {
        super.onCreate()
        credentialStore = CredentialStore(this)
        authRepository = AuthRepository(credentialStore)
        orderRepository = OrderRepository(credentialStore)
    }
}
