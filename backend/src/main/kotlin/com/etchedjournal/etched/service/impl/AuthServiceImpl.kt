package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.security.SimpleUser
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.OpenIdConnectApi
import org.apache.http.HttpHeaders
import org.keycloak.KeycloakPrincipal
import org.keycloak.KeycloakSecurityContext
import org.keycloak.admin.client.resource.RealmResource
import org.keycloak.admin.client.resource.UserResource
import org.keycloak.admin.client.resource.UsersResource
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.RoleRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import javax.ws.rs.ForbiddenException
import javax.ws.rs.core.Response

@Service
class AuthServiceImpl(
        private val keycloakApi: OpenIdConnectApi,
        etchedRealm: RealmResource
) : AuthService {

    private final val usersResource: UsersResource
    private final val userRoleRepresentation: RoleRepresentation

    companion object {
        val logger: Logger = LoggerFactory.getLogger(AuthServiceImpl::class.java)
    }

    init {
        usersResource = etchedRealm.users()
        try {
            userRoleRepresentation = etchedRealm.roles()["user"].toRepresentation()
        }
        catch(e: ForbiddenException) {
            throw Exception("Unable to fetch realm roles. Client is likely missing appropriate " +
                    "service-account roles.")
        }
    }

    override fun simpleUser(): SimpleUser {
        val kp = keycloakPrincipal()

        val token = kp.keycloakSecurityContext.token
        return SimpleUser(token.subject, token.preferredUsername)
    }

    override fun requestingUser(): EtchedUser {
        return getUser(simpleUser().userId)
    }

    /**
     * Fetch user with the given id
     */
    private fun getUser(userId: String): EtchedUser {
        val user = usersResource.get(userId).toRepresentation()
        return EtchedUser(user.id, user.username, user.email)
    }

    override fun register(username: String, password: String, email: String): EtchedUser {
        // TODO: Handle usernames as case insensitive
        // I.e. usernames are still displayed with case sensitivity but are treated as case
        // insensitive.

        // Prepare payload
        val credentials = CredentialRepresentation()
        credentials.type = CredentialRepresentation.PASSWORD
        credentials.value = password

        val newUser = UserRepresentation()
        newUser.username = username
        newUser.email = email
        // Have to explicitly set enabled = true
        newUser.isEnabled = true
        // accepts a list because other creds may be configured e.g. 2fa
        newUser.credentials = listOf(credentials)

        // Send request
        val newUserResponse = usersResource.create(newUser)

        // Check if response was successful
        if (newUserResponse.statusInfo.family != Response.Status.Family.SUCCESSFUL) {
            when (newUserResponse.statusInfo.toEnum()) {

                // user already exists
                Response.Status.CONFLICT -> {
                    throw Exception("User with username and/or email already exists")
                }

                else -> {
                    throw Exception("Unable to create user $username. Received unexpected status " +
                            "'${newUserResponse.statusInfo}'.")
                }
            }
        }

        // Fetch newly created user
        @Suppress("UNCHECKED_CAST")
        val location = newUserResponse.headers[HttpHeaders.LOCATION] as List<String>
        // Response body contains location (ie path to new user)
        // e.g. http://localhost:9001/auth/admin/realms/etched/users/3b1fa466-b1f3-4544-9924-7f7a2ec351f0
        val userId = location[0].split("/").last()

        // Assign "user" role to user
        val userResource: UserResource = usersResource.get(userId)
        userResource.roles().realmLevel().add(listOf(userRoleRepresentation))

        val user = userResource.toRepresentation()
        return EtchedUser(user.id, user.username, user.email)
    }

    override fun authenticate(username: String, password: String): LoginResponse {
        logger.info("Attempting authenticate for $username")
        return keycloakApi.login(username, password)
    }

//    override fun userInfo(): Any {
//        // TODO: Should we use `usersResource.get(userId) instead?`
//        val principal = keycloakPrincipal()
//        logger.info("Getting userinfo for ${principal.keycloakSecurityContext.token.subject}")
//        val token = principal.keycloakSecurityContext.tokenString
//        return keycloakApi.userInfo("Bearer $token")
//    }

    override fun configureEncryptionProperties(
            algo: String,
            salt: String,
            iterations: Long,
            keySize: Int
    ): EtchedUser {
        TODO("Allow configuration of encryption properties")
    }

    private fun keycloakPrincipal(): KeycloakPrincipal<KeycloakSecurityContext> {
        @Suppress("UNCHECKED_CAST")
        return SecurityContextHolder.getContext().authentication.principal as KeycloakPrincipal<KeycloakSecurityContext>
    }
}
