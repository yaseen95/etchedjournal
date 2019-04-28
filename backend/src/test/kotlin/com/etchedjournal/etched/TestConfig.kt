package com.etchedjournal.etched

import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.KeyPairRepository
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.security.CognitoAuthenticationFilter
import com.etchedjournal.etched.service.AuthService
import com.nhaarman.mockitokotlin2.mock
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@TestConfiguration
class TestConfig {

    @Bean
    @Primary
    fun authService(): AuthService {
        return TestAuthService()
    }

    @Bean
    fun testAuthService(): TestAuthService {
        return authService() as TestAuthService
    }

    @Bean
    fun testRepoUtils(
        txnHelper: TxnHelper,
        entryRepository: EntryRepository,
        etchRepo: EtchRepository,
        keyPairRepo: KeyPairRepository,
        journalRepo: JournalRepository
    ): TestRepoUtils {
        return TestRepoUtils(
            entryRepo = entryRepository,
            etchRepo = etchRepo,
            keyPairRepo = keyPairRepo,
            journalRepo = journalRepo,
            txnHelper = txnHelper
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
