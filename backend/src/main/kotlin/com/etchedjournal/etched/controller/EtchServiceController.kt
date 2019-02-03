package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.utils.id.IsEtchedId
import org.slf4j.LoggerFactory
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RequestMapping("/api/v1/etches")
@RestController
@Validated
class EtchServiceController(private val etchService: EtchService) {

    @GetMapping("")
    fun getEtches(@RequestParam @Valid @IsEtchedId entryId: String): List<Etch> {
        return etchService.getEtches(entryId)
    }

    @GetMapping("/{etchId}")
    fun getEtch(@PathVariable @Valid @IsEtchedId etchId: String): Etch {
        return etchService.getEtch(etchId)
    }

    @PostMapping("")
    fun create(
        @RequestParam @Valid @IsEtchedId entryId: String,
        @RequestBody etches: List<@Valid EncryptedEntityRequest>
    ): List<Etch> {
        logger.info("Creating etches for entry {}", entryId)
        val createdEtches = etchService.create(etches, entryId)
        logger.info("Created {} etches for entry {}", createdEtches.size, entryId)
        return createdEtches
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EtchServiceController::class.java)
    }
}
