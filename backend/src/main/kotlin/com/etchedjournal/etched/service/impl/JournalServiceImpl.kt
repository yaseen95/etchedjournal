package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.JournalEntity
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class JournalServiceImpl(
    private val repo: JournalRepository,
    private val authService: AuthService
) : JournalService {
    override fun getJournal(id: UUID): JournalEntity {
        logger.info("Attempting to get journal {}", id)
        val journal = repo.findOne(id)
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
        var journals = repo.findByOwner(authService.getUserId())
        if (journals.isEmpty()) {
            // Create the default journal if the user doesn't have one
            val j = createDefaultJournal()
            journals = listOf(j)
        }
        return journals
    }

    override fun create(content: ByteArray): JournalEntity {
        val journal = JournalEntity(
            content = content,
            owner = authService.getUserId(),
            ownerType = OwnerType.USER
        )
        return createJournal(journal)
    }

    override fun exists(id: UUID): Boolean {
        logger.info("Checking if journal {} exists", id)
        return repo.existsByIdAndOwner(id, authService.getUserId())
    }

    private fun createDefaultJournal(): JournalEntity  {
        logger.info("Creating default journal for {}", authService.getUserId())
        val j = JournalEntity.createDefault(owner = authService.getUserId())
        return createJournal(j)
    }

    private fun createJournal(journal: JournalEntity): JournalEntity {
        logger.info("Creating journal for {}", journal.owner)
        val j = repo.save(journal)
        logger.info("Successfully created journal {}", j)
        return j
    }

    companion object {
        private val logger = LoggerFactory.getLogger(JournalServiceImpl::class.java)
    }
}
