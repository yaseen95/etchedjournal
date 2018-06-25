package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.service.AuthService
import com.etchedjournal.etched.service.EntryService
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class EntryServiceImpl(
    private val entryRepository: EntryRepository,
    private val authService: AuthService
) : EntryService {

    override fun getEntry(entryId: Long): Entry {
        logger.info("Attempting to get Entry(id={})", entryId)
        val entry: Entry = entryRepository.findOne(entryId)
            ?: throw NotFoundException("Unable to find entry with id $entryId")

        if (entry.userId != authService.getUserId()) {
            // TODO: Should we 403 or 404?
            logger.info(
                "User attempted to access Entry(id={}) which belongs to another user",
                entryId
            )
            throw ForbiddenException()
        }
        return entry
    }

    override fun getEntries(): List<Entry> {
        logger.info("Getting entries")
        return entryRepository.findByUserId(authService.getUserId()).toList()
    }

    override fun create(title: String): Entry {
        logger.info("Creating entry")
        return entryRepository.save(Entry(title, authService.getUserId()))
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(EntryServiceImpl::class.java)
    }
}
