package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestUtils
import com.etchedjournal.etched.dto.EncryptionPropertiesRequest
import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.repository.EtchedUserRepository
import com.etchedjournal.etched.security.JwtTokenUtils
import com.etchedjournal.etched.service.AuthService
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status


@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
class UserServiceControllerTests {

    @Autowired
    private lateinit var etchedUserRepository: EtchedUserRepository

    @Autowired
    private lateinit var bCryptPasswordEncoder: BCryptPasswordEncoder

    @Autowired
    private lateinit var userServiceController: UserServiceController

    @Autowired
    private lateinit var authService: AuthService

    @Autowired
    private lateinit var jwtTokenUtils: JwtTokenUtils

    private lateinit var mockMvc: MockMvc

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userServiceController)
                .build()

        // Initialise database
        val hashedPassword = bCryptPasswordEncoder.encode("password")
        etchedUserRepository.save(EtchedUser(null, "testuser", hashedPassword, "a@example.com"))
    }

    @Test
    fun `test configure encryption properties`() {
        val authToken = getAuthToken()
        val encryptionPropertiesRequest = EncryptionPropertiesRequest("PBKDF2", "salt", Long
                .MAX_VALUE, 256)

        mockMvc.perform(
                post("/api/v1/users/user/configure-encryption")
                    .header(HttpHeaders.AUTHORIZATION, authToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtils.asJson(encryptionPropertiesRequest)))
                .andExpect(status().isOk)

        val user = etchedUserRepository.findByUsername("testuser")!!
        assertEquals("PBKDF2", user.algo)
        assertEquals("salt", user.salt)
        assertEquals(Long.MAX_VALUE, user.iterations)
        assertEquals(256, user.keySize)
    }
    
    fun getAuthToken(): String {
        // Have to authenticate first otherwise SecurityContextHolder.getContext().authentication
        // will be null
        authService.authenticate("testuser", "password")
        val user = etchedUserRepository.findByUsername("testuser")!!
        return jwtTokenUtils.generateToken(user)
    }
}
