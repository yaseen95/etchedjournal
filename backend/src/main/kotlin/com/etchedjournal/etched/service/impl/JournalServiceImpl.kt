package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.JournalEntity
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
    private val repo: JournalRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeypairService
) : JournalService {

    override fun getJournal(id: String): JournalEntity {
        logger.info("Attempting to get journal {}", id)
        val journal = repo.findById(id)
        if (journal == null) {
            logger.info("Journal {} not found")
            throw NotFoundException()
        }
        if (journal.owner != authService.getUserId()) {
            logger.warn("[SECURITY] {} attempted to access journal {}", authService.getUserId(),
                id)
            throw ForbiddenException()
        }
        logger.info("Successfully retrieved journal {}", id)
        return journal
    }

    override fun getJournals(): List<JournalEntity> {
        logger.info("Getting journals for {}", authService.getUserId())
        return repo.findByOwner(authService.getUserId()).toList()
    }

    override fun create(req: EncryptedEntityRequest): JournalEntity {
        logger.info("Creating journal", authService.getUserId())
        var journal = JournalEntity(
            id = idGenerator.generateId(),
            content = req.content,
            owner = authService.getUserId(),
            ownerType = OwnerType.USER,
            timestamp = Instant.now(),
            keyPair = keyPairService.getKeypair(req.keyPairId)
        )
        journal = repo.save(journal)
        logger.info("Successfully created journal {}", journal.id)
        return journal
    }

    override fun exists(id: String): Boolean {
        logger.info("Checking if journal {} exists", id)
        // TODO: Determine whether journal exists or user does not have correct access perms
        // If it's false we don't know why
        return repo.existsByIdAndOwner(id, authService.getUserId())
    }

    companion object {
        private val logger = LoggerFactory.getLogger(JournalServiceImpl::class.java)
    }
}
