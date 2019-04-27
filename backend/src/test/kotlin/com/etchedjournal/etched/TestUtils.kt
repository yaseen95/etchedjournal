package com.etchedjournal.etched

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
