package com.etchedjournal.etched

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class EtchedApplication

fun main(args: Array<String>) {
    SpringApplication.run(EtchedApplication::class.java, *args)
}
