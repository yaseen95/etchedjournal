package com.etchedjournal.etched.controller

import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.exception.InvalidPayloadException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RequestMapping("/api/v1/entries/{entryId}/etches")
@RestController
class EtchServiceController(private val etchService: EtchService) {

    @GetMapping("")
    fun getEtches(@PathVariable entryId: Long): List<Etch> {
        return etchService.getEtches(entryId)
    }

    @GetMapping("/{etchId}")
    fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        return etchService.getEtch(entryId, etchId)
    }

    @PostMapping("")
    fun create(@PathVariable entryId: Long, @RequestBody etch: List<@Valid Etch>): List<Etch> {
        if (etch.any { it.id != null }) {
            throw InvalidPayloadException("Must not supply id when creating an etch")
        }
        return etchService.create(entryId, etch)
    }
}
