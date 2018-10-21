package com.etchedjournal.etched.controller

import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.exception.InvalidPayloadException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import javax.validation.Valid

@RequestMapping("/api/v1/entries/{entryId}/etches")
@RestController
class EtchServiceController(private val etchService: EtchService) {

    @GetMapping("")
    fun getEtches(@PathVariable entryId: UUID): List<EtchEntity> {
        return etchService.getEtches(entryId)
    }

    @GetMapping("/{etchId}")
    fun getEtch(@PathVariable entryId: UUID, @PathVariable etchId: UUID): EtchEntity {
        return etchService.getEtch(entryId, etchId)
    }

    @PostMapping("")
    fun create(
        @PathVariable entryId: UUID,
        @RequestBody etch: List<@Valid EtchEntity>
    ):
        List<EtchEntity> {
        if (etch.any { it.id != null }) {
            throw InvalidPayloadException("Must not supply id when creating an etch")
        }
        return etchService.create(entryId, etch)
    }
}
