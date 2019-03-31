package com.etchedjournal.etched

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.KeyPairRepository
import java.time.Instant

class TestRepoUtils(
    private val entryRepo: EntryRepository,
    private val etchRepo: EtchRepository,
    private val keyPairRepo: KeyPairRepository,
    private val journalRepo: JournalRepository
) {

    fun createJournal(
        id: String,
        content: ByteArray,
        keyPairId: String,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): Journal {
        val j = Journal(
            id.padEnd(11, '0'),
            timestamp,
            content,
            owner,
            ownerType,
            keyPairId,
            0
        )
        return journalRepo.create(j)
    }

    fun createEntry(
        id: String,
        journal: Journal,
        content: ByteArray,
        keyPairId: String,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): Entry {
        val e = Entry(
            id.padEnd(11, '0'),
            timestamp,
            content,
            owner,
            ownerType,
            journal.id,
            keyPairId,
            0
        )
        return entryRepo.create(e)
    }

    fun createEtch(
        id: String,
        entry: Entry,
        content: ByteArray,
        keyPairId: String,
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): Etch {
        val e = Etch(
            id.padEnd(11, '0'),
            timestamp,
            content,
            owner,
            ownerType,
            entry.id,
            keyPairId,
            0
        )
        return etchRepo.createEtches(listOf(e))[0]
    }

    fun createKeyPair(
        id: String,
        publicKey: ByteArray = byteArrayOf(),
        privateKey: ByteArray = byteArrayOf(),
        iterations: Int = 1,
        salt: String = "salt",
        timestamp: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER
    ): KeyPair {
        val k = KeyPair(
            id.padEnd(11, '0'),
            timestamp,
            publicKey,
            privateKey,
            owner,
            ownerType,
            salt,
            iterations,
            0
        )
        keyPairRepo.create(k)
        return k
    }
}
