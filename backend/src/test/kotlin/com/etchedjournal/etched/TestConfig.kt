package com.etchedjournal.etched

import com.etchedjournal.etched.models.jooq.generated.tables.daos.EtchDao
import com.etchedjournal.etched.models.jooq.generated.tables.daos.KeyPairDao
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.security.CognitoAuthenticationFilter
import com.etchedjournal.etched.service.AuthService
import com.nhaarman.mockitokotlin2.mock
import org.slf4j.LoggerFactory
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@TestConfiguration
class TestConfig {

    companion object {
        private val logger = LoggerFactory.getLogger(TestConfig::class.java)
    }

    @Bean
    @Primary
    fun authService(): AuthService {
        return TestAuthService()
    }

    @Bean
    fun testRepoUtils(
        entryRepository: EntryRepository,
        etchDao: EtchDao,
        keyPairDao: KeyPairDao,
        journalRepo: JournalRepository
    ): TestRepoUtils {
        return TestRepoUtils(
            entryRepo = entryRepository,
            etchRepo = etchDao,
            keyPairRepo = keyPairDao,
            journalRepo = journalRepo
        )
    }

    @Bean
    fun cognitoFilter(): CognitoAuthenticationFilter {
        return NullCognitoAuthFilter()
    }
}

private class NullCognitoAuthFilter : CognitoAuthenticationFilter(mock(), mock()) {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        filterChain.doFilter(request, response)
    }
}
