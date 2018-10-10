package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Etch
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import java.time.Instant

@Service
class EtchServiceImpl(
        private val etchRepository: EtchRepository,
        private val entryService: EntryService
) : EtchService {

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EtchServiceImpl::class.java)
    }

    override fun getEtches(@PathVariable entryId: Long): List<Etch> {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting etches for Entry(id={})", entryId)
        return etchRepository.findByEntryId(entryId)
    }

    override fun getEtch(@PathVariable entryId: Long, @PathVariable etchId: Long): Etch {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting Etch(id={})", etchId)
        return etchRepository
            .findByEntryId(entryId)
            .firstOrNull { etch -> etch.id == etchId }
            ?: throw NotFoundException("No etch with id $etchId exists.")
    }

    override fun create(@PathVariable entryId: Long, @RequestBody etches: List<Etch>): List<Etch> {
        logger.info("Creating {} etches", etches.size)
        val entry = entryService.getEntry(entryId)

        val timestamp = Instant.now()
        etches.forEach {
            it.entry = entry
            it.timestamp = timestamp
        }
        return etchRepository.save(etches).toList()
    }
}
