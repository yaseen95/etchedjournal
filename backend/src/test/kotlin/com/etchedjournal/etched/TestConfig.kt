package com.etchedjournal.etched

import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.KeypairRepository
import com.etchedjournal.etched.service.AuthService
import org.slf4j.LoggerFactory
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary

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
        journalRepository: JournalRepository,
        entryRepository: EntryRepository,
        etchRepository: EtchRepository,
        keyPairRepository: KeypairRepository
    ): TestRepoUtils {
        return TestRepoUtils(
            journalRepo = journalRepository,
            entryRepo = entryRepository,
            etchRepo = etchRepository,
            keyPairRepo = keyPairRepository
        )
    }
}
