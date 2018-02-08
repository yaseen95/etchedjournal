package com.etchedjournal.etched.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
open class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var securityUserService: SecurityUserService

    // TODO: Enable this only for local testing!
    // This was enabled just to allow react to communicate with the backend locally
    @Bean
    open fun corsConfigurationSource(): CorsConfigurationSource {
        // https://github.com/spring-projects/spring-boot/issues/5834#issuecomment-296370088
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf("*")
        configuration.allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH")
        configuration.allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }


    @Autowired
    @Throws(Exception::class)
    fun configureAuthentication(builder: AuthenticationManagerBuilder) {
        builder
                .userDetailsService<UserDetailsService>(securityUserService)
                .passwordEncoder(bCryptPasswordEncoder())
    }

    @Bean
    fun bCryptPasswordEncoder(): BCryptPasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    @Throws(Exception::class)
    public override fun authenticationManager(): AuthenticationManager {
        return super.authenticationManager()
    }

    @Bean
    @Throws(Exception::class)
    fun jwtTokenFilter(): JwtTokenFilter {
        val jwtTokenFilter = JwtTokenFilter()
        jwtTokenFilter.setAuthenticationManager(authenticationManager())
        return jwtTokenFilter
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {

        http
                .authorizeRequests()
                    .antMatchers("/", "/**").permitAll()
                    .and()
                .csrf()
                // disabling csrf so that we can access the h2-console webpage
                    .ignoringAntMatchers("/h2-console/**")
                    .ignoringAntMatchers("/api/**")
                    .and()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    .and()
                // Filters for jwts and assigning relevant user to request for later use
                .addFilterBefore(jwtTokenFilter(), JwtTokenFilter::class.java)
                .headers()
                    .frameOptions().sameOrigin()
    }
}

@Configuration
open class WebConfig : WebMvcConfigurerAdapter() {
    // TODO: Enable this only for local testing!
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
                .allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATCH")
    }
}
