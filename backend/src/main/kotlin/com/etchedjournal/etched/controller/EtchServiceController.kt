package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.service.EtchService
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import javax.validation.Valid

@RequestMapping("/api/v1/etches")
@RestController
class EtchServiceController(private val etchService: EtchService) {

    @GetMapping("")
    fun getEtches(@RequestParam entryId: UUID): List<EtchEntity> {
        return etchService.getEtches(entryId)
    }

    @GetMapping("/{etchId}")
    fun getEtch(@PathVariable etchId: UUID): EtchEntity {
        return etchService.getEtch(etchId)
    }

    @PostMapping("")
    fun create(
        @RequestParam entryId: UUID,
        @RequestBody etches: List<@Valid EncryptedEntityRequest>
    ): List<EtchEntity> {
        logger.info("Creating etches for entryId {}", entryId)
        val createdEtches = etchService.create(entryId, etches)
        logger.info("Created {} etches for entryId {}", createdEtches.size, entryId)
        return createdEtches
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EtchServiceController::class.java)
    }
}
