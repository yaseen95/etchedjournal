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
import org.keycloak.representations.AccessToken
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.RoleRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import javax.ws.rs.ForbiddenException
import javax.ws.rs.core.Response

private data class EncryptionProperties(val algo: String?, val salt: String?, val iterations: Long?, val keySize: Int?)

@Service
class AuthServiceImpl(
        private val openIdConnectApi: OpenIdConnectApi,
        etchedRealm: RealmResource
) : AuthService {

    private final val usersResource: UsersResource
    private final val userRoleRepresentation: RoleRepresentation

    companion object {
        val logger: Logger = LoggerFactory.getLogger(AuthServiceImpl::class.java)
        private const val ALGO = "algo"
        private const val SALT = "salt"
        private const val ITERATIONS = "iterations"
        private const val KEY_SIZE = "keySize"

        /**
         * Transforms the encryption properties of the [UserRepresentation.attributes]
         */
        private fun getEncryptionProperties(user: UserRepresentation): EncryptionProperties {
            if (user.attributes == null) {
                return EncryptionProperties(null, null, null, null)
            }

            val algo: String? = getSingleOrNull(user.attributes[ALGO])
            val salt: String? = getSingleOrNull(user.attributes[SALT])
            val iterations: Long? = getSingleOrNull(user.attributes[ITERATIONS])?.toLong()
            val keySize: Int? = getSingleOrNull(user.attributes[KEY_SIZE])?.toInt()
            return EncryptionProperties(algo, salt, iterations, keySize)
        }

        /**
         * Returns the sole element in the list or null if it doesn't contain a single element.
         *
         * @throws IllegalArgumentException if list contains more than one element
         */
        private fun <T> getSingleOrNull(l: List<T>?): T? {
            if (l == null || l.isEmpty()) {
                return null
            }
            if (l.size > 1) {
                throw IllegalArgumentException("List has more than one element")
            }
            return l[0]
        }

        /**
         * Converts a [UserRepresentation] into an [EtchedUser] object
         */
        private fun repToUser(user: UserRepresentation): EtchedUser {
            val encryptionProperties = getEncryptionProperties(user)
            return EtchedUser(
                    id = user.id,
                    username = user.username,
                    email = user.email,
                    algo = encryptionProperties.algo,
                    salt = encryptionProperties.salt,
                    iterations = encryptionProperties.iterations,
                    keySize = encryptionProperties.keySize
            )
        }
    }

    init {
        usersResource = etchedRealm.users()
        try {
            userRoleRepresentation = etchedRealm.roles()["user"].toRepresentation()
        } catch (e: ForbiddenException) {
            throw Exception("Unable to fetch realm roles. Client is likely missing appropriate " +
                    "service-account roles.")
        }
    }

    override fun simpleUser(): SimpleUser {
        val token = getAccessToken()
        return SimpleUser(token.subject, token.preferredUsername)
    }

    override fun requestingUser(): EtchedUser {
        return getUser(simpleUser().userId)
    }

    /**
     * Fetch user with the given id
     */
    private fun getUser(userId: String): EtchedUser {
        val userRepresentation = usersResource.get(userId).toRepresentation()
        return repToUser(userRepresentation)
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

        return repToUser(userResource.toRepresentation())
    }

    override fun authenticate(username: String, password: String): LoginResponse {
        logger.info("Attempting authentication for username='$username'")
        return openIdConnectApi.login(username, password)
    }

    override fun configureEncryptionProperties(
            algo: String,
            salt: String,
            iterations: Long,
            keySize: Int
    ): EtchedUser {
        // Get user representation
        val userRepresentation = getUserRepresentation()
        logger.info("Configuring encryption for ${userRepresentation.id}")

        // Attributes == null when the user first registers
        if (userRepresentation.attributes == null) {
            userRepresentation.attributes = HashMap<String, List<String>>()
        }

        userRepresentation.attributes.putAll(mapOf(
                ALGO to listOf(algo),
                SALT to listOf(salt),
                ITERATIONS to listOf(iterations.toString()),
                KEY_SIZE to listOf(keySize.toString())
        ))

        val userResource: UserResource = usersResource.get(userRepresentation.id)
        userResource.update(userRepresentation)
        // Do we need to do another request???
        return requestingUser()
    }

    private fun getAccessToken(): AccessToken {
        @Suppress("UNCHECKED_CAST")
        val principal = SecurityContextHolder
                .getContext()
                .authentication
                .principal as KeycloakPrincipal<KeycloakSecurityContext>
        return principal.keycloakSecurityContext.token
    }

    /**
     * Returns the current requesting user as a [UserRepresentation] from keycloak.
     */
    private fun getUserRepresentation(): UserRepresentation {
        return usersResource.get(simpleUser().userId).toRepresentation()
    }
}
