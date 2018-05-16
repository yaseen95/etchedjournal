package com.etchedjournal.etched.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class StatusController {

    @GetMapping("/api/v1/status")
    fun getStatus(): Map<String, Any> {
        return mapOf("status" to "up")
    }
}
