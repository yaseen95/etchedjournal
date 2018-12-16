package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class EtchServiceImpl(
    private val etchRepository: EtchRepository,
    private val entryService: EntryService,
    private val authService: AuthService
) : EtchService {

    override fun getEtches(entryId: UUID): List<EtchEntity> {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting etches for Entry(id={})", entryId)
        return etchRepository.findByEntryId(entryId)
    }

    override fun getEtch(etchId: UUID): EtchEntity {
        logger.info("Getting EtchEntity(id={})", etchId)
        return etchRepository.findOne(etchId)
            ?: throw NotFoundException("No EtchEntity with id $etchId exists.")
    }

    override fun create(entryId: UUID, etches: List<EncryptedEntityRequest>): List<EtchEntity> {
        logger.info("Creating {} etches for entry {}", etches.size, entryId)
        val entry = entryService.getEntry(entryId)

        val timestamp = Instant.now()
        val newEtches = etches.map {
            EtchEntity(
                // Give all the etches the same server side timestamp
                // The client side schema will be responsible for ordering the etches
                timestamp = timestamp,
                entry = entry,
                content = it.content,
                owner = authService.getUserId(),
                ownerType = OwnerType.USER
            )
        }
        return etchRepository.save(newEtches).toList()
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EtchServiceImpl::class.java)
    }
}
