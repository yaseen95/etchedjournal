package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.repository.EtchedUserRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class UserServiceImpl : UserService {
    @Autowired
    private lateinit var authService: AuthService

    @Autowired
    private lateinit var etchedUserRepository: EtchedUserRepository

    override fun configureEncryptionProperties(algo: String, salt: String, iterations: Long,
                                               keySize: Int): EtchedUser {
        val user = authService.getRequestingUser()
        user.algo = algo
        user.iterations = iterations
        user.keySize = keySize
        user.salt = salt
        return etchedUserRepository.save(user)
    }
}
