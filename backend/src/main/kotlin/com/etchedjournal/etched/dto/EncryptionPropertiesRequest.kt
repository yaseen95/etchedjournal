package com.etchedjournal.etched.dto

data class EncryptionPropertiesRequest(val algo: String, val salt: String, val iterations: Long,
                                       val keySize: Int)
