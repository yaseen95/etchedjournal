package com.etchedjournal.etched

import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.OpenIdConnectApi
import com.etchedjournal.etched.service.impl.AuthServiceImpl
import com.etchedjournal.etched.service.impl.KeycloakOpenIdKeycloakApi
import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class EtchedConfig {
    companion object {
        val log: Logger = LoggerFactory.getLogger(EtchedConfig::class.java)
    }

    @Bean
    fun openIdConnectApi(
            @Value("\${keycloak.auth-server-url}") authServerUrl: String,
            @Value("\${keycloak.realm}") realm: String,
            @Value("\${keycloak.resource}") resource: String,
            @Value("\${keycloak.credentials.secret}") clientSecret: String
    ): OpenIdConnectApi {
        return KeycloakOpenIdKeycloakApi("$authServerUrl/realms/$realm/", resource, clientSecret)
    }

    @Bean
    fun keycloak(
            @Value("\${keycloak.auth-server-url}") authServerUrl: String,
            @Value("\${keycloak.realm}") realm: String,
            @Value("\${keycloak.resource}") resource: String,
            @Value("\${keycloak.credentials.secret}") clientSecret: String
    ): Keycloak {
        return KeycloakBuilder.builder()
                .clientId(resource)
                .clientSecret(clientSecret)
                .serverUrl(authServerUrl)
                .realm(realm)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .build()
    }

    @Bean()
    fun etchedRealm(
            keycloak: Keycloak,
            @Value("\${keycloak.realm}") realm: String
    ): RealmResource {
        return keycloak.realm(realm)
    }

    @Bean
    fun authService(openIdConnectApi: OpenIdConnectApi, etchedRealm: RealmResource): AuthService {
        return AuthServiceImpl(openIdConnectApi, etchedRealm)
    }
}
