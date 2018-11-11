package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.utils.PgpUtils
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
    private val keypairService: KeypairService
) {

    @PostMapping("")
    fun create(@RequestBody @Valid request: CreateKeypairRequest): KeypairEntity {
        logger.info("Creating keypair")
        val pubKey = PgpUtils.readPublicKey(request.publicKey)
        logger.info("Creating keypair for {}", pubKey.userIDs.asSequence().toList())

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
