package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.dto.UpdateJournalReq
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.clock.Clock
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class JournalServiceImpl(
    private val journalRepo: JournalRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeyPairService,
    private val clock: Clock
) : JournalService {

    override fun getJournal(txn: Transaction, id: String): JournalRecord {
        logger.info("Attempting to get journal {}", id)
        val journal = journalRepo.findById(txn, id)
        if (journal == null) {
            logger.info("Journal {} not found", id)
            throw NotFoundException()
        }
        if (journal.owner != authService.getUserId()) {
            logger.warn("[SECURITY] {} attempted to access journal {} belonging to {}",
                authService.getUserId(), id, journal.owner)
            throw ForbiddenException()
        }
        logger.info("Successfully retrieved journal {}", id)
        return journal
    }

    override fun getJournals(txn: Transaction): List<JournalRecord> {
        logger.info("Getting journals for {}", authService.getUserId())
        return journalRepo.fetchByOwner(txn, authService.getUserId())
    }

    override fun create(txn: Transaction, req: EncryptedEntityRequest): JournalRecord {
        logger.info("Creating journal {}", req)
        checkKeyPairExists(txn, req.keyPairId)

        val timestamp = clock.now()
        val journal = Journal(
            idGenerator.generateId(),
            timestamp,
            timestamp,
            req.content,
            authService.getUserId(),
            OwnerType.USER,
            req.keyPairId,
            0,
            req.schema
        )

        val record = journalRepo.create(txn, journal)
        logger.info("Successfully created journal {}", record)
        return record
    }

    override fun exists(txn: Transaction, id: String): Boolean {
        logger.info("Checking if journal {} exists", id)
        // getJournal will throw if user can't access or journal does not exist
        getJournal(txn, id)
        return true
    }

    override fun update(txn: Transaction, req: UpdateJournalReq): JournalRecord {
        logger.info("Updating journal {}", req.journalId)
        checkKeyPairExists(txn, req.keyPairId)

        val journal = getJournal(txn, req.journalId)
        journal.setContent(*req.content)
        journal.modified = clock.now()
        journal.schema = req.schema
        journal.keyPairId = req.keyPairId
        return journalRepo.update(txn, journal)
    }

    private fun checkKeyPairExists(txn: Transaction, keyPairId: String) {
        // KeyPairService will throw appropriate exception if it doesn't exist or user does not
        // have access
        keyPairService.getKeyPair(txn, keyPairId)
    }

    companion object {
        private val logger = LoggerFactory.getLogger(JournalServiceImpl::class.java)
    }
}
