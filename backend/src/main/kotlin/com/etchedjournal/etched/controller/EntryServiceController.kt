package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EntryRequest
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.service.EntryService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries")
@RestController
class EntryServiceController {

    @Autowired
    private lateinit var entryService: EntryService

    /**
     * Returns an Entry with the specified ID.
     */
    @RequestMapping("/entry/{entryId}", method = [RequestMethod.GET])
    fun getEntry(@PathVariable entryId: Long): Entry {
        return entryService.getEntry(entryId)
    }

    /**
     * Returns all entries.
     */
    @RequestMapping("", method = [RequestMethod.GET])
    fun getEntries(): List<Entry> {
        return entryService.getEntries()
    }

    /**
     * Creates a new entry
     */
    @RequestMapping("/entry", method = [RequestMethod.POST])
    fun create(@RequestBody entry: EntryRequest): Entry {
        if (entry.title == null) {
            throw Exception("Title can't be null")
        }

        return entryService.create(entry.title)
    }
}
