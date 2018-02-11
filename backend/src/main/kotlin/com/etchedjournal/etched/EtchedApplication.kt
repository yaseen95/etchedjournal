package com.etchedjournal.etched

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchedUserRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

@SpringBootApplication
open class EtchedApplication {
    companion object {
        val log: Logger = LoggerFactory.getLogger(EtchedApplication::class.java)
    }

    @Bean
    open fun commandLineRunner(entryRepository: EntryRepository, etchedUserRepository:
    EtchedUserRepository, bCryptPasswordEncoder: BCryptPasswordEncoder): CommandLineRunner {
        return CommandLineRunner {
            val hashed = bCryptPasswordEncoder.encode("password")
            var user = EtchedUser(null, "testuser", hashed, "test@example.com")
            user = etchedUserRepository.save(user)
            entryRepository.save(Entry("Journal title", user))
        }
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(EtchedApplication::class.java, *args)
}
