package com.etchedjournal.etched

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.IOException


class TestUtils {

    companion object {
        /**
         * Serializes an Object into a String
         */
        @Throws(JsonProcessingException::class)
        fun asJson(o: Any): String {
            val writer = ObjectMapper().writer()
            return writer.writeValueAsString(o)
        }

        /**
         * Returns a JsonNode object from a json string.
         */
        @Throws(IOException::class)
        fun fromString(s: String): JsonNode {
            val mapper = ObjectMapper()
            return mapper.readTree(s)
        }
    }
}
