package com.etchedjournal.etched.security

import com.etchedjournal.etched.EtchedApplication
import io.jsonwebtoken.JwtException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import java.io.IOException
import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest

/**
 * Checks valid jwts and if valid, assigns associated user to request for later use by controllers.
 */
class JwtTokenFilter : UsernamePasswordAuthenticationFilter() {

    @Autowired
    private lateinit var jwtTokenUtils: JwtTokenUtils

    @Autowired
    private lateinit var subjectHubUserService: SecurityUserService

    companion object {
        const val AUTHORIZATION_HEADER = "Authorization"
    }

    @Throws(IOException::class, ServletException::class)
    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {

        val httpRequest = request as HttpServletRequest
        val authToken = httpRequest.getHeader(AUTHORIZATION_HEADER)

        // TODO: Filter on requests only.
        if (authToken != null) {
            var username: String? = null
            try {
                username = jwtTokenUtils.getUsernameFromToken(authToken)
            } catch (e: JwtException) {
                EtchedApplication.log.error(e.message, e)
            } catch (e: IllegalArgumentException) {
                EtchedApplication.log.error(e.message, e)
            }

            if (username != null && SecurityContextHolder.getContext().authentication == null) {
                val userDetails = subjectHubUserService.loadUserByUsername(username)
                if (userDetails != null && jwtTokenUtils.validateToken(authToken, userDetails)) {
                    val authentication = UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.authorities)

                    authentication.details = WebAuthenticationDetailsSource()
                            .buildDetails(httpRequest)
                    SecurityContextHolder.getContext().authentication = authentication
                }
            }
        }
        chain.doFilter(request, response)
    }
}
