package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.Base64
import java.util.UUID

@Service
class EntryServiceImpl(
    private val entryRepository: EntryRepository,
    private val authService: AuthService
) : EntryService {

    override fun getEntry(entryId: UUID): EntryEntity {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry: EntryEntity = entryRepository.findOne(entryId)
            ?: throw NotFoundException("Unable to find entry with id $entryId")

        if (entry.owner != authService.getUserId()) {
            // TODO: Should we 403 or 404?
            logger.info(
                "User attempted to access Entry(id={}) which belongs to another user",
                entryId
            )
            throw ForbiddenException()
        }
        return entry
    }

    override fun getEntries(): List<EntryEntity> {
        logger.info("Getting entries")
        return entryRepository.findByOwner(authService.getUserId()).toList()
    }

    override fun create(title: String): EntryEntity {
        logger.info("Creating entry")
        return entryRepository.save(
            EntryEntity(
                content = Base64.getDecoder().decode(title),
                owner = authService.getUserId(),
                ownerType = OwnerType.USER
            )
        )
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
