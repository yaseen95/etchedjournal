package com.etchedjournal.etched.security

import org.keycloak.adapters.KeycloakConfigResolver
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver
import org.keycloak.adapters.springsecurity.KeycloakSecurityComponents
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@ComponentScan(basePackageClasses = [(KeycloakSecurityComponents::class)])
class WebSecurityConfig : KeycloakWebSecurityConfigurerAdapter() {

    override fun sessionAuthenticationStrategy(): SessionAuthenticationStrategy {
        // KeycloakWebSecurityConfigurerAdapter requires an implementation. We don't use sessions,
        // so using the NullAuthenticatedSessionStrategy (which doesn't do anything) is fine.
        return NullAuthenticatedSessionStrategy()
    }


    @Autowired
    fun configureGlobal(auth: AuthenticationManagerBuilder) {
        val provider = keycloakAuthenticationProvider()
        provider.setGrantedAuthoritiesMapper(SimpleAuthorityMapper())
        auth.authenticationProvider(provider)
    }

    @Bean
    fun keycloakConfigResolver(): KeycloakConfigResolver {
        return KeycloakSpringBootConfigResolver()
    }

    // TODO: Enable this only for local testing!
    // This was enabled just to allow react to communicate with the backend locally
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        // https://github.com/spring-projects/spring-boot/issues/5834#issuecomment-296370088
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf("*")
        configuration.allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH")
        configuration.allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        // DON'T forget super call!
        super.configure(http)
        http
                .authorizeRequests()
                    .antMatchers("/api/v1/auth/authenticate").permitAll()
                    .antMatchers("/api/v1/auth/register").permitAll()
                    .antMatchers("/api/v1/**").hasRole("user")
                    .antMatchers("/h2-console/**").hasRole("admin")
                    .antMatchers("/").permitAll()
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
    }
}

@Configuration
class WebConfig : WebMvcConfigurerAdapter() {
    // TODO: Enable this only for local testing!
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
                .allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATCH")
    }
}
