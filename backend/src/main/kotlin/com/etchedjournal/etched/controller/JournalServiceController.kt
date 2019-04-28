package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.dto.UpdateJournalReq
import com.etchedjournal.etched.utils.id.IsEtchedId
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/journals")
@Validated
class JournalServiceController(
    private val journalService: JournalService,
    private val txnHelper: TxnHelper
) {

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getJournals(): List<Journal> {
        return txnHelper.execute { txn -> journalService.getJournals(txn) }
            .map { it.into(Journal::class.java) }
    }

    @GetMapping("/{journalId}")
    fun getJournal(@PathVariable @Valid @IsEtchedId journalId: String): Journal {
        val journal = txnHelper.execute { txn -> journalService.getJournal(txn, journalId) }
        return journal.into(Journal::class.java)
    }

    @PostMapping("")
    fun createJournal(@Valid @RequestBody req: EncryptedEntityRequest): Journal {
        val journal = txnHelper.execute { txn -> journalService.create(txn, req) }
        return journal.into(Journal::class.java)
    }

    @PostMapping("/{journalId}")
    fun updateJournal(
        @Valid @RequestBody req: EncryptedEntityRequest,
        @PathVariable @Valid @IsEtchedId journalId: String
    ): Journal {
        val updateReq = UpdateJournalReq(
            journalId = journalId,
            content = req.content,
            keyPairId = req.keyPairId,
            schema = req.schema
        )
        val journal = txnHelper.execute { txn -> journalService.update(txn, updateReq) }
        return journal.into(Journal::class.java)
    }
}
