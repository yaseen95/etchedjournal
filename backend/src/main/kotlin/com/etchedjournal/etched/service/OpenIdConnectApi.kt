package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.dto.UserInfo

/**
 * Interface for Keycloak's openid-connect REST endpoint.
 *
 *
 * There is very basic validation, and no exception handling. These are just examples.
 *
 *
 * Return types are simply Object because I didn't want to create custom classes. However, jackson still serializes them
 * with the json data returned by keycloak.
 */
interface OpenIdConnectApi {
    /**
     * Logs a user in.
     *
     * @param username username of user logging in
     * @param password password of user logging in
     * @return
     */
    fun login(username: String, password: String): LoginResponse

    /**
     * Logs a user out
     *
     * @param accessToken  the bearer token with the "Bearer " prefix
     * @param refreshToken the refresh token that is returned in the payload of [.authenticate]
     * @return
     */
    fun logout(accessToken: String, refreshToken: String): Any

    /**
     * Returns user info
     *
     * @param accessToken the bearer token with the "Bearer " prefix
     * @return
     */
    fun userInfo(accessToken: String): UserInfo
}
