package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.repository.KeypairRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class KeypairServiceImpl(
    private val keypairRepository: KeypairRepository,
    private val authService: AuthService
) : KeypairService {

    override fun createKeypair(publicKey: ByteArray, privateKey: ByteArray): KeypairEntity {
        val keypair = KeypairEntity(
            publicKey = publicKey,
            privateKey = privateKey,
            owner = authService.getUserId(),
            ownerType = OwnerType.USER
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

    override fun getKeypair(keypairId: UUID): KeypairEntity {
        logger.info("Attempting to get keypair with id {}", keypairId)
        val keypair: KeypairEntity? = keypairRepository.findOne(keypairId)

        if (keypair == null) {
            logger.info("Unable to find keypair with id {}", keypairId)
            throw NotFoundException()
        }

        if (keypair.owner != authService.getUserId()) {
            // An attacker is attempting to access another persons keys!!!
            logger.error("[SECURITY] {} attempted to access keypair {} which belongs to {}",
                authService.getUserId(), keypairId, keypair.owner)
            throw ForbiddenException()
        }

        logger.info("Fetched keypair with id {}", keypairId)
        return keypair
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(KeypairServiceImpl::class.java)
    }
}
