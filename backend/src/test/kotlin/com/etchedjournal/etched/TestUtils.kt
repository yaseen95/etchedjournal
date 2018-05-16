package com.etchedjournal.etched

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class TestUtils(private val mapper: ObjectMapper) {

    // Using a component with an injected ObjectMapper because it has a non-default configuation.
    // And we don't want to define the configuration in 2 different .yml files because eventually
    // they'll be out of sync.

    /**
     * Serializes an Object into a String
     */
    @Throws(JsonProcessingException::class)
    fun asJson(o: Any): String {
        val writer = mapper.writer()
        return writer.writeValueAsString(o)
    }

    /**
     * Returns a JsonNode object from a json string.
     */
    @Throws(IOException::class)
    fun fromString(s: String): JsonNode {
        return mapper.readTree(s)
    }
}
