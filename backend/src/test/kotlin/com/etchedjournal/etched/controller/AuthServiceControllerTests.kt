package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestUtils
import com.etchedjournal.etched.dto.AuthenticationRequest
import com.etchedjournal.etched.dto.RegisterRequest
import com.jayway.jsonpath.JsonPath
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.nullValue
import org.junit.Assert
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.Period

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
class AuthServiceControllerTests {

    @Autowired
    private lateinit var authController: AuthServiceController

    private lateinit var mockMvc: MockMvc

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .build()
    }

    @Test
    @Throws(Exception::class)
    fun `test register`() {
        val registerRequest = RegisterRequest("tester", "test123", "a@test.com")

        val requestJson = TestUtils.asJson(registerRequest)
        val result = mockMvc
                .perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.id").isNumber)
                .andExpect(jsonPath("$.username", `is`("tester")))
                .andExpect(jsonPath("$.email", `is`("a@test.com")))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.admin", `is`(false)))
                .andExpect(jsonPath("$.algo", nullValue()))
                .andExpect(jsonPath("$.salt", nullValue()))
                .andExpect(jsonPath("$.keySize", nullValue()))
                .andExpect(jsonPath("$.iterations", nullValue()))
                .andReturn()

        val token = JsonPath.read<String>(result.response.contentAsString, "$.token")
        val c = jwtTokenUtils.getClaimsFromToken(token)
        Assert.assertEquals("tester", c["username"])
        Assert.assertEquals("a@test.com", c["email"])
        Assert.assertEquals(false, c["admin"])
    }

    @Test
    fun `test authenticate`() {
        val result = authenticate(AuthenticationRequest("testuser", "password"))
                .andExpect(status().isOk)
                .andExpect(jsonPath(".token").exists())
                .andReturn()

        val token = TestUtils.fromString(result.response.contentAsString)["token"].textValue()
        val claims = jwtTokenUtils.getClaimsFromToken(token)
        Assert.assertEquals("testuser", claims.subject)
    }

    @Test
    @Throws(Exception::class)
    fun `test token expiry`() {
        // Authenticates and checks that the token is valid and expires in seven days.
        val token = getTokenFor("testuser", "password")
        val c = jwtTokenUtils.getClaimsFromToken(token)

        val expiry = c.expiration.toInstant()
        val expected = Instant.now().plus(Period.ofDays(7))
        // Takes a little bit of time to process so we allow a 1 second window
        Assert.assertTrue(Math.abs(expiry.epochSecond - expected.epochSecond) <= 1)
    }

    @Throws(Exception::class)
    private fun authenticate(authRequest: AuthenticationRequest): ResultActions {
        val authRequestJson = TestUtils.asJson(authRequest)
        return mockMvc
                .perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(authRequestJson))
    }

    @Throws(Exception::class)
    private fun getTokenFor(username: String, password: String): String {
        val request = AuthenticationRequest(username, password)
        val result = authenticate(request).andReturn()
        return JsonPath.read(result.response.contentAsString, "$.token")
    }
}
