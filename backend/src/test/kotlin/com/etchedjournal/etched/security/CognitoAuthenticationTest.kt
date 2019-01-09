package com.etchedjournal.etched.security

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.springframework.security.core.authority.SimpleGrantedAuthority

class CognitoAuthenticationTest {
    private val auth = CognitoAuthentication(
        sub = "sub",
        username = "username",
        preferredUsername = "preferredUsername"
    )

    @Test
    fun equals() {
        // seems like a pretty trivial test but this is important to get right
        val auth2 = CognitoAuthentication(
            sub = "sub",
            username = "username",
            preferredUsername = "preferredUsername"
        )
        assertEquals(auth, auth2)
        assertFalse(auth === auth2)
    }

    @Test
    fun `auth only has one authority`() {
        assertEquals(setOf(SimpleGrantedAuthority("ROLE_USER")), auth.authorities)
    }

    @Test(expected = NotImplementedError::class)
    fun `auth credentials not implemented`() {
        // TODO: This test will fail once we implement credentials
        auth.credentials
    }

    @Test
    fun `auth details is null`() {
        assertNull(auth.details)
    }

    @Test
    fun `auth is authenticated`() {
        assertTrue(auth.isAuthenticated)
    }

    @Test
    fun `name is the user id`() {
        assertEquals("sub", auth.name)
    }

    @Test
    fun `principal is the auth itself`() {
        assertTrue(auth.principal === auth)
    }
}
