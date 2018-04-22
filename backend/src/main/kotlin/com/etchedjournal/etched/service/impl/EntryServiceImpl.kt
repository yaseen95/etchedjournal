package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.controller.EntryServiceController
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import org.springframework.stereotype.Service

@Service
class EntryServiceImpl(
        private val entryRepository: EntryRepository,
        private val authService: AuthService
) : EntryService {

    override fun getEntry(entryId: Long): Entry {
        val entry: Entry = entryRepository.findOne(entryId)
                ?: throw Exception("Unable to find entry with id $entryId")
        if (entry.userId != authService.simpleUser().userId) {
            throw Exception("Unauthorized")
        }
        return entry
    }

    override fun getEntries(): List<Entry> {
        EntryServiceController.logger.info("Getting entries for ${authService.simpleUser()}")
        return entryRepository.findByUserId(authService.simpleUser().userId).toList()
    }

    override fun create(title: String): Entry {
        return entryRepository.save(Entry(title, authService.simpleUser().userId))
    }
}
