package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EntryRequest
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.exception.BadRequestException
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries")
@RestController
class EntryServiceController(private val entryService: EntryService) {

    companion object {
        private val logger = LoggerFactory.getLogger(EntryServiceController::class.java)
    }

    /**
     * Returns an Entry with the specified ID.
     */
    @GetMapping("/{entryId}")
    fun getEntry(@PathVariable entryId: Long): Entry {
        return entryService.getEntry(entryId)
    }

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getEntries(): List<Entry> {
        return entryService.getEntries()
    }

    /**
     * Creates a new entry
     */
    @PostMapping("")
    fun create(@RequestBody entry: EntryRequest): Entry {
        if (entry.title == null) {
            throw BadRequestException(message = "Title can't be null")
        }

        return entryService.create(entry.title)
    }
}
