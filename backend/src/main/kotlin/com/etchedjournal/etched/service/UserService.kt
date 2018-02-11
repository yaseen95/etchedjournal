package com.etchedjournal.etched.service

import com.etchedjournal.etched.entity.EtchedUser

interface UserService {

    fun configureEncryptionProperties(algo: String, salt: String, iterations: Long, keySize: Int):
            EtchedUser
}
