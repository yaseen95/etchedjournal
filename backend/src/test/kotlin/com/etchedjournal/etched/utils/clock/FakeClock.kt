package com.etchedjournal.etched.utils.clock

import java.time.Instant

class FakeClock(var millis: Long = 0) : Clock() {
    override fun now(): Instant = Instant.ofEpochMilli(millis)
}
