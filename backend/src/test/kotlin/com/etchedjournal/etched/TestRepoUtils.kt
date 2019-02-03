package com.etchedjournal.etched

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.daos.EntryDao
import com.etchedjournal.etched.models.jooq.generated.tables.daos.EtchDao
import com.etchedjournal.etched.models.jooq.generated.tables.daos.JournalDao
import com.etchedjournal.etched.models.jooq.generated.tables.daos.KeyPairDao
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import java.time.Instant

class TestRepoUtils(
    private val journalRepo: JournalDao,
    private val entryRepo: EntryDao,
    private val etchRepo: EtchDao,
    private val keyPairRepo: KeyPairDao
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
        journalRepo.insert(j)
        return j
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
        entryRepo.insert(e)
        return e
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
        etchRepo.insert(e)
        return e
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
        keyPairRepo.insert(k)
        return k
    }
}
