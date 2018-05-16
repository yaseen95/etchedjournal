package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.dto.UserInfo
import org.springframework.util.LinkedMultiValueMap
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate
import com.etchedjournal.etched.service.OpenIdConnectApi
import org.keycloak.OAuth2Constants
import org.keycloak.adapters.springsecurity.client.KeycloakClientRequestFactory
import org.keycloak.adapters.springsecurity.client.KeycloakRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.util.MultiValueMap


/**
 * [OpenIdConnectApi] implementation for a confidential Keycloak client.
 */
class KeycloakOpenIdKeycloakApi(baseUrl: String, private val clientId: String, private val clientSecret: String): OpenIdConnectApi {

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

        @JvmStatic
        private fun authHeaders(accessToken: String): HttpHeaders {
            val headers = HttpHeaders()
            headers.set(HttpHeaders.AUTHORIZATION, accessToken)
            return headers
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

        // Uses simpleRestTemplate because user is not already logged in
        return post(loginUrl, headers, payload, LoginResponse::class.java, simpleRestTemplate)
    }

    override fun logout(accessToken: String, refreshToken: String): Any {
        val headers = authHeaders(accessToken)

        val payload = LinkedMultiValueMap<String, String>()
        payload.add(OAuth2Constants.REFRESH_TOKEN, refreshToken)

        return post(logoutUrl, headers, payload)
    }

    override fun userInfo(accessToken: String): UserInfo {
        val headers = HttpHeaders()
        headers.set(HttpHeaders.AUTHORIZATION, accessToken)

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
