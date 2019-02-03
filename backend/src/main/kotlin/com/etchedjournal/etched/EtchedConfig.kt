package com.etchedjournal.etched

import com.etchedjournal.etched.security.ExceptionHandledFilter
import com.etchedjournal.etched.utils.id.CamflakeIdGenerator
import com.etchedjournal.etched.utils.id.IdGenerator
import com.etchedjournal.etched.utils.id.camflake.Camflake
import com.fasterxml.jackson.databind.ObjectMapper
import org.jooq.impl.DataSourceConnectionProvider
import org.jooq.impl.DefaultConfiguration
import org.jooq.impl.DefaultDSLContext
import org.slf4j.MDC
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.security.Principal
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import javax.sql.DataSource

@Configuration
class EtchedConfig {

    @Bean
    fun idGenerator(camflake: Camflake): IdGenerator {
        return CamflakeIdGenerator(camflake)
    }

    @Bean
    fun camflake(): Camflake {
        return Camflake()
    }

    @Bean
    fun exceptionHandlerFilter(mapper: ObjectMapper): ExceptionHandledFilter {
        return ExceptionHandledFilter(mapper = mapper)
    }

    @Bean
    fun connectionProvider(dataSource: DataSource): DataSourceConnectionProvider {
        return DataSourceConnectionProvider(TransactionAwareDataSourceProxy(dataSource))
    }

    @Bean
    fun dsl(dataSource: DataSource): DefaultDSLContext {
        return DefaultDSLContext(configuration(dataSource))
    }

    @Bean
    fun configuration(dataSource: DataSource): DefaultConfiguration {
        val jooqConfiguration = DefaultConfiguration()
        jooqConfiguration.set(connectionProvider(dataSource))
        val settings = jooqConfiguration.settings().withExecuteWithOptimisticLocking(true)
        jooqConfiguration.setSettings(settings)
        return jooqConfiguration
    }
}

/**
 * Configures logging to include user id in log messages
 *
 * https://moelholm.com/2016/08/16/spring-boot-enhance-your-logging/
 */
@Component
class UserIdLoggerFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val principal: Principal? = SecurityContextHolder.getContext()
                ?.authentication
                ?.principal as Principal?
            val userId = principal?.name ?: "anonymous"
            MDC.put("userId", userId)
            filterChain.doFilter(request, response)
        } finally {
            MDC.clear()
        }
    }
}
