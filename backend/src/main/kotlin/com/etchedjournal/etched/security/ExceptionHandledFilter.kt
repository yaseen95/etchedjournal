package com.etchedjournal.etched.security

import com.auth0.jwt.exceptions.JWTDecodeException
import com.etchedjournal.etched.service.exception.ClientException
import com.etchedjournal.etched.service.exception.EtchedException
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Handles exceptions thrown during filter chain and returns json error messages
 *
 * https://stackoverflow.com/a/34633687
 */
class ExceptionHandledFilter(private val mapper: ObjectMapper) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            filterChain.doFilter(request, response)
        } catch (e: ClientException) {
            log.info("Client exception: {} - {} - {}", e.javaClass.simpleName, e.message, e.logMessage)
            sendError(status = e.status.value(), message = e.message, response = response)
        } catch(e: JWTDecodeException) {
            log.info("jwt decode exception: {}", e.message)
            sendError(status = HttpStatus.BAD_REQUEST.value(), message = e.message!!, response = response)
        } catch (e: EtchedException) {
            log.error("Etched exception: {}", e)
            sendError(status = e.status.value(), message = e.message, response = response)
        } catch (e: RuntimeException) {
            log.error("", e)
            sendError(
                status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                message = e.message ?: "Unexpected server error",
                response = response
            )
        }
    }

    private fun sendError(status: Int, message: String, response: HttpServletResponse) {
        val body = mapOf("message" to message)
        val msgBody = mapper.writeValueAsString(body)
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.status = status
        response.writer.write(msgBody)
        response.writer.flush()
    }

    companion object {
        // Have to use different naming convention because `GenericFilterBean` (which is extended
        // by OncePerRequestFilter) contains an apache commons logger which we don't want to use
        private val log: Logger = LoggerFactory.getLogger(ExceptionHandledFilter::class.java)
    }
}
