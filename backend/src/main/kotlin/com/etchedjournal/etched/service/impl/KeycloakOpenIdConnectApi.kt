package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.TokenResponse
import com.etchedjournal.etched.dto.UserInfo
import com.etchedjournal.etched.service.OpenIdConnectApi
import com.etchedjournal.etched.service.exception.AuthServerException
import com.etchedjournal.etched.service.exception.BadRequestException
import com.etchedjournal.etched.service.exception.ServerException
import com.etchedjournal.etched.service.exception.UnauthorizedException
import com.fasterxml.jackson.databind.ObjectMapper
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
class KeycloakOpenIdConnectApi(
    baseUrl: String,
    private val clientId: String,
    private val clientSecret: String
) : OpenIdConnectApi {

    private val tokenUrl: String
    private val logoutUrl: String
    private val userInfoUrl: String

    private val simpleRestTemplate: RestTemplate
    // KeycloakRestTemplate will automatically add "Authorization" headers for us
    private val keycloakRestTemplate: KeycloakRestTemplate

    companion object {
        const val FORM_USERNAME = "username"
        const val FORM_PASSWORD = "password"

        const val OPENID_PROTOCOL = "protocol/openid-connect/"
        const val OPENID_TOKEN_URL = OPENID_PROTOCOL + "/token"
        const val OPENID_LOGOUT_URL = OPENID_PROTOCOL + "/logout"
        const val OPENID_USERINFO_URL = OPENID_PROTOCOL + "/userinfo"

        // Returned by keycloak when token is invalid/expired
        const val INVALID_GRANT = "invalid_grant"
        const val INVALID_REFRESH_TOKEN = "Invalid refresh token"
        const val REFRESH_TOKEN_EXPIRED = "Refresh token expired"

        private val logger: Logger = LoggerFactory.getLogger(KeycloakOpenIdConnectApi::class.java)

        // Reads json responses from keycloak
        private val OBJECT_READER = ObjectMapper().reader()

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
        tokenUrl = baseUrl + OPENID_TOKEN_URL
        logoutUrl = baseUrl + OPENID_LOGOUT_URL
        userInfoUrl = baseUrl + OPENID_USERINFO_URL
        simpleRestTemplate = RestTemplate(HttpComponentsClientHttpRequestFactory())
        keycloakRestTemplate = KeycloakRestTemplate(KeycloakClientRequestFactory())
    }

    override fun login(username: String, password: String): TokenResponse {
        val payload = LinkedMultiValueMap<String, String>()
        payload.add(FORM_USERNAME, username)
        payload.add(FORM_PASSWORD, password)
        payload.add(OAuth2Constants.GRANT_TYPE, OAuth2Constants.PASSWORD)

        try {
            return post(
                url = tokenUrl,
                responseType = TokenResponse::class.java,
                payload = payload,
                // Uses simpleRestTemplate because user is not already logged in
                restTemplate = simpleRestTemplate
            )
        } catch (e: HttpClientErrorException) {
            handleNonExpectedCode(HttpStatus.UNAUTHORIZED, e)
            logger.info("Login attempt failed for username='{}'", username)
            // TODO: Should we throw UnauthorizedException or BadRequestException?
            throw UnauthorizedException("Incorrect username/password")
        }
    }

    override fun logout(refreshToken: String): Any {
        val payload = LinkedMultiValueMap<String, String>()
        payload.add(OAuth2Constants.REFRESH_TOKEN, refreshToken)

        return post(logoutUrl, Any::class.java, payload)
    }

    override fun userInfo(): UserInfo {
        return post(userInfoUrl, UserInfo::class.java)
    }

    override fun refreshToken(refreshToken: String): TokenResponse {
        val payload = LinkedMultiValueMap<String, String>()
        payload.add(OAuth2Constants.REFRESH_TOKEN, refreshToken)
        payload.add(OAuth2Constants.GRANT_TYPE, OAuth2Constants.REFRESH_TOKEN)

        try {
            return post(tokenUrl, TokenResponse::class.java, payload)
        } catch (e: HttpClientErrorException) {
            handleNonExpectedCode(HttpStatus.BAD_REQUEST, e)

            val (tokenIsInvalid, errorMessage) = isInvalidRefreshToken(e.responseBodyAsString)

            if (!tokenIsInvalid) {
                // If an HttpClientErrorException is thrown and the token isn't invalid, we're not
                // covering a certain condition, log an error and throw an exception.
                logger.error("Unexpected response when refreshing token", e)
                throw AuthServerException(message = "Server was unable to refresh token")
            }

            // Expected situation
            logger.info("Refreshing token failed because token is invalid")
            throw BadRequestException(message = errorMessage)
        }
    }

    private fun <T> post(
        url: String,
        responseType: Class<T>,
        payload: MultiValueMap<String, String>? = null,
        headers: HttpHeaders? = null,
        restTemplate: RestTemplate = keycloakRestTemplate
    ): T {
        val requestHeaders = headers ?: HttpHeaders()
        requestHeaders.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val requestPayload = payload ?: LinkedMultiValueMap<String, String>()
        requestPayload.add(OAuth2Constants.CLIENT_SECRET, clientSecret)
        requestPayload.add(OAuth2Constants.CLIENT_ID, clientId)

        val request = HttpEntity(payload, requestHeaders)
        return restTemplate.postForObject(url, request, responseType)
    }

    /**
     * Checks if a refresh token is invalid, if so includes an appropriate error message
     *
     * @param response the response JSON returned by keycloak
     * @return a bool indicating token is invalid AND an appropriate error message only if
     * the token is invalid
     */
    private fun isInvalidRefreshToken(response: String): Pair<Boolean, String> {
        val jsonNode = OBJECT_READER.readTree(response)

        if (jsonNode.get(OAuth2Constants.ERROR).textValue() == INVALID_GRANT) {
            val errorDescription = jsonNode.get(OAuth2Constants.ERROR_DESCRIPTION).textValue()
            return when (errorDescription) {
                // Error messages returned by keycloak are good, lets use them
                INVALID_REFRESH_TOKEN -> Pair(true, INVALID_REFRESH_TOKEN)
                REFRESH_TOKEN_EXPIRED -> Pair(true, REFRESH_TOKEN_EXPIRED)
                else -> throw ServerException(logMessage = "Received unexpected error description" +
                    " from keycloak: $errorDescription")
            }
        }
        return Pair(false, "")
    }
}
