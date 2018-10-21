package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.entity.EtchEntity
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
import java.util.UUID

@Service
class EtchServiceImpl(
    private val etchRepository: EtchRepository,
    private val entryService: EntryService
) : EtchService {

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EtchServiceImpl::class.java)
    }

    override fun getEtches(entryId: UUID): List<EtchEntity> {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting etches for Entry(id={})", entryId)
        return etchRepository.findByEntryId(entryId)
    }

    override fun getEtch(@PathVariable entryId: UUID, @PathVariable etchId: UUID): EtchEntity {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting EtchEntity(id={})", etchId)
        return etchRepository
            .findByEntryId(entryId)
            .firstOrNull { EtchEntity -> EtchEntity.id == etchId }
            ?: throw NotFoundException("No EtchEntity with id $etchId exists.")
    }

    override fun create(@PathVariable entryId: UUID, @RequestBody etches: List<EtchEntity>): List<EtchEntity> {
        logger.info("Creating {} etches", etches.size)
        val entry = entryService.getEntry(entryId)

        val timestamp = Instant.now()
        val newEtches = etches.map {
            EtchEntity(
                timestamp = timestamp,
                entry = entry,
                id = it.id,
                content = it.content,
                owner = it.owner,
                ownerType = it.ownerType
            )
        }
        return etchRepository.save(newEtches).toList()
    }
}
