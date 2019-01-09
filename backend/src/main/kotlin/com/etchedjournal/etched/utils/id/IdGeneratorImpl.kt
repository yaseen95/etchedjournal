package com.etchedjournal.etched.utils.id

import java.util.concurrent.ThreadLocalRandom
import javax.annotation.concurrent.ThreadSafe

@ThreadSafe
class IdGeneratorImpl(private val size: Int): IdGenerator {

    override fun generateId(): String {
        val random = ThreadLocalRandom.current()
        val chars = CharArray(size)
        for (i in 0 until size) {
            val charPos = random.nextInt(ALLOWED_CHARS.length)
            chars[i] = ALLOWED_CHARS[charPos]
        }
        return String(chars)
    }

    companion object {
        const val ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        const val ID_LENGTH = 12

        val INSTANCE = IdGeneratorImpl(ID_LENGTH)
    }
}
