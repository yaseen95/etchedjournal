package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.KeypairService
import com.etchedjournal.etched.service.exception.BadRequestException
import com.etchedjournal.etched.utils.PgpUtils
import com.etchedjournal.etched.utils.getAlgorithmStr
import com.etchedjournal.etched.utils.getUserId
import com.etchedjournal.etched.utils.id.IsEtchedId
import org.slf4j.LoggerFactory
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/keypairs")
@Validated
class KeypairServiceController(
    private val keypairService: KeypairService,
    private val authService: AuthService,
    private val txnHelper: TxnHelper
) {

    @PostMapping("")
    fun create(@RequestBody @Valid req: CreateKeypairRequest): KeyPair {
        logger.info("Creating keypair")
        val pubKey = PgpUtils.readPublicKey(req.publicKey)
        logger.info("KeyPair using {} alg, with bit size {}", pubKey.getAlgorithmStr(),
            pubKey.bitStrength)
        // TODO: Prevent keypair creation if key is not strong enough
        // E.g. prevent <= 2048 RSA keys
        // TODO: Validate that key was created recently
        // TODO: Prevent keypair with weak salt and low iteration count

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
        return txnHelper.execute { txn -> keypairService.createKeypair(txn = txn, req = req) }
    }

    @GetMapping("")
    fun getKeypairs(): List<KeyPair> {
        logger.info("Getting keypairs")
        return txnHelper.execute { txn -> keypairService.getUserKeypairs(txn) }
    }

    @GetMapping("/{keypairId}")
    fun getKeypair(@PathVariable @Valid @IsEtchedId keypairId: String): KeyPair {
        logger.info("Getting keypair with id {}", keypairId)
        return txnHelper.execute { txn -> keypairService.getKeypair(txn, keypairId) }
    }

    companion object {
        private val logger = LoggerFactory.getLogger(KeypairServiceController::class.java)
    }
}
