package com.healthpointbd.operations

import com.healthpointbd.operations.data.model.CustomizationField
import com.healthpointbd.operations.data.model.OrderBadges
import org.junit.Assert.*
import org.junit.Test

class CustomizationParserTest {

    @Test
    fun testEngravingCategoryDetection() {
        val field = CustomizationField(
            label = "Laser Engraving Name",
            value = "Dr. Kayeas Ahmed",
            category = "engraving"
        )
        assertEquals("engraving", field.category)
        assertTrue(field.value.contains("Dr. Kayeas"))
    }

    @Test
    fun testBengaliCustomizationCategory() {
        val field = CustomizationField(
            label = "লেজার খোদাই নাম",
            value = "ডা. তাসনিম জাহান",
            category = "engraving"
        )
        assertEquals("engraving", field.category)
    }

    @Test
    fun testOrderBadgesPresence() {
        val badges = OrderBadges(
            hasCustomization = true,
            engraving = true,
            embroidery = false,
            nameplate = true
        )
        assertTrue(badges.hasCustomization)
        assertTrue(badges.engraving)
        assertFalse(badges.embroidery)
        assertTrue(badges.nameplate)
    }
}
