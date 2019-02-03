package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.daos.EntryDao
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.jooq.DSLContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EntryServiceImpl(
    private val entryDao: EntryDao,
    private val authService: AuthService,
    private val journalService: JournalService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeypairService,
    private val dslContext: DSLContext
) : EntryService {

    override fun getEntry(entryId: String): Entry {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry: Entry = entryDao.findById(entryId)
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

    override fun getEntries(journalId: String): List<Entry> {
        logger.info("Getting entries for journal {}", journalId)
        checkJournalExists(journalId)
        return entryDao.fetchByJournalId(journalId)
    }

    override fun create(req: EncryptedEntityRequest, journalId: String): Entry {
        logger.info("Creating entry for journal {}", journalId)
        checkJournalExists(journalId)

        val record: EntryRecord = dslContext.newRecord(Tables.ENTRY)
        record.id = idGenerator.generateId()
        record.timestamp = Instant.now()
        record.setContent(*req.content)
        record.owner = authService.getUserId()
        record.ownerType = OwnerType.USER
        record.journalId = journalId
        record.keyPairId = keyPairService.getKeypair(req.keyPairId).id
        record.insert()

        val entry = record.into(Entry::class.java)
        logger.info("Created {}", entry)
        return entry
    }

    private fun checkJournalExists(journalId: String) {
        // Will throw appropriate exceptions if it does not exist
        journalService.exists(journalId)
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
