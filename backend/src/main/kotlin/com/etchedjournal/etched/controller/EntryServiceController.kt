package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EntryRequest
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.service.EntryService
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import javax.validation.Valid

@RequestMapping("/api/v1/entries")
@RestController
class EntryServiceController(private val entryService: EntryService) {

    /**
     * Returns an Entry with the specified ID.
     */
    @GetMapping("/{entryId}")
    fun getEntry(@PathVariable entryId: UUID): EntryEntity {
        return entryService.getEntry(entryId)
    }

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getEntries(): List<EntryEntity> {
        return entryService.getEntries()
    }

    /**
     * Creates a new entry
     */
    @PostMapping("")
    fun create(@RequestBody @Valid entry: EntryRequest): EntryEntity {
        return entryService.create(entry.content)
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EntryServiceController::class.java)
    }
}
