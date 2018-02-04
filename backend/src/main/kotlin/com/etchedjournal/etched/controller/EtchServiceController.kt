package com.etchedjournal.etched.controller

import com.etchedjournal.etched.EtchedApplication
import com.etchedjournal.etched.api.EtchService
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/entries/entry/{entryId}/etches")
@RestController
class EtchServiceController : EtchService {

    @Autowired
    private lateinit var etchRepository: EtchRepository

    @Autowired
    private lateinit var entryRepository: EntryRepository

    @RequestMapping("", method = [RequestMethod.GET])
    override fun getEtches(@PathVariable entryId: Long): List<Etch> {
        val e = getEntry(entryId)
        return e.etches
    }

    @RequestMapping("/etch/{etchId}", method=[RequestMethod.GET])
    override fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        val entry = getEntry(entryId)
        return entry.etches.firstOrNull { etch -> etch.id == etchId } ?:
                throw Exception("No etch with id $etchId exists.")
    }

    @RequestMapping("/etch", method=[RequestMethod.POST])
    override fun create(@PathVariable entryId: Long, @RequestBody etch: Etch): Etch {
        val entry = getEntry(entryId)
        etch.entry = entry
        return etchRepository.save(etch)
    }

    private fun getEntry(entryId: Long): Entry {
        // TODO: Use AspectJ to avoid these repeated checks.
        return entryRepository.findOne(entryId) ?:
                throw Exception("No entry with id $entryId exists.")
    }
}
