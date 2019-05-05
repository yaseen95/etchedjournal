package com.etchedjournal.etched.security

import com.auth0.jwt.interfaces.DecodedJWT
import com.etchedjournal.etched.security.jwt.TokenProcessor
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.springframework.security.core.context.SecurityContextHolder
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class CognitoAuthenticationFilterTest {

    private lateinit var tokenProcessor: TokenProcessor
    private lateinit var request: HttpServletRequest
    private lateinit var response: HttpServletResponse
    private lateinit var filterChain: FilterChain
    private lateinit var mapper: CognitoAuthenticationMapper
    private lateinit var mockToken: DecodedJWT

    private val auth = CognitoAuthentication("sub", "username", "samsepiol")

    @Before
    fun setup() {
        tokenProcessor = mock()
        request = mock()
        response = mock()
        filterChain = mock()
        mapper = mock()
        mockToken = mock()

        `when`(mapper.mapToAuthentication(any())).thenReturn(auth)
        SecurityContextHolder.getContext().authentication = null
    }

    @Test
    fun `extracts auth token from header and sets authentication`() {
        `when`(tokenProcessor.process("token")).thenReturn(mockToken)
        `when`(request.getHeader("Authorization")).thenReturn("Bearer token")

        val filter = CognitoAuthenticationFilter(tokenProcessor, mapper)
        filter.doFilter(request, response, filterChain)

        // auth should be set
        assertEquals(auth, SecurityContextHolder.getContext().authentication)

        verify(tokenProcessor, times(1)).process("token")
        verify(request, times(1)).getHeader("Authorization")
    }

    @Test
    fun `no auth is set if token is not defined`() {
        `when`(request.getHeader("Authorization")).thenReturn(null)

        val filter = CognitoAuthenticationFilter(tokenProcessor, mapper)
        filter.doFilter(request, response, filterChain)

        // auth should be null
        assertNull(SecurityContextHolder.getContext().authentication)

        verify(request, times(1)).getHeader("Authorization")
        verify(tokenProcessor, never()).process(any())
    }

    @Test
    fun `strips Bearer prefix from token`() {
        // We currently just remove the first 7 chars without checking that it actually starts
        // with 'Bearer '. This test will break if we enforce this check.
        `when`(request.getHeader("Authorization")).thenReturn("1234567token")

        val filter = CognitoAuthenticationFilter(tokenProcessor, mapper)
        filter.doFilter(request, response, filterChain)

        verify(tokenProcessor, times(1)).process("token")
    }
}
