package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.security.CognitoAuthentication
import com.etchedjournal.etched.security.EtchedUser
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.springframework.security.core.context.SecurityContextHolder

class AuthServiceImplTest {

    private lateinit var authService: AuthServiceImpl

    @Before
    fun setup() {
        authService = AuthServiceImpl()
        SecurityContextHolder.clearContext()
    }

    @Test
    fun getUserId() {
        setAuthentication(sub = "id", username = "username")
        val actual = authService.getUserId()
        assertEquals("id", actual)
    }

    @Test
    fun getUser() {
        setAuthentication(sub = "id", username = "username")
        val actual = authService.getUser()
        assertEquals(EtchedUser("id", "username"), actual)
    }

    @Test
    fun getPrincipal() {
        setAuthentication(sub = "id", username = "username", preferredUsername = "samsepiol")
        val actual = authService.getPrincipal()

        val expected = CognitoAuthentication(
            sub = "id",
            username = "username",
            preferredUsername = "samsepiol"
        )
        assertEquals(expected, actual)
    }

    @Test(expected = IllegalStateException::class)
    fun `getUserId() - throws if authentication is null`() {
        authService.getUserId()
    }

    // TODO: Test fetchUserDetails

    private fun setAuthentication(sub: String, username: String, preferredUsername: String = "") {
        SecurityContextHolder.getContext().authentication = CognitoAuthentication(
            sub = sub,
            username = username,
            preferredUsername = preferredUsername
        )
    }
}
