package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.BadRequestException
import com.etchedjournal.etched.utils.PgpUtils
import com.etchedjournal.etched.utils.getAlgorithmStr
import com.etchedjournal.etched.utils.getUserId
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/keypairs")
class KeypairServiceController(
    private val keypairService: KeypairService,
    private val authService: AuthService
) {

    @PostMapping("")
    fun create(@RequestBody @Valid request: CreateKeypairRequest): KeypairEntity {
        logger.info("Creating keypair")
        val pubKey = PgpUtils.readPublicKey(request.publicKey)
        logger.info("KeyPair using {} alg, with bit size {}", pubKey.getAlgorithmStr(),
            pubKey.bitStrength)
        // TODO: Prevent keypair creation if key is not strong enough
        // E.g. prevent <= 2048 RSA keys
        // TODO: Validate that key was created recently

        // Verify that the user id is valid
        val currUserId = authService.getUserId()
        val expected = "$currUserId <$currUserId@users.etchedjournal.com>"
        if (pubKey.getUserId() != expected) {
            logger.error("[SECURITY] PGP key id is malformed, expected '{}' but got '{}'", expected,
                pubKey.getUserId())
            // TODO: Should we throw a different exception?
            throw BadRequestException()
        }
        logger.info("Registering key with with user id {}", pubKey.getUserId())

        return keypairService.createKeypair(
            publicKey = request.publicKey,
            privateKey = request.privateKey
        )
    }

    @GetMapping("")
    fun getKeypairs(): List<KeypairEntity> {
        logger.info("Getting keypairs")
        return keypairService.getUserKeypairs()
    }

    @GetMapping("/{keypairId}")
    fun getKeypair(@PathVariable keypairId: UUID): KeypairEntity {
        logger.info("Getting keypair with id {}", keypairId)
        return keypairService.getKeypair(keypairId)
    }

    companion object {
        private val logger = LoggerFactory.getLogger(KeypairServiceController::class.java)
    }
}
