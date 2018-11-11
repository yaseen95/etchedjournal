package com.etchedjournal.etched.utils

import org.bouncycastle.openpgp.PGPPublicKey
import org.bouncycastle.openpgp.PGPUtil
import org.bouncycastle.openpgp.jcajce.JcaPGPPublicKeyRingCollection
import java.io.ByteArrayInputStream

object PgpUtils {

    /**
     * Read in the [keyBytes] as a PGP public key
     */
    fun readPublicKey(keyBytes: ByteArray): PGPPublicKey {
        val collection = JcaPGPPublicKeyRingCollection(keyBytes)
        return readPublicKey(collection)
    }

    /**
     * Read in the [key] as a PGP public key
     */
    fun readPublicKey(key: String): PGPPublicKey {
        val inputString = ByteArrayInputStream(key.toByteArray())
        val decoded = PGPUtil.getDecoderStream(inputString)

        val collection = JcaPGPPublicKeyRingCollection(decoded)
        return readPublicKey(collection)
    }

    private fun readPublicKey(collection: JcaPGPPublicKeyRingCollection): PGPPublicKey {
        val keyRingsIterator = collection.keyRings

        while (keyRingsIterator.hasNext()) {
            val keyring = keyRingsIterator.next()
            val publicKeysIterator = keyring.publicKeys

            while (publicKeysIterator.hasNext()) {
                return publicKeysIterator.next()
            }
        }

        throw IllegalArgumentException("Unable to read public key")
    }
}
