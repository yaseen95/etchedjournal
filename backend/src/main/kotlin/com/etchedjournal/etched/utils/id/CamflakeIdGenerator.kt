package com.etchedjournal.etched.utils.id

import com.etchedjournal.etched.utils.id.camflake.Camflake
import org.springframework.stereotype.Service

@Service
class CamflakeIdGenerator(private val camflake: Camflake) : IdGenerator {
    override fun generateId(): String {
        return IdSerializer.serialize(camflake.next())
    }
}
