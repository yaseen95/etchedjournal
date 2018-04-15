package com.etchedjournal.etched.security

import net.jcip.annotations.Immutable

/**
 * Contains basic user details needed for use by the application
 *
 * The details embedded are derived from the provided bearer token. This avoids requiring another
 * call to the backend auth server (keycloak).
 */
@Immutable
data class SimpleUser(val userId: String, val username: String)
