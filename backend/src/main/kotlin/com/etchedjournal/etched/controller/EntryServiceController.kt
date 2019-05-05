package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.dto.UpdateEntryReq
import com.etchedjournal.etched.utils.id.IsEtchedId
import org.slf4j.LoggerFactory
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RequestMapping("/api/v1/entries")
@RestController
@Validated
class EntryServiceController(
    private val entryService: EntryService,
    private val txnHelper: TxnHelper
) {

    /**
     * Returns an Entry with the specified ID.
     */
    @GetMapping("/{entryId}")
    fun getEntry(@PathVariable @Valid @IsEtchedId entryId: String): Entry {
        return txnHelper.execute { txn -> entryService.getEntry(txn, entryId) }
            .into(Entry::class.java)
    }

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getEntries(@RequestParam @Valid @IsEtchedId journalId: String): List<Entry> {
        return txnHelper.execute { txn -> entryService.getEntries(txn, journalId) }
            .map { it.into(Entry::class.java) }
    }

    /**
     * Creates a new entry
     */
    @PostMapping("")
    fun create(
        @Valid @RequestBody req: EncryptedEntityRequest,
        @RequestParam @Valid @IsEtchedId journalId: String
    ): Entry {
        logger.info("Creating an entry for journal {}", journalId)
        val createdEntry = txnHelper.execute { txn -> entryService.create(txn, req, journalId) }
        logger.info("Created entry {}", createdEntry)
        return createdEntry.into(Entry::class.java)
    }

    @PostMapping("/{entryId}")
    fun updateJournal(
        @Valid @RequestBody req: EncryptedEntityRequest,
        @PathVariable @Valid @IsEtchedId entryId: String
    ): Entry {
        val updateReq = UpdateEntryReq(
            entryId = entryId,
            content = req.content,
            keyPairId = req.keyPairId,
            schema = req.schema
        )
        val entry = txnHelper.execute { txn -> entryService.update(txn, updateReq) }
        return entry.into(Entry::class.java)
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EntryServiceController::class.java)
    }
}
