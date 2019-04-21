package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class JournalServiceImpl(
    private val journalRepo: JournalRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeypairService
) : JournalService {

    override fun getJournal(id: String): Journal {
        logger.info("Attempting to get journal {}", id)
        val journal = journalRepo.findById(id)
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

    override fun getJournals(): List<Journal> {
        logger.info("Getting journals for {}", authService.getUserId())
        return journalRepo.fetchByOwner(authService.getUserId())
    }

    override fun create(req: EncryptedEntityRequest): Journal {
        logger.info("Creating journal {}", req)

        // Get key pair to check permissions
        val keyPair = keyPairService.getKeypair(req.keyPairId)

        var journal = Journal(
            idGenerator.generateId(),
            Instant.now(),
            null,
            req.content,
            authService.getUserId(),
            OwnerType.USER,
            keyPair.id,
            0,
            req.schema
        )

        journal = journalRepo.create(journal)
        logger.info("Successfully created journal {}", journal)
        return journal
    }

    override fun exists(id: String): Boolean {
        logger.info("Checking if journal {} exists", id)
        // getJournal will throw if user can't access or journal does not exist
        getJournal(id)
        return true
    }

    companion object {
        private val logger = LoggerFactory.getLogger(JournalServiceImpl::class.java)
    }
}
