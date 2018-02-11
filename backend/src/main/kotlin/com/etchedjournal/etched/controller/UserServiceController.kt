package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptionPropertiesRequest
import com.etchedjournal.etched.service.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users/user/")
class UserServiceController {

    @Autowired
    private lateinit var userService: UserService

    // TODO: Is RequestMethod.PATCH more appropriate?
    @RequestMapping("/configure-encryption", method = [RequestMethod.POST])
    fun configureEncryptionProperties(
            @RequestBody encryptionPropertiesRequest: EncryptionPropertiesRequest
    ): ResponseEntity<Any> {
        userService.configureEncryptionProperties(
                algo = encryptionPropertiesRequest.algo,
                salt = encryptionPropertiesRequest.salt,
                iterations = encryptionPropertiesRequest.iterations,
                keySize = encryptionPropertiesRequest.keySize
        )
        return ResponseEntity.ok(null)
    }
}
