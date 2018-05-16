package com.etchedjournal.etched.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * User info returned from the openid-connect endpoint of keycloak.
 *
 * This class is used as a DTO and transforms the openid-connect payload (which use snake_case)
 * keys into camelCase keys.
 *
 * This specific one does some fairly significant renaming.
 */
public class UserInfo {
    private String id;
    private String username;

    @JsonProperty("id")
    public String getId() {
        return id;
    }

    @JsonProperty("sub")
    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("username")
    public String getUsername() {
        return username;
    }

    @JsonProperty("preferred_username")
    public void setUsername(String username) {
        this.username = username;
    }
}
