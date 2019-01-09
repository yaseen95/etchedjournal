package com.etchedjournal.etched.utils.id

import javax.annotation.concurrent.ThreadSafe

/**
 * Generates ids
 *
 * @implSpec
 * Implementations MUST be thread safe
 */
@ThreadSafe
interface IdGenerator {

    /**
     * Generates a new id
     */
    fun generateId(): String
}
