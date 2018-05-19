package com.etchedjournal.etched.service.exception

import org.springframework.http.HttpStatus

/**
 * Base exception thrown by Etched application
 *
 * @param status Http status to return to user
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
open class EtchedException(
        val status: HttpStatus,
        override val message: String,
        val logMessage: String? = null
) : RuntimeException() {

    override fun toString(): String {
        return "EtchedException(status=$status, logMessage='$logMessage')"
    }
}

/**
 * Exception caused due to a client error
 *
 * This class should only be used in catch statements. It is preferable to throw more specific
 * exceptions e.g. [ForbiddenException], [NotFoundException].
 *
 * @param status Http status to return to user. Must be a 400 level status.
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 * @throws IllegalArgumentException if status is not a 400 status
 */
open class ClientException(
        status: HttpStatus = HttpStatus.BAD_REQUEST,
        message: String,
        logMessage: String? = null
) : EtchedException(status, message, logMessage) {
    init {
        if (!status.is4xxClientError) {
            throw IllegalArgumentException("Supplied non-400 status $status")
        }
    }
}

/**
 * Exception thrown when user request is bad e.g. invalid payload.
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
open class BadRequestException(
        status: HttpStatus = HttpStatus.BAD_REQUEST,
        message: String = "Bad request",
        logMessage: String? = null
) : ClientException(status, message, logMessage) {
    init {
        if (!status.is4xxClientError) {
            throw IllegalArgumentException("Supplied non-400 status $status")
        }
    }
}

/**
 * Exception thrown due to an invalid payload
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
open class InvalidPayloadException(
        message: String,
        logMessage: String? = null
) : BadRequestException(message = message, logMessage = logMessage)

/**
 * User is unauthorized to perform the requested action
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
open class UnauthorizedException(
    message: String,
    logMessage: String? = null
) : BadRequestException(HttpStatus.UNAUTHORIZED, message, logMessage)

/**
 * Exception thrown when user is forbidden to access requested data
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
class ForbiddenException(
        message: String = "Forbidden",
        logMessage: String? = null
) : ClientException(HttpStatus.FORBIDDEN, message, logMessage)

/**
 * Exception thrown when user requests something that could not be found
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 */
class NotFoundException(
        message: String = "Not found",
        logMessage: String? = null
) : ClientException(HttpStatus.NOT_FOUND, message, logMessage)

/**
 * Exception thrown due to an issue with the server
 *
 * @param message message to return to the user
 * @param logMessage optional - specify log message
 * @throws IllegalArgumentException if status is not a 500 status
 */
open class ServerException(
        status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        message: String = "Unexpected server error",
        logMessage: String? = null
) : EtchedException(status, message, logMessage) {

    init {
        if (!status.is5xxServerError) {
            throw IllegalArgumentException("Supplied non-500 status $status")
        }
    }
}

/**
 * Exception thrown when backend receives unexpected response from auth server
 *
 * @param logMessage optional - specify log message
 */
class AuthServerException(
    logMessage: String? = null
): ServerException(HttpStatus.SERVICE_UNAVAILABLE, logMessage = logMessage)
