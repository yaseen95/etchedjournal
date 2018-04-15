package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class EntryServiceImpl: EntryService {

    @Autowired
    private lateinit var entryRepository: EntryRepository

    @Autowired
    private lateinit var authService: AuthService

    override fun getEntry(entryId: Long): Entry {
        // TODO: Throw 404 if not found
        return entryRepository.findOne(entryId)
    }

    override fun getEntries(): List<Entry> {
        return entryRepository.findAll().toList()
    }

    override fun create(title: String): Entry {
        return entryRepository.save(Entry(title, authService.simpleUser().userId))
    }
}
