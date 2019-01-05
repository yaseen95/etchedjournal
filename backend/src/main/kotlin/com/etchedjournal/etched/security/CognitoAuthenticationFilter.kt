package com.etchedjournal.etched.security

import com.etchedjournal.etched.security.jwt.TokenProcessor
import org.springframework.http.HttpHeaders
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

open class CognitoAuthenticationFilter(
    private val tokenProcessor: TokenProcessor,
    private val mapper: CognitoAuthenticationMapper
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token: String? = request.getHeader(HttpHeaders.AUTHORIZATION)
        if (token != null) {
            // TODO: Should we assert that the header uses the Bearer prefix?
            // Or can we just ignore the first 7 chars
            val decoded = tokenProcessor.process(token.substring(AUTH_PREFIX.length))
            val auth = mapper.mapToAuthentication(decoded)
            SecurityContextHolder.getContext().authentication = auth
        }

        filterChain.doFilter(request, response)
    }

    companion object {
        private val AUTH_PREFIX = "Bearer "
    }
}
