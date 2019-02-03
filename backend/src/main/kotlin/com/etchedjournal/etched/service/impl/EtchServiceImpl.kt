package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.daos.EtchDao
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.models.jooq.generated.tables.records.EtchRecord
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.BadRequestException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.jooq.DSLContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EtchServiceImpl(
    private val etchDao: EtchDao,
    private val entryService: EntryService,
    private val authService: AuthService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeypairService,
    private val dslContext: DSLContext
) : EtchService {

    override fun getEtches(entryId: String): List<Etch> {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(entryId)
        logger.info("Getting etches for Entry(id={})", entryId)
        return etchDao.fetchByEntryId(entryId)
    }

    override fun getEtch(etchId: String): Etch {
        logger.info("Getting EtchEntity(id={})", etchId)
        return etchDao.findById(etchId)
            ?: throw NotFoundException("No EtchEntity with id $etchId exists.")
    }

    override fun create(etches: List<EncryptedEntityRequest>, entryId: String): List<Etch> {
        logger.info("Creating {} etches for entry {}", etches.size, entryId)
        if (etches.map { it.keyPairId }.toSet().size != 1) {
            throw BadRequestException(message = "Can only create etches for one key pair at a time")
        }
        // Get the key pair and entry just to check permissions
        keyPairService.getKeypair(id = etches[0].keyPairId)
        entryService.getEntry(entryId)

        // TODO: Handle empty list
        // Should we just return successfully or throw an error? If fails at the next step but
        // the error message isn't clear what the issue is

        val newEtches = createRecords(etches, entryId)
        newEtches.forEach { it.insert() }
        // Can't use batchInsert due to version issues
        // https://github.com/jOOQ/jOOQ/issues/8283
        // dslContext.batchInsert(newEtches).execute()
        return newEtches.map { it.into(Etch::class.java) }
    }

    private fun createRecords(etchesReq: List<EncryptedEntityRequest>, entryId: String): List<EtchRecord> {
        val timestamp = Instant.now()
        return etchesReq.map {
            val record = dslContext.newRecord(Tables.ETCH)
            record.id = idGenerator.generateId()
            // Give all the etches the same server side timestamp
            // The client side schema will be responsible for ordering the etches
            record.timestamp = timestamp
            record.setContent(*it.content)
            record.owner = authService.getUserId()
            record.ownerType = OwnerType.USER
            record.entryId = entryId
            record.keyPairId = etchesReq[0].keyPairId
            record
        }
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EtchServiceImpl::class.java)
    }
}
