package com.etchedjournal.etched.utils.clock

import java.time.Instant
import java.util.concurrent.atomic.AtomicLong

class FakeIncrementingClock : Clock() {
    private var millis: AtomicLong = AtomicLong(0)
    override fun now(): Instant = Instant.ofEpochMilli(millis.getAndIncrement())
    fun setTime(millis: Long) {
        this.millis.set(millis)
    }
}
