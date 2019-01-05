package com.etchedjournal.etched.security

import com.auth0.jwk.JwkProvider
import com.etchedjournal.etched.security.jwt.TokenProcessor
import com.nhaarman.mockitokotlin2.mock
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean

@TestConfiguration
class CognitoFilterTestConfig {

    @Bean
    fun jwkProvider(): JwkProvider {
        return mock()
    }

    @Bean
    fun tokenProcessor(jwkProvider: JwkProvider): TokenProcessor {
        return TokenProcessor(jwkProvider)
    }

    @Bean
    fun mapper(): CognitoAuthenticationMapper {
        return CognitoAuthenticationMapper()
    }

    @Bean
    fun cognitoFilter(
        tokenProcessor: TokenProcessor,
        mapper: CognitoAuthenticationMapper
    ): CognitoAuthenticationFilter {
        return CognitoAuthenticationFilter(tokenProcessor, mapper)
    }
}
