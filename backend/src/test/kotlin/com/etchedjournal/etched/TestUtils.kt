package com.etchedjournal.etched

import org.hamcrest.Matcher
import org.hamcrest.Matchers

val INVALID_ETCHED_IDS = listOf(
    /* ktlint-disable no-multi-spaces */
    "abc", // too short
    "           ",  // all whitespace
    "abcdefghij",   // too short
    "abcdefghijgh", // too long
    " abcdefghij",  // leading whitespace
    "abcdefghij ",  // trailing whitespace
    "abcdefghij=",  // we remove the padding, it should not be included
    "abcdefghij("   // symbols
    /* ktlint-enable no-multi-spaces */
)

fun isNull(): Matcher<Any> {
    return Matchers.nullValue()
}
