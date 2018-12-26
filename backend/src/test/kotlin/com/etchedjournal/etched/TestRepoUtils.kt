package com.etchedjournal.etched

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.models.entity.JournalEntity
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.KeypairRepository
import java.time.Instant

class TestRepoUtils(
    private val journalRepo: JournalRepository,
    private val entryRepo: EntryRepository,
    private val etchRepo: EtchRepository,
    private val keyPairRepo: KeypairRepository
) {

    fun createJournal(
        id: String,
        content: ByteArray,
        keyPair: KeypairEntity,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): JournalEntity {
        return journalRepo.save(
            JournalEntity(
                id = id,
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType,
                keyPair = keyPair
            )
        )
    }

    fun createEntry(
        id: String,
        journal: JournalEntity,
        content: ByteArray,
        keyPair: KeypairEntity,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): EntryEntity {
        return entryRepo.save(
            EntryEntity(
                id = id,
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType,
                journal = journal,
                keyPair = keyPair
            )
        )
    }

    fun createEtch(
        id: String,
        entry: EntryEntity,
        content: ByteArray,
        keyPair: KeypairEntity,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): EtchEntity {
        return etchRepo.save(
            EtchEntity(
                id = id,
                timestamp = timestamp,
                content = content,
                owner = owner,
                ownerType = ownerType,
                entry = entry,
                keyPair = keyPair
            )
        )
    }

    fun createKeyPair(
        id: String,
        publicKey: ByteArray = byteArrayOf(),
        privateKey: ByteArray = byteArrayOf(),
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): KeypairEntity {
        return keyPairRepo.save(
            KeypairEntity(
                id = id,
                publicKey = publicKey,
                privateKey = privateKey,
                timestamp = timestamp,
                owner = owner,
                ownerType = ownerType
            )
        )
    }
}
