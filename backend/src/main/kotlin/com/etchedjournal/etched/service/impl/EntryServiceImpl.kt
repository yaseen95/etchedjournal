package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class EntryServiceImpl(
    private val entryRepository: EntryRepository,
    private val authService: AuthService,
    private val journalService: JournalService
) : EntryService {

    override fun getEntry(entryId: UUID): EntryEntity {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry: EntryEntity = entryRepository.findOne(entryId)
            ?: throw NotFoundException("Unable to find entry with id $entryId")

        // TODO: Create util to check entity access
        if (entry.owner != authService.getUserId()) {
            // TODO: Should we 403 or 404?
            logger.warn(
                "User attempted to access Entry(id={}) which belongs to another user",
                entryId
            )
            throw ForbiddenException()
        }
        return entry
    }

    override fun getEntries(journalId: UUID): List<EntryEntity> {
        logger.info("Getting entries for journal {}", journalId)
        checkJournalExists(journalId)
        return entryRepository.findByJournal_Id(journalId)
    }

    override fun create(journalId: UUID, content: ByteArray): EntryEntity {
        logger.info("Creating entry for journal {}", journalId)
        checkJournalExists(journalId)
        return entryRepository.save(
            EntryEntity(
                content = content,
                owner = authService.getUserId(),
                ownerType = OwnerType.USER,
                journal = journalService.getJournal(journalId)
            )
        )
    }

    private fun checkJournalExists(journalId: UUID) {
        if (!journalService.exists(journalId)) {
            // TODO: What if it the journal exists but it's owned by another user?
            throw NotFoundException(message = "Journal does not exist")
        }
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
