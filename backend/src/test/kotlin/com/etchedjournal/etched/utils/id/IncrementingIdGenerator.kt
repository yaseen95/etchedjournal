package com.etchedjournal.etched.utils.id

import java.util.concurrent.atomic.AtomicLong

open class IncrementingIdGenerator : IdGenerator {
    private val currentId = AtomicLong(1)

    open override fun generateId(): String {
        val id = currentId.getAndIncrement()
        return IdSerializer.serialize(id)
    }
}
