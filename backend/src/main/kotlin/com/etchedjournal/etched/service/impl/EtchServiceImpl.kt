package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.EtchService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.exception.BadRequestException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class EtchServiceImpl(
    private val etchRepo: EtchRepository,
    private val entryService: EntryService,
    private val authService: AuthService,
    private val idGenerator: IdGenerator,
    private val keyPairService: KeyPairService
) : EtchService {

    override fun getEtches(txn: Transaction, entryId: String): List<Etch> {
        // Defer to entryService.getEntry() to handle 404/permissions checks of Entry
        entryService.getEntry(txn, entryId)
        logger.info("Getting etches for Entry(id={})", entryId)
        return etchRepo.fetchByEntryId(txn, entryId)
    }

    override fun getEtch(txn: Transaction, etchId: String): Etch {
        logger.info("Getting EtchEntity(id={})", etchId)
        return etchRepo.findById(txn, etchId)
            ?: throw NotFoundException("No EtchEntity with id $etchId exists.")
    }

    override fun create(txn: Transaction, etches: List<EncryptedEntityRequest>, entryId: String):
        List<Etch> {
        logger.info("Creating {} etches for entry {}", etches.size, entryId)
        if (etches.map { it.keyPairId }.toSet().size != 1) {
            throw BadRequestException(message = "Can only create etches for one key pair at a time")
        }
        // Get the key pair and entry just to check permissions
        keyPairService.getKeyPair(txn = txn, id = etches[0].keyPairId)
        entryService.getEntry(txn, entryId)

        // TODO: Handle empty list
        // Should we just return successfully or throw an error? If fails at the next step but
        // the error message isn't clear what the issue is

        val mappedEtches = mapRequestsToEtches(etches, entryId, etches[0].keyPairId)
        return etchRepo.createEtches(txn, mappedEtches)
    }

    private fun mapRequestsToEtches(
        etchesReq: List<EncryptedEntityRequest>,
        entryId: String,
        keyPairId: String
    ): List<Etch> {
        val timestamp = Instant.now()
        return etchesReq.map {
            Etch(
                idGenerator.generateId(),
                timestamp,
                it.content,
                authService.getUserId(),
                OwnerType.USER,
                entryId,
                keyPairId,
                0,
                it.schema
            )
        }
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EtchServiceImpl::class.java)
    }
}
