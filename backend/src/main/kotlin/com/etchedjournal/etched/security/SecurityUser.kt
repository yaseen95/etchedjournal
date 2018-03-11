package com.etchedjournal.etched.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

/**
 * Implementation of Spring's UserDetails. This object is stored inside
 * getAuthentication().getPrincipal()
 */
class SecurityUser(
        private val username: String,
        private val password: String,
        private val authorities: Collection<GrantedAuthority>,
        val userId: Long?) : UserDetails {

    override fun getUsername(): String {
        return username
    }

    override fun getPassword(): String {
        return password
    }

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return authorities
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }
}
