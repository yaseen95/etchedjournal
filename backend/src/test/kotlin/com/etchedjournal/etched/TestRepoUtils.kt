package com.etchedjournal.etched

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.models.jooq.generated.Public
import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.KeyPairRepository
import com.etchedjournal.etched.repository.TxnHelper
import java.time.Instant

class TestRepoUtils(
    private val entryRepo: EntryRepository,
    private val etchRepo: EtchRepository,
    private val keyPairRepo: KeyPairRepository,
    private val journalRepo: JournalRepository,
    private val txnHelper: TxnHelper
) {

    fun cleanDb() {
        txnHelper.execute { txn ->
            if (Public.PUBLIC.tables.size != 4) {
                throw RuntimeException("Need to update tests when adding more tables")
            }
            // Need to drop tables in a specific order to avoid foreign key constraints
            txn.dslCtx.deleteFrom(Tables.ETCH).execute()
            txn.dslCtx.deleteFrom(Tables.ENTRY).execute()
            txn.dslCtx.deleteFrom(Tables.JOURNAL).execute()
            txn.dslCtx.deleteFrom(Tables.KEY_PAIR).execute()
        }
    }

    fun createJournal(
        id: String,
        content: ByteArray,
        keyPairId: String,
        created: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER,
        schema: Schema = Schema.V1_0
    ): Journal {
        val j = Journal(
            id.padEnd(11, '0'),
            created,
            null,
            content,
            owner,
            ownerType,
            keyPairId,
            0,
            schema
        )
        return txnHelper.execute { txn -> journalRepo.create(txn, j) }
    }

    fun createEntry(
        id: String,
        journal: Journal,
        content: ByteArray,
        keyPairId: String,
        created: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER,
        schema: Schema = Schema.V1_0
    ): Entry {
        val e = Entry(
            id.padEnd(11, '0'),
            created,
            null,
            content,
            owner,
            ownerType,
            journal.id,
            keyPairId,
            0,
            schema
        )
        return txnHelper.execute { txn -> entryRepo.create(txn, e) }
    }

    fun createEtch(
        id: String,
        entry: Entry,
        content: ByteArray,
        keyPairId: String,
        created: Instant = Instant.EPOCH,
        owner: String = TestAuthService.TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER,
        schema: Schema = Schema.V1_0
    ): Etch {
        val e = Etch(
            id.padEnd(11, '0'),
            created,
            content,
            owner,
            ownerType,
            entry.id,
            keyPairId,
            0,
            schema
        )
        return txnHelper.execute { txn -> etchRepo.createEtches(txn, listOf(e))[0] }
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
        return txnHelper.execute { txn -> keyPairRepo.create(txn, k) }
    }
}
