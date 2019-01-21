package com.etchedjournal.etched.utils.id

import org.junit.Assert.assertEquals
import org.junit.Test

class IdSerializerTest {

    @Test
    fun serialize() {
        var actual = IdSerializer.serialize(216844349302899134)
        assertEquals("AwJiyWvAAb4", actual)

        actual = IdSerializer.serialize(216844349302899133)
        assertEquals("AwJiyWvAAb0", actual)
    }

    @Test
    fun deserialize() {
        // Due to base64 rounding multiple strings can map to one id
        assertEquals(216844349302899134, IdSerializer.deserialize("AwJiyWvAAb4"))
        assertEquals(216844349302899134, IdSerializer.deserialize("AwJiyWvAAb5"))
        assertEquals(216844349302899134, IdSerializer.deserialize("AwJiyWvAAb6"))
        assertEquals(216844349302899134, IdSerializer.deserialize("AwJiyWvAAb7"))

        assertEquals(216844349302899135, IdSerializer.deserialize("AwJiyWvAAb8"))
        assertEquals(216844349302899135, IdSerializer.deserialize("AwJiyWvAAb9"))
        assertEquals(216844349302899135, IdSerializer.deserialize("AwJiyWvAAb-"))
        assertEquals(216844349302899135, IdSerializer.deserialize("AwJiyWvAAb_"))
    }
}
