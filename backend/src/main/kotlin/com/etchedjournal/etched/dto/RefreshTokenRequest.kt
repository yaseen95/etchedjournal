package com.etchedjournal.etched.dto

/**
 * DTO representing JSON payload required to refresh a token
 */
data class RefreshTokenRequest(val refreshToken: String) {
    override fun toString(): String {
        // We don't want to accidentally log a refresh token
        return "RefreshToken()"
    }
}
