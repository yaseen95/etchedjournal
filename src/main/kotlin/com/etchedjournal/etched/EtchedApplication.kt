package com.etchedjournal.etched

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import java.util.TimeZone

@SpringBootApplication
open class EtchedApplication {
    val log: Logger = LoggerFactory.getLogger(EtchedApplication::class.java)

    @Bean
    open fun commandLineRunner(entryRepository: EntryRepository): CommandLineRunner {
        return CommandLineRunner {
            entryRepository.save(Entry("Journal title", "encryption key", "initialization vector"))
        }
    }

    @Bean
    open fun objectMapper(): ObjectMapper {
        // LocalDateTime by default serializes to an array. We disable that and write as a string.
        val objectMapper = ObjectMapper()
        objectMapper.registerModule(JavaTimeModule())
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        return objectMapper
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(EtchedApplication::class.java, *args)
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
}
