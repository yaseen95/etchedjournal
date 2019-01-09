package com.etchedjournal.etched.security.jwt

import com.auth0.jwk.JwkProvider
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import org.slf4j.LoggerFactory
import java.security.interfaces.RSAPublicKey

open class TokenProcessor(private val jwkProvider: JwkProvider) {

    open fun process(token: String): DecodedJWT {
        val decoded = JWT.decode(token)
        logger.info("Decoding token for sub {}", decoded.subject)
        val algorithm = getTokenAlgo(decoded)
        algorithm.verify(decoded)

        val tokenType = decoded.getClaim(TOKEN_USE).asString()
        if (tokenType != ACCESS_TOKEN_TYPE) {
            throw JwtException("Unexpected token type $tokenType")
        }
        logger.info("Verified token for {}", decoded.subject)
        return decoded
    }

    private fun getTokenAlgo(decodedJWT: DecodedJWT): Algorithm {
        val jwk = jwkProvider.get(decodedJWT.keyId)
        val algo = jwk.algorithm

        when (algo) {
            "RS256" -> {
                val publicKey = jwk.publicKey as RSAPublicKey
                return Algorithm.RSA256(publicKey, null)
            }
            else -> {
                logger.error("Unsupported jwt algorithm {}", algo)
                throw RuntimeException("Unsupported jwt algorithm $algo")
            }
        }
    }

    companion object {
        private val logger = LoggerFactory.getLogger(TokenProcessor::class.java)
        const val TOKEN_USE = "token_use"
        const val ACCESS_TOKEN_TYPE = "access"
    }
}
