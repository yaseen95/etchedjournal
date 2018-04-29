package com.etchedjournal.etched.controller

import com.etchedjournal.etched.service.exception.ClientException
import com.etchedjournal.etched.service.exception.EtchedException
import com.etchedjournal.etched.service.exception.ServerException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import javax.servlet.http.HttpServletRequest

@ControllerAdvice
class ExceptionAdvice {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(ExceptionAdvice::class.java)

        fun createResponse(e: EtchedException): ResponseEntity<ExceptionResponse> {
            return ResponseEntity(ExceptionResponse(e.message), e.status)
        }

        fun formatMessage(
                request: HttpServletRequest,
                e: Exception,
                message: String? = null
        ): String {
            val builder = StringBuilder()

            val username = request.remoteUser
            if (username != null) {
                builder.append("USER '$username' - ")
            } else {
                builder.append("ANONYMOUS - ")
            }

            builder.append("Caught ${e.javaClass.simpleName} during request to ${request.pathInfo}")

            if (message != null) {
                builder.append(": $message")
            }
            return builder.toString()
        }
    }

    @ResponseBody
    @ExceptionHandler(ClientException::class)
    fun handleClientException(
            request: HttpServletRequest,
            ce: ClientException
    ): ResponseEntity<ExceptionResponse> {
        logger.info(formatMessage(request, ce))
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
}

class ExceptionResponse(val message: String)
