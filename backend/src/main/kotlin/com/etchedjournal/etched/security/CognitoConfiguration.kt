package com.etchedjournal.etched.security

import com.auth0.jwk.JwkProvider
import com.auth0.jwk.JwkProviderBuilder
import com.etchedjournal.etched.security.jwt.TokenProcessor
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import java.net.URL

@Configuration
class CognitoConfiguration {

    @Primary
    @Bean
    fun cognitoAuthFilter(
        tokenProcessor: TokenProcessor,
        mapper: CognitoAuthenticationMapper
    ): CognitoAuthenticationFilter {
        return CognitoAuthenticationFilter(
            tokenProcessor = tokenProcessor,
            mapper = mapper
        )
    }

    @Bean
    fun tokenProcessor(jwkProvider: JwkProvider): TokenProcessor {
        return TokenProcessor(jwkProvider)
    }

    @Bean
    fun cognitoAuthenticationMapper(): CognitoAuthenticationMapper {
        return CognitoAuthenticationMapper()
    }

    @Bean
    fun jwkProvider(
        @Value("\${com.etchedjournal.auth.jwk.url}") jwkUrl: String
    ): JwkProvider {
        val url = URL(jwkUrl)
        return JwkProviderBuilder(url).cached(true).build()
    }
}
