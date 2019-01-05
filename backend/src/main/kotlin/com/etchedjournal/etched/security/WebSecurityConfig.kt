package com.etchedjournal.etched.security

import org.springframework.boot.autoconfigure.security.Http401AuthenticationEntryPoint
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class WebSecurityConfig(
    private val cognitoAuthFilter: CognitoAuthenticationFilter,
    private val exceptionHandledFilter: ExceptionHandledFilter
) : WebSecurityConfigurerAdapter() {

    // TODO: Enable this only for local testing!
    // This was enabled just to allow react to communicate with the backend locally
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        // https://github.com/spring-projects/spring-boot/issues/5834#issuecomment-296370088
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf("http://localhost:4200")
        configuration.allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH")
        configuration.allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
            .cors()
            .and()
            .authorizeRequests()
                .antMatchers("/api/v1/**").hasRole("USER")
            .and()
            .csrf()
                // disabling csrf so that we can access the h2-console webpage
                .ignoringAntMatchers("/h2-console/**")
                .ignoringAntMatchers("/api/**")
                .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .headers()
                .frameOptions().sameOrigin()
            .and()
                // When they're anonymous, return a 401
                // https://stackoverflow.com/questions/33801468/how-let-spring-security-response-unauthorizedhttp-401-code-if-requesting-uri-w
                .anonymous()
                .disable()
                .exceptionHandling()
                // Using "Bearer" as the value for the WWW-Authenticate header
                // https://tools.ietf.org/html/rfc6750#section-3
                .authenticationEntryPoint(Http401AuthenticationEntryPoint("Bearer"))
            .and()
                .addFilterBefore(cognitoAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
                .addFilterBefore(exceptionHandledFilter, CognitoAuthenticationFilter::class.java)
    }

    @Throws(Exception::class)
    override fun configure(web: WebSecurity) {
        web
            .ignoring()
                .antMatchers("/api/v1/status")
                .antMatchers("/h2-console/**")
    }
}
