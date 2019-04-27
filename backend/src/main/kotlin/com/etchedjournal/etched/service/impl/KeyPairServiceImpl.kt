package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.CreateKeyPairRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.KeyPairRepository
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.id.IdGenerator
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class KeyPairServiceImpl(
    private val keyPairRepo: KeyPairRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator
) : KeyPairService {

    override fun createKeyPair(txn: Transaction, req: CreateKeyPairRequest): KeyPair {
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

    override fun getUserKeyPairs(txn: Transaction): List<KeyPair> {
        val userId = authService.getUserId()
        logger.info("Getting key pairs for {}", userId)
        val userKeypairs = keyPairRepo.fetchByOwner(txn, userId)
        logger.info("Found {} key pairs for {}", userKeypairs.size, userId)
        return userKeypairs
    }

    override fun getKeyPair(txn: Transaction, id: String): KeyPair {
        logger.info("Attempting to get keyPair with id {}", id)
        val keyPair: KeyPair? = keyPairRepo.findById(txn, id)

        if (keyPair == null) {
            logger.info("Unable to find keyPair with id {}", id)
            throw NotFoundException()
        }

        if (keyPair.owner != authService.getUserId()) {
            // An attacker is attempting to access another persons keys!!!
            logger.error("[SECURITY] {} attempted to access keyPair {} which belongs to {}",
                authService.getUserId(), id, keyPair.owner)
            throw ForbiddenException()
        }

        logger.info("Fetched keyPair with id {}", id)
        return keyPair
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(KeyPairServiceImpl::class.java)
    }
}
