package com.etchedjournal.etched.controller

import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.service.EtchService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries/entry/{entryId}/etches")
@RestController
class EtchServiceController(private val etchService: EtchService) {

    @GetMapping("")
    fun getEtches(@PathVariable entryId: Long): List<Etch> {
        return etchService.getEtches(entryId)
    }

    @GetMapping("/etch/{etchId}")
    fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        return etchService.getEtch(entryId, etchId)
    }

    @PostMapping("/etch")
    fun create(@PathVariable entryId: Long, @RequestBody etch: Etch): Etch {
        return etchService.create(entryId, etch)
    }
}
