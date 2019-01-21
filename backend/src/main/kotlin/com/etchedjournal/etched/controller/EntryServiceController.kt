package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.service.EntryService
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

@RequestMapping("/api/v1/entries")
@RestController
@Validated
class EntryServiceController(private val entryService: EntryService) {

    /**
     * Returns an Entry with the specified ID.
     */
    @GetMapping("/{entryId}")
    fun getEntry(@PathVariable @Valid @IsEtchedId entryId: String): EntryEntity {
        return entryService.getEntry(entryId)
    }

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getEntries(@RequestParam @Valid @IsEtchedId journalId: String): List<EntryEntity> {
        return entryService.getEntries(journalId)
    }

    /**
     * Creates a new entry
     */
    @PostMapping("")
    fun create(
        @RequestBody @Valid req: EncryptedEntityRequest,
        @RequestParam journalId: String
    ): EntryEntity {
        logger.info("Creating an entry for journal {}", journalId)
        val createdEntry = entryService.create(req, journalId)
        logger.info("Created entry {}", createdEntry)
        return createdEntry
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EntryServiceController::class.java)
    }
}
