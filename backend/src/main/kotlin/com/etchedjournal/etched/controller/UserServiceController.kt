package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptionPropertiesRequest
import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users/user")
class UserServiceController {

    @Autowired
    private lateinit var userService: UserService


    @Autowired
    private lateinit var authService: AuthService;


    // TODO: Is RequestMethod.PATCH more appropriate?
    @RequestMapping("/configure-encryption", method = [RequestMethod.POST])
    fun configureEncryptionProperties(
            @RequestBody encryptionPropertiesRequest: EncryptionPropertiesRequest
    ): EtchedUser {
        return userService.configureEncryptionProperties(
                user = authService.getRequestingUser(),
                algo = encryptionPropertiesRequest.algo,
                salt = encryptionPropertiesRequest.salt,
                iterations = encryptionPropertiesRequest.iterations,
                keySize = encryptionPropertiesRequest.keySize
        )
    }

    @RequestMapping("/me", method = [RequestMethod.GET])
    fun getUser(): EtchedUser {
        return authService.getRequestingUser();
    }
}
