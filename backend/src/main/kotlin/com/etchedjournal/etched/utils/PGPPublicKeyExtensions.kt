package com.etchedjournal.etched.utils

import org.bouncycastle.bcpg.PublicKeyAlgorithmTags
import org.bouncycastle.openpgp.PGPPublicKey

fun PGPPublicKey.getAlgorithmStr(): String {
    return when (algorithm) {
        PublicKeyAlgorithmTags.RSA_GENERAL -> "RSA"

        PublicKeyAlgorithmTags.ECDH,
        PublicKeyAlgorithmTags.ECDSA -> "ECC"

        else -> throw IllegalArgumentException("Unexpected algorithm $algorithm")
    }
}

fun PGPPublicKey.getUserId(): String {
    return userIDs.asSequence().single()
}
