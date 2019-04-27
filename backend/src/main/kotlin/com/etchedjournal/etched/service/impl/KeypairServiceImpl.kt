package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.KeyPairRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class KeypairServiceImpl(
    private val keyPairRepo: KeyPairRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator
) : KeypairService {

    override fun createKeypair(txn: Transaction, req: CreateKeypairRequest): KeyPair {
        logger.info("Creating key pair")
        var k = KeyPair(
            idGenerator.generateId(),
            Instant.now(),
            req.publicKey,
            req.privateKey,
            authService.getUserId(),
            OwnerType.USER,
            req.salt,
            req.iterations,
            null
        )
        k = keyPairRepo.create(txn, k)
        logger.info("Created key pair {}", k)
        return k
    }

    override fun getUserKeypairs(txn: Transaction): List<KeyPair> {
        val userId = authService.getUserId()
        logger.info("Getting keypairs for {}", userId)
        val userKeypairs = keyPairRepo.fetchByOwner(txn, userId)
        logger.info("Found {} keypairs for {}", userKeypairs.size, userId)
        return userKeypairs
    }

    override fun getKeypair(txn: Transaction, id: String): KeyPair {
        logger.info("Attempting to get keypair with id {}", id)
        val keypair: KeyPair? = keyPairRepo.findById(txn, id)

        if (keypair == null) {
            logger.info("Unable to find keypair with id {}", id)
            throw NotFoundException()
        }

        if (keypair.owner != authService.getUserId()) {
            // An attacker is attempting to access another persons keys!!!
            logger.error("[SECURITY] {} attempted to access keypair {} which belongs to {}",
                authService.getUserId(), id, keypair.owner)
            throw ForbiddenException()
        }

        logger.info("Fetched keypair with id {}", id)
        return keypair
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(KeypairServiceImpl::class.java)
    }
}
