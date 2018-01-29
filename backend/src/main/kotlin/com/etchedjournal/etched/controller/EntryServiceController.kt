package com.etchedjournal.etched.controller

import com.etchedjournal.etched.api.EntryService
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import org.springframework.beans.factory.annotation.Autowired
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
    @RequestMapping("/content", method = [RequestMethod.GET])
    override fun getEntry(entryId: Long): Entry {
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
}
