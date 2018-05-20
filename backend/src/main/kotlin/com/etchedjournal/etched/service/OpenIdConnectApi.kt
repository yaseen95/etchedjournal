package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.TokenResponse
import com.etchedjournal.etched.dto.UserInfo

/**
 * Interface for Keycloak's openid-connect REST endpoint.
 *
 * This *is not* a good interface abstraction for a generalised openid-connect endpoint. The
 * interface does not define accessToken params because the implementation
 * [com.etchedjournal.etched.service.impl.KeycloakOpenIdConnectApi] uses a
 * [org.keycloak.adapters.springsecurity.client.KeycloakRestTemplate] internally, which will
 * extract the access token automatically and use that when interacting with keycloak.
 */
interface OpenIdConnectApi {
    /**
     * Logs a user in.
     *
     * @param username username of user logging in
     * @param password password of user logging in
     * @return access tokens which can be used to access the service
     */
    fun login(username: String, password: String): TokenResponse

    /**
     * Logs a user out
     *
     * @param refreshToken the refresh token that is returned in the payload of [.authenticate]
     */
    fun logout(refreshToken: String): Any

    /**
     * Gets user details using their access token
     *
     * @return user details of requesting user
     */
    fun userInfo(): UserInfo

    /**
     * Refreshes a token using the refreshToken provided on first login
     *
     * @param refreshToken refresh token that was provided when they last authenticated/refreshed
     * @return updated tokens which can be used to continue to access the service
     */
    fun refreshToken(refreshToken: String): TokenResponse
}
