package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.dto.UpdateEntryReq
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.clock.Clock
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EntryServiceImpl(
    private val entryRepo: EntryRepository,
    private val authService: AuthService,
    private val journalService: JournalService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeyPairService,
    private val clock: Clock
) : EntryService {

    override fun getEntry(txn: Transaction, entryId: String): EntryRecord {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry = entryRepo.findById(txn, entryId)
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

    override fun getEntries(txn: Transaction, journalId: String): List<EntryRecord> {
        logger.info("Getting entries for journal {}", journalId)
        checkJournalExists(txn, journalId)
        return entryRepo.fetchByJournal(txn, journalId)
    }

    override fun create(txn: Transaction, req: EncryptedEntityRequest, journalId: String): EntryRecord {
        logger.info("Creating entry for journal {}", journalId)
        checkJournalExists(txn, journalId)
        checkKeyPairExists(txn, req.keyPairId)

        val entry = Entry(
            idGenerator.generateId(),
            clock.now(),
            null,
            req.content,
            authService.getUserId(),
            OwnerType.USER,
            journalId,
            keyPairService.getKeyPair(txn, req.keyPairId).id,
            0,
            req.schema
        )
        val created = entryRepo.create(txn, entry)
        logger.info("Created {}", created.id)
        return created
    }

    private fun checkJournalExists(txn: Transaction, journalId: String) {
        // Will throw appropriate exceptions if it does not exist
        journalService.exists(txn, journalId)
    }

    private fun checkKeyPairExists(txn: Transaction, keyPairId: String) {
        // Will throw appropriate exceptions if it does not exist
        keyPairService.getKeyPair(txn, keyPairId)
    }

    override fun update(txn: Transaction, req: UpdateEntryReq): EntryRecord {
        logger.info("Updating entry {}", req.entryId)
        checkKeyPairExists(txn, req.keyPairId)

        val entry = getEntry(txn, req.entryId)
        entry.setContent(*req.content)
        entry.modified = clock.now()
        entry.schema = req.schema
        entry.keyPairId = req.keyPairId
        return entryRepo.update(txn, entry)
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
