package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.service.exception.ForbiddenException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EntryServiceImpl(
        private val entryRepository: EntryRepository,
        private val authService: AuthService
) : EntryService {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }

    override fun getEntry(entryId: Long): Entry {
        val entry: Entry = entryRepository.findOne(entryId)
                ?: throw NotFoundException("Unable to find entry with id $entryId")

        val requestingUserId = authService.getUserId()
        if (entry.userId != authService.getUserId()) {
            logger.info("User '$requestingUserId' attempted to access Entry(id=${entry.id}) " +
                    "which belongs to another user")
            throw ForbiddenException()
        }
        return entry
    }

    override fun getEntries(): List<Entry> {
        val userId = authService.getUserId()
        logger.info("Getting entries for '$userId'")
        return entryRepository.findByUserId(userId).toList()
    }

    override fun create(title: String): Entry {
        val userId = authService.getUserId()
        logger.info("Creating entry for '$userId'")
        return entryRepository.save(Entry(title, userId))
    }
}
