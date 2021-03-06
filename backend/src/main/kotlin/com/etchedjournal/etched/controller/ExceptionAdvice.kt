package com.etchedjournal.etched.controller

import com.etchedjournal.etched.service.exception.ClientException
import com.etchedjournal.etched.service.exception.EtchedException
import com.etchedjournal.etched.service.exception.ServerException
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import com.fasterxml.jackson.databind.exc.MismatchedInputException
import com.fasterxml.jackson.module.kotlin.MissingKotlinParameterException
import org.hibernate.validator.internal.engine.path.PathImpl
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import javax.servlet.http.HttpServletRequest
import javax.validation.ConstraintViolationException

@ControllerAdvice
class ExceptionAdvice {

    @ResponseBody
    @ExceptionHandler(ClientException::class)
    fun handleClientException(
        request: HttpServletRequest,
        ce: ClientException
    ): ResponseEntity<ExceptionResponse> {
        logger.info(formatMessage(request, ce, ce.logMessage))
        return createResponse(ce)
    }

    @ResponseBody
    @ExceptionHandler(ServerException::class)
    fun handleServerException(
        request: HttpServletRequest,
        se: ServerException
    ): ResponseEntity<ExceptionResponse> {
        logger.error(formatMessage(request, se, se.logMessage), se)
        return createResponse(se)
    }

    @ResponseBody
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValid(
        manve: MethodArgumentNotValidException
    ): ResponseEntity<ExceptionResponse> {
        val fieldError = manve.bindingResult.fieldErrors.firstOrNull()
            ?: throw RuntimeException("Unable to find suitable message for a MethodArgumentNotValidException")
        val message = createReadableMethodInvalidMessage(fieldError)
        return badRequest(message)
    }

    @ResponseBody
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadable(
        htmnre: HttpMessageNotReadableException
    ): ResponseEntity<ExceptionResponse> {

        // These errors are thrown by Spring due to invalid payloads
        val cause = htmnre.cause
        val message = when (cause) {
            is MissingKotlinParameterException -> "Cannot supply null for key '${cause.parameter.name}'"
            is InvalidFormatException -> {
                // Occurs when types don't match e.g. passing a string for a long
                val fieldName = cause.path.firstOrNull()?.fieldName
                    ?: throw RuntimeException("Expected at least one path in InvalidFormatException")
                "'${cause.value}' is not a valid value for key '$fieldName'"
            }
            is MismatchedInputException -> "Invalid data format"
            else -> {
                logger.warn("Unexpected cause of {}", htmnre)
                "Bad request"
            }
        }

        logger.info("Received invalid payload: {}", message)
        return badRequest(message)
    }

    @ResponseBody
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolationException(
        cve: ConstraintViolationException
    ): ResponseEntity<ExceptionResponse> {
        val violations = cve.constraintViolations.toList()
        if (violations.isEmpty()) {
            throw RuntimeException("Expected to see 1 violation", cve)
        }

        val violation = violations[0]
        val errorMsg: String
        errorMsg = if (violation.invalidValue == null) {
            "Cannot supply null for key '${violation.propertyPath}'"
        } else {
            val fieldName = (violation.propertyPath as PathImpl).leafNode.name
            "Invalid value '${violation.invalidValue}' for $fieldName"
        }
        logger.info(errorMsg)
        return badRequest(errorMsg)
    }

    @ResponseBody
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleMethodArgumentTypeMismatchException(
        e: MethodArgumentTypeMismatchException
    ): ResponseEntity<ExceptionResponse> {
        return badRequest("Invalid parameter type")
    }

    @ResponseBody
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleMissingServletRequestParameterException(
        e: MissingServletRequestParameterException
    ): ResponseEntity<ExceptionResponse> {
        return badRequest("Missing required parameter '${e.parameterName}'")
    }

    // TODO: Handle HttpMessageNotReadableException

    companion object {
        val logger: Logger = LoggerFactory.getLogger(ExceptionAdvice::class.java)

        fun createResponse(e: EtchedException): ResponseEntity<ExceptionResponse> {
            return ResponseEntity(ExceptionResponse(e.message), e.status)
        }

        fun formatMessage(
            request: HttpServletRequest,
            e: EtchedException,
            message: String? = null
        ): String {

            val builder = StringBuilder()
            val path = request.servletPath
            builder.append("Caught ${e.javaClass.simpleName} during request to '$path'")

            val errorMessage: String = message ?: e.message
            builder.append(": $errorMessage")
            return builder.toString()
        }

        fun createReadableMethodInvalidMessage(fieldError: FieldError): String {
            return "Field '${fieldError.field}' ${fieldError.defaultMessage}"
        }

        // TODO: Do we need @JvmStatic annotations
        fun badRequest(message: String): ResponseEntity<ExceptionResponse> {
            return ResponseEntity(ExceptionResponse(message), HttpStatus.BAD_REQUEST)
        }
    }

    class ExceptionResponse(val message: String)
}
