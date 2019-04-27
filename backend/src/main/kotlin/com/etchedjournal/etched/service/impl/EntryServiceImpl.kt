package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EntryServiceImpl(
    private val entryRepo: EntryRepository,
    private val authService: AuthService,
    private val journalService: JournalService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeyPairService
) : EntryService {

    override fun getEntry(txn: Transaction, entryId: String): Entry {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry: Entry = entryRepo.findById(txn, entryId)
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

    override fun getEntries(txn: Transaction, journalId: String): List<Entry> {
        logger.info("Getting entries for journal {}", journalId)
        checkJournalExists(txn, journalId)
        return entryRepo.fetchByJournal(txn, journalId)
    }

    override fun create(txn: Transaction, req: EncryptedEntityRequest, journalId: String): Entry {
        logger.info("Creating entry for journal {}", journalId)
        checkJournalExists(txn, journalId)

        var entry = Entry(
            idGenerator.generateId(),
            Instant.now(),
            null,
            req.content,
            authService.getUserId(),
            OwnerType.USER,
            journalId,
            keyPairService.getKeyPair(txn, req.keyPairId).id,
            0,
            req.schema
        )
        entry = entryRepo.create(txn, entry)
        logger.info("Created {}", entry)
        return entry
    }

    private fun checkJournalExists(txn: Transaction, journalId: String) {
        // Will throw appropriate exceptions if it does not exist
        journalService.exists(txn, journalId)
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
