package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.service.EtchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import java.time.Instant

@Service
class EtchServiceImpl : EtchService {

    @Autowired
    private lateinit var etchRepository: EtchRepository

    @Autowired
    private lateinit var entryRepository: EntryRepository

    override fun getEtches(@PathVariable entryId: Long): List<Etch> {
        return getEntry(entryId).etches
    }

    override fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        val entry = getEntry(entryId)
        return entry.etches.firstOrNull { etch -> etch.id == etchId }
                ?: throw Exception("No etch with id $etchId exists.")
    }

    override fun create(@PathVariable entryId: Long, @RequestBody etch: Etch): Etch {
        val entry = getEntry(entryId)
        etch.entry = entry
        etch.timestamp = Instant.now()
        return etchRepository.save(etch)
    }

    private fun getEntry(entryId: Long): Entry {
        // TODO: Use AspectJ to avoid these repeated checks.
        return entryRepository.findOne(entryId)
                ?: throw Exception("No entry with id $entryId exists.")
    }
}
