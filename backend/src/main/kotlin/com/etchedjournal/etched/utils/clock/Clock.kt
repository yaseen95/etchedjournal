package com.etchedjournal.etched.utils.clock

import java.time.Instant

open class Clock protected constructor() {
    open fun now(): Instant = Instant.now()
    companion object {
        val INSTANCE = Clock()
    }
}
