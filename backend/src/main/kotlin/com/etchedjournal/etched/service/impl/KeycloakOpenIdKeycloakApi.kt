package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.dto.UserInfo
import com.etchedjournal.etched.service.OpenIdConnectApi
import com.etchedjournal.etched.service.exception.AuthServerException
import com.etchedjournal.etched.service.exception.UnauthorizedException
import org.keycloak.OAuth2Constants
import org.keycloak.adapters.springsecurity.client.KeycloakClientRequestFactory
import org.keycloak.adapters.springsecurity.client.KeycloakRestTemplate
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate

/**
 * [OpenIdConnectApi] implementation for a confidential Keycloak client.
 */
class KeycloakOpenIdKeycloakApi(
    baseUrl: String,
    private val clientId: String,
    private val clientSecret: String
) : OpenIdConnectApi {

    private val loginUrl: String
    private val logoutUrl: String
    private val userInfoUrl: String

    private val simpleRestTemplate: RestTemplate

    // TODO: Do we have a separate need for KeycloakRestTemplate?
    private val keycloakRestTemplate: KeycloakRestTemplate

    companion object {
        const val FORM_USERNAME = "username"
        const val FORM_PASSWORD = "password"

        const val OPENID_PROTOCOL = "protocol/openid-connect/"
        const val OPENID_TOKEN_URL = OPENID_PROTOCOL + "/token"
        const val OPENID_LOGOUT_URL = OPENID_PROTOCOL + "/logout"
        const val OPENID_USERINFO_URL = OPENID_PROTOCOL + "/userinfo"

        private val logger: Logger = LoggerFactory.getLogger(KeycloakOpenIdKeycloakApi::class.java)

        /**
         * Utility to create an [HttpHeaders] object with [accessToken] in the Authorization header
         *
         * @param accessToken token to write in Authorization header
         */
        @JvmStatic
        private fun authHeaders(accessToken: String): HttpHeaders {
            val headers = HttpHeaders()
            headers.set(HttpHeaders.AUTHORIZATION, accessToken)
            return headers
        }

        /**
         * Utility to throw ServerException when server receives unexpected response from keycloak
         *
         * This handles cases where the restTemplate raises an exception but we know that it's not
         * due to a backend error. For example, an invalid [login] attempt raises an exception
         * because the * backend gets a 401 status code. In that case the value for expected
         * would be [HttpStatus.UNAUTHORIZED]. If we ever received something else, we raise an
         * [AuthServerException]
         *
         * @param expected expected http code
         * @param httpClientErrorException exception raised by rest template operation
         * @throws AuthServerException when exception is not of the expected http code
         */
        @JvmStatic
        private fun handleNonExpectedCode(
            expected: HttpStatus,
            httpClientErrorException: HttpClientErrorException
        ) {
            if (httpClientErrorException.statusCode != expected) {
                // UNEXPECTED!!!
                logger.error("Uncaught exception {}", httpClientErrorException)
                throw AuthServerException("Received unexpected response from keycloak")
            }
        }
    }

    init {
        this.loginUrl = baseUrl + OPENID_TOKEN_URL
        this.logoutUrl = baseUrl + OPENID_LOGOUT_URL
        this.userInfoUrl = baseUrl + OPENID_USERINFO_URL
        this.simpleRestTemplate = RestTemplate(HttpComponentsClientHttpRequestFactory())
        this.keycloakRestTemplate = KeycloakRestTemplate(KeycloakClientRequestFactory())
    }


    override fun login(username: String, password: String): LoginResponse {
        val headers = HttpHeaders()

        val payload = LinkedMultiValueMap<String, String>()
        payload.add(FORM_USERNAME, username)
        payload.add(FORM_PASSWORD, password)
        payload.add(OAuth2Constants.GRANT_TYPE, OAuth2Constants.PASSWORD)

        try {
            // Uses simpleRestTemplate because user is not already logged in
            return post(loginUrl, headers, payload, LoginResponse::class.java, simpleRestTemplate)
        } catch (e: HttpClientErrorException) {
            handleNonExpectedCode(HttpStatus.UNAUTHORIZED, e)
            logger.info("Login attempt failed for username='{}'", username)
            // TODO: Should we throw UnauthorizedException or BadRequestException?
            throw UnauthorizedException("Incorrect username/password")
        }
    }

    override fun logout(accessToken: String, refreshToken: String): Any {
        val headers = authHeaders(accessToken)

        val payload = LinkedMultiValueMap<String, String>()
        payload.add(OAuth2Constants.REFRESH_TOKEN, refreshToken)

        return post(logoutUrl, headers, payload)
    }

    override fun userInfo(accessToken: String): UserInfo {
        val headers = authHeaders(accessToken)

        val payload = LinkedMultiValueMap<String, String>()
        return post(userInfoUrl, headers, payload, UserInfo::class.java)
    }

    private fun post(url: String, headers: HttpHeaders, payload: MultiValueMap<String, String>): Any {
        return post(url, headers, payload, Any::class.java)
    }

    private fun <T> post(
        url: String,
        headers: HttpHeaders,
        payload: MultiValueMap<String, String>,
        responseType: Class<T>
    ): T {
        return post(url, headers, payload, responseType, keycloakRestTemplate)
    }

    private fun <T> post(
        url: String,
        headers: HttpHeaders,
        payload: MultiValueMap<String, String>,
        responseType: Class<T>,
        restTemplate: RestTemplate
    ): T {
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        payload.add(OAuth2Constants.CLIENT_SECRET, clientSecret)
        payload.add(OAuth2Constants.CLIENT_ID, clientId)

        val request = HttpEntity(payload, headers)
        return restTemplate.postForObject(url, request, responseType)
    }
}
