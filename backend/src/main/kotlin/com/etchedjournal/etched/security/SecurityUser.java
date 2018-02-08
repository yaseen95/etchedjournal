package com.etchedjournal.etched.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Implementation of Spring's UserDetails. This object is stored inside
 * getAuthentication().getPrincipal()
 */
public class SecurityUser implements UserDetails {

    private String username;
    private String password;
    private Collection<GrantedAuthority> authorities;

    public SecurityUser() {

    }

    public SecurityUser(String username, String password) {
        this(username, password, java.util.Collections.emptyList());
    }

    public SecurityUser(String username, String password, Collection<GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
