package com.etchedjournal.etched

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.models.entity.JournalEntity
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import java.time.Instant

class TestRepoUtils(
    private val journalRepo: JournalRepository,
    private val entryRepo: EntryRepository,
    private val etchRepo: EtchRepository
) {

    fun createJournal(
        content: ByteArray,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): JournalEntity {
        return journalRepo.save(
            JournalEntity(
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType
            )
        )
    }

    fun createEntry(
        journal: JournalEntity,
        content: ByteArray,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): EntryEntity {
        return entryRepo.save(
            EntryEntity(
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType,
                journal = journal
            )
        )
    }

    fun createEtch(
        entry: EntryEntity,
        content: ByteArray,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): EtchEntity {
        return etchRepo.save(
            EtchEntity(
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType,
                entry = entry
            )
        )
    }
}
