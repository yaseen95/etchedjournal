package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.repository.KeypairRepository
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
    private val keypairRepository: KeypairRepository,
    private val authService: AuthService,
    private val idGenerator: IdGenerator
) : KeypairService {

    override fun createKeypair(req: CreateKeypairRequest): KeypairEntity {
        val id = idGenerator.generateId()
        logger.info("creating id {}", id)
        val keypair = KeypairEntity(
            id = id,
            publicKey = req.publicKey,
            privateKey = req.privateKey,
            iterations = req.iterations,
            salt = req.salt,
            owner = authService.getUserId(),
            ownerType = OwnerType.USER,
            timestamp = Instant.now()
        )
        logger.info("Creating keypair for {}", keypair.owner)
        val saved = keypairRepository.save(keypair)
        logger.info("Saved keypair with id {}", saved.id)
        return saved
    }

    override fun getUserKeypairs(): List<KeypairEntity> {
        val userId = authService.getUserId()
        logger.info("Getting keypairs for {}", userId)
        val userKeypairs = keypairRepository.findByOwner(userId)
        logger.info("Found {} keypairs for {}", userKeypairs.size, userId)
        return userKeypairs
    }

    override fun getKeypair(id: String): KeypairEntity {
        logger.info("Attempting to get keypair with id {}", id)
        val keypair: KeypairEntity? = keypairRepository.findById(id)

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
