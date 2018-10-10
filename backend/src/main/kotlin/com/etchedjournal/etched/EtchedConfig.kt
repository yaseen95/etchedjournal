package com.etchedjournal.etched

import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.OpenIdConnectApi
import com.etchedjournal.etched.service.impl.AuthServiceImpl
import com.etchedjournal.etched.service.impl.KeycloakOpenIdConnectApi
import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

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
        return KeycloakOpenIdConnectApi("$authServerUrl/realms/$realm/", resource, clientSecret)
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

/**
 * Configures logging to include user id in log messages
 *
 * https://moelholm.com/2016/08/16/spring-boot-enhance-your-logging/
 */
@Component
class UserIdLoggerFilter(private val authService: AuthService) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            SecurityContextHolder.getContext().authentication.principal
            val userId = authService.getUserIdOrNull() ?: "anonymous"
            MDC.put("userId", userId)
            filterChain.doFilter(request, response)
        } finally {
            MDC.clear()
        }
    }
}
