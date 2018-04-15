package com.etchedjournal.etched.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Login Response returned from the openid-connect endpoint of keycloak.
 *
 * This class is used as a DTO and transforms the openid-connect payload (which use snake_case)
 * keys into camelCase keys.
 */
public class LoginResponse {
    private String accessToken;
    private Long expiresIn;
    private Long refreshExpiresIn;
    private String refreshToken;

    @JsonProperty("accessToken")
    public String getAccessToken() {
        return accessToken;
    }

    @JsonProperty("access_token")
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    @JsonProperty("expiresIn")
    public Long getExpiresIn() {
        return expiresIn;
    }

    @JsonProperty("expires_in")
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    @JsonProperty("refreshExpiresIn")
    public Long getRefreshExpiresIn() {
        return refreshExpiresIn;
    }

    @JsonProperty("refresh_expires_in")
    public void setRefreshExpiresIn(Long refreshExpiresIn) {
        this.refreshExpiresIn = refreshExpiresIn;
    }

    @JsonProperty("refreshToken")
    public String getRefreshToken() {
        return refreshToken;
    }

    @JsonProperty("refresh_token")
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
