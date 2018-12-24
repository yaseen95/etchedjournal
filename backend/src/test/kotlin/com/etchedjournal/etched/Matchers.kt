package com.etchedjournal.etched

import com.etchedjournal.etched.utils.id.IdGeneratorImpl
import org.hamcrest.Description
import org.hamcrest.TypeSafeMatcher
import java.time.Duration
import java.time.Instant
import java.util.regex.Pattern

class RegexMatcher(pattern: String) : TypeSafeMatcher<String>() {

    private val compiledPattern = Pattern.compile(pattern)

    override fun describeTo(description: Description?) {
    }

    override fun matchesSafely(item: String): Boolean {
        return compiledPattern.matcher(item).matches()
    }
}

val UUID_MATCHER = RegexMatcher("[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}")

// Have to use the "Long?" type because of how it's treated
// TypeSafeMatcher will fail at "expectedType.isInstance(item)" if you don't use the nullable type
class TimestampRecentMatcher(private val recency: Duration) : TypeSafeMatcher<Long?>() {
    override fun describeTo(description: Description?) {
    }

    override fun matchesSafely(item: Long?): Boolean {
        val now = Instant.now().toEpochMilli()
        return (now - recency.toMillis()) <= item!! && item <= (now + recency.toMillis())
    }
}

val TIMESTAMP_RECENT_MATCHER = TimestampRecentMatcher(Duration.ofSeconds(5))

class StringLengthMatcher(val length: Int) : TypeSafeMatcher<String?>() {
    override fun describeTo(description: Description?) {
    }

    override fun matchesSafely(item: String?): Boolean {
        if (item == null || item.length != length) return false
        return true
    }
}

val ID_LENGTH_MATCHER = StringLengthMatcher(length = IdGeneratorImpl.ID_LENGTH)
