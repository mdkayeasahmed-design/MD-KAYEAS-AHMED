package com.healthpointbd.operations

import com.healthpointbd.operations.data.model.CreateOrderCustomization
import com.healthpointbd.operations.data.model.CreateOrderLineItem
import com.healthpointbd.operations.data.model.CreateOrderRequest
import org.junit.Assert.*
import org.junit.Test

class OrderCreationTest {

    @Test
    fun testCreateOrderRequestStructure() {
        val customization = CreateOrderCustomization(
            label = "Laser Engraving Name",
            value = "Dr. Kayeas Ahmed",
            category = "engraving"
        )

        val item = CreateOrderLineItem(
            productId = 401,
            variationId = null,
            quantity = 1,
            unitPrice = 11500.0,
            customizations = listOf(customization)
        )

        val request = CreateOrderRequest(
            customerName = "Dr. Kayeas Ahmed",
            phone = "+8801711223344",
            email = "dr.kayeas@healthpointbd.com",
            address = "Flat 4B, House 24, Road 7, Dhanmondi",
            district = "Dhaka",
            upazila = "Dhanmondi",
            status = "processing",
            deliveryCharge = 120.0,
            items = listOf(item)
        )

        assertEquals("Dr. Kayeas Ahmed", request.customerName)
        assertEquals("Dhaka", request.district)
        assertEquals("Manual", request.source)
        assertEquals("Normal", request.priority)
        assertEquals(1, request.items.size)
        assertEquals("Laser Engraving Name", request.items[0].customizations[0].label)
        assertEquals("engraving", request.items[0].customizations[0].category)
    }

    @Test
    fun testBangladeshDistrictsContainDhakaAndChittagong() {
        val sampleDistricts = listOf("Dhaka", "Chittagong", "Sylhet", "Rajshahi")
        assertTrue(sampleDistricts.contains("Dhaka"))
        assertTrue(sampleDistricts.contains("Chittagong"))
    }
}
