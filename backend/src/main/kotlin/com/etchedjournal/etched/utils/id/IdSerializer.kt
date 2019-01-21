package com.etchedjournal.etched.utils.id

import com.google.common.primitives.Longs
import java.util.Base64

object IdSerializer {

    private val encoder = Base64.getUrlEncoder()
    private val decoder = Base64.getUrlDecoder()

    fun serialize(id: Long): String {
        val bytes = Longs.toByteArray(id)
        return encoder.encodeToString(bytes).substring(0, 11)
    }

    fun deserialize(id: String): Long {
        require(id.length == 11) { "Invalid id: $id" }
        val bytes = decoder.decode(id + "=")
        return Longs.fromByteArray(bytes)
    }
}
