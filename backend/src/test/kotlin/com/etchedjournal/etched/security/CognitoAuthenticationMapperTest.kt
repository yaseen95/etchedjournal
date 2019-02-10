package com.etchedjournal.etched.security

import com.auth0.jwt.impl.NullClaim
import com.auth0.jwt.interfaces.Claim
import com.auth0.jwt.interfaces.DecodedJWT
import com.etchedjournal.etched.security.jwt.JwtException
import com.nhaarman.mockitokotlin2.mock
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.`when`
import java.util.Date

class CognitoAuthenticationMapperTest {

    private lateinit var mapper: CognitoAuthenticationMapper
    private lateinit var jwt: DecodedJWT

    @Before
    fun setup() {
        mapper = CognitoAuthenticationMapper()
        jwt = mock()
    }

    @Test
    fun map() {
        `when`(jwt.getClaim("username")).thenReturn(StringClaim("samsepiol"))
        `when`(jwt.subject).thenReturn("subject")

        val auth = mapper.mapToAuthentication(jwt)
        val expected = CognitoAuthentication(
            sub = "subject",
            username = "samsepiol",
            // TODO: Extract preferred username
            preferredUsername = ""
        )
        assertEquals(auth, expected)
    }

    @Test(expected = JwtException::class)
    fun `map - username is null`() {
        `when`(jwt.getClaim("username")).thenReturn(NullClaim())
        mapper.mapToAuthentication(jwt)
    }

    @Test(expected = JwtException::class)
    fun `map - subject is null`() {
        `when`(jwt.subject).thenReturn(null)
        `when`(jwt.getClaim("username")).thenReturn(StringClaim("samspeiol"))
        mapper.mapToAuthentication(jwt)
    }

    // Claim class used for tests that throws
    // extended by other type specific claim classes
    open class TestClaim : Claim {
        override fun asString(): String = throw NotImplementedError()
        override fun isNull(): Boolean = throw NotImplementedError()
        override fun asDate(): Date = throw NotImplementedError()
        override fun asMap(): MutableMap<String, Any> = throw NotImplementedError()
        override fun <T : Any?> asList(tClazz: Class<T>?): MutableList<T> = throw NotImplementedError()
        override fun asLong(): Long = throw NotImplementedError()
        override fun <T : Any?> `as`(tClazz: Class<T>?): T = throw NotImplementedError()
        override fun asBoolean(): Boolean = throw NotImplementedError()
        override fun asDouble(): Double = throw NotImplementedError()
        override fun <T : Any?> asArray(tClazz: Class<T>?): Array<T> = throw NotImplementedError()
        override fun asInt(): Int = throw NotImplementedError()
    }

    class StringClaim(private val s: String) : TestClaim() {
        override fun asString(): String = s
        override fun isNull(): Boolean = false
    }
}
