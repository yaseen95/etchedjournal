package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.EtchService
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import java.time.Instant

@Service
class EtchServiceImpl(
        private val etchRepository: EtchRepository,
        private val entryService: EntryService
) : EtchService {

    override fun getEtches(@PathVariable entryId: Long): List<Etch> {
        return entryService.getEntry(entryId).etches
    }

    override fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        val entry = entryService.getEntry(entryId)
        return entry.etches.firstOrNull { etch -> etch.id == etchId }
                ?: throw Exception("No etch with id $etchId exists.")
    }

    override fun create(@PathVariable entryId: Long, @RequestBody etch: Etch): Etch {
        val entry = entryService.getEntry(entryId)
        etch.entry = entry
        etch.timestamp = Instant.now()
        return etchRepository.save(etch)
    }
}
