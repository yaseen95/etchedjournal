package com.etchedjournal.etched.security

import com.etchedjournal.etched.EtchedApplication
import com.etchedjournal.etched.entity.EtchedUser
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.*

/**
 * Util class that manages jwt operations.
 */
@Component
class JwtTokenUtils(@Value("\${com.etchedjournal.etched.jwt.secretKey}") jwtSecretKey: String) {

    private val secretKey: ByteArray

    init {
        EtchedApplication.log.info("Creating JwtTokenUtils")
        this.secretKey = jwtSecretKey.toByteArray()
    }

    @Throws(JwtException::class)
    fun getUsernameFromToken(token: String): String {
        return getClaimsFromToken(token).subject
    }

    fun getTokenExpiry(token: String): Date {
        return getClaimsFromToken(token).expiration
    }

    @Throws(JwtException::class)
    fun getClaimsFromToken(token: String): Claims {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .body
    }

    fun generateToken(user: EtchedUser): String {
        EtchedApplication.log.info("Generating token for {}", user)
        val claims = HashMap<String, Any>()
        claims["username"] = user.username
        claims["admin"] = user.admin
        claims["email"] = user.email
        claims["id"] = user.id!! // user id is not null if we've fetched from db.
        return generateToken(user.username, claims,
                Date.from(ZonedDateTime.now().plusWeeks(1).toInstant()))
    }

    @Throws(JwtException::class)
    fun generateToken(subject: String, claims: Map<String, Any>, expiry: Date): String {

        return Jwts.builder()
                .setClaims(claims)
                // set subject after claims or else setting claims will overwrite subject
                .setSubject(subject)
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .setExpiration(expiry)
                .compact()
    }

    @Throws(JwtException::class)
    fun validateToken(token: String, userDetails: UserDetails): Boolean {
        if (!getTokenExpiry(token).after(Date())) {
            throw JwtException("Token has expired. Authenticate again.")
        }
        return getUsernameFromToken(token) == userDetails.username
    }
}
