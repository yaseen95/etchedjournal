package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.service.JournalService
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
class JournalServiceController(private val journalService: JournalService) {

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getJournals(): List<Journal> {
        return journalService.getJournals()
    }

    @GetMapping("/{journalId}")
    fun getJournal(@PathVariable @Valid @IsEtchedId journalId: String): Journal {
        return journalService.getJournal(journalId)
    }

    @PostMapping("")
    fun createJournal(@Valid @RequestBody req: EncryptedEntityRequest): Journal {
        return journalService.create(req)
    }
}
