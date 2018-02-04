package com.etchedjournal.etched.controller

import com.etchedjournal.etched.api.EntryService
import com.etchedjournal.etched.dto.EntryRequest
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries")
@RestController
class EntryServiceController : EntryService {

    @Autowired
    lateinit var entryRepository: EntryRepository

    /**
     * Returns an Entry with the specified ID.
     */
    @RequestMapping("/entry/{entryId}", method = [RequestMethod.GET])
    override fun getEntry(@PathVariable entryId: Long): Entry {
        // TODO: Throw 404 if not found
        return entryRepository.findOne(entryId)
    }

    /**
     * Returns all entries.
     */
    @RequestMapping("", method = [RequestMethod.GET])
    override fun getEntries(): List<Entry> {
        return entryRepository.findAll().toList()
    }

    /**
     * Creates a new entry
     */
    @RequestMapping("/entry", method = [RequestMethod.POST])
    override fun create(@RequestBody entry: EntryRequest): Entry {
        if (entry.title == null) {
            throw Exception("Title can't be null")
        }

        return entryRepository.save(Entry(entry.title))
    }
}
