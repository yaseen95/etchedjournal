package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.JournalEntity
import com.etchedjournal.etched.service.JournalService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/journals")
class JournalServiceController(private val journalService: JournalService) {

    /**
     * Returns all entries.
     */
    @GetMapping("")
    fun getJournals(): List<JournalEntity> {
        return journalService.getJournals()
    }

    @GetMapping("/{journalId}")
    fun getJournal(@PathVariable journalId: UUID): JournalEntity {
        return journalService.getJournal(journalId)
    }

    @PostMapping("")
    fun createJournal(@RequestBody req: EncryptedEntityRequest): JournalEntity {
        return journalService.create(content = req.content)
    }
}
