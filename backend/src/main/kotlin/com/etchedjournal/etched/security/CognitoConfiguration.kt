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
        @Value("\${com.etchedjournal.auth.cognito.userpoolid}") userPoolId: String
    ): JwkProvider {
        // https://aws.amazon.com/premiumsupport/knowledge-center/decode-verify-cognito-json-token/
        // URL of jwks.json is derived using
        // https://cognito-idp.{aws region}.amazonaws.com/{user pool id}/.well-known/jwks.json
        val region = userPoolId.split("_")[0]
        val url = URL("https://cognito-idp.$region.amazonaws.com/$userPoolId/.well-known/jwks.json")
        return JwkProviderBuilder(url).cached(true).build()
    }
}
