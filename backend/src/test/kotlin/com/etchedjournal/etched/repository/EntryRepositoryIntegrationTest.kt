package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestAuthService.Companion.TESTER
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.TestRepoUtils.Companion.ID_1
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.utils.id.IdSerializer
import org.jooq.exception.DataAccessException
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
@ContextConfiguration(classes = [TestConfig::class])
class EntryRepositoryIntegrationTest {

    @Autowired
    private lateinit var repo: EntryRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Autowired
    private lateinit var txnHelper: TxnHelper

    private lateinit var keyPair: KeyPair
    private lateinit var journal: JournalRecord

    @Before
    fun setup() {
        testRepoUtils.cleanDb()

        keyPair = testRepoUtils.createKeyPair(
            id = ID_1,
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )

        journal = testRepoUtils.createJournal(
            id = ID_1,
            content = byteArrayOf(),
            keyPairId = keyPair.id
        )
    }

    @Test
    fun `create() sets the version`() {
        val id = IdSerializer.serialize(1)
        val entry = Entry(
            id,
            Instant.EPOCH,
            null,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            0,
            Schema.V1_0
        )
        val created = txnHelper.execute { repo.create(it, entry) }
        assertEquals(1, created.version)
    }

    @Test(expected = DataAccessException::class)
    fun `create() with the same id fails`() {
        val id = IdSerializer.serialize(1)
        val entry1 = Entry(
            id,
            Instant.EPOCH,
            null,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            0,
            Schema.V1_0
        )
        val created = txnHelper.execute { repo.create(it, entry1) }
        assertEquals(1, created.version)

        val entry2 = Entry(
            id,
            Instant.EPOCH,
            null,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            // set version to 0
            0,
            Schema.V1_0
        )
        // Try to create again with the version 0
        txnHelper.execute { repo.create(it, entry2) }
    }

    @Test
    fun `created item can be found by id`() {
        val id = IdSerializer.serialize(1)
        val entry = Entry(
            id,
            Instant.EPOCH,
            null,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            0,
            Schema.V1_0
        )
        val created = txnHelper.execute { repo.create(it, entry) }
        val found = txnHelper.execute { repo.findById(it, created.id) }
        assertEquals(found, created)
    }

    @Test
    fun `returns null when no item with id exists`() {
        val result = txnHelper.execute { repo.findById(it, IdSerializer.serialize(24)) }
        assertNull(result)
    }

    @Test
    fun `fetchByJournal is sorted by id ascending`() {
        val id1 = IdSerializer.serialize(1)
        val id2 = IdSerializer.serialize(2)
        val id3 = IdSerializer.serialize(3)

        // insert in reverse order
        listOf(id3, id2, id1).map {
            testRepoUtils.createEntry(
                id = it,
                content = byteArrayOf(1, 2),
                keyPairId = keyPair.id,
                journalId = journal.id
            )
        }

        val fetched = txnHelper.execute { repo.fetchByJournal(it, journal.id) }
        val fetchedIds = fetched.map { it.id }
        // Is this test robust enough?
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }

    @Test
    fun `update updates the record`() {
        testRepoUtils.createEntry(
            id = ID_1,
            journalId = journal.id,
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id,
            created = Instant.EPOCH,
            owner = TESTER.id
        )

        val updated = txnHelper.execute {
            val entry = repo.findById(it, ID_1)!!
            entry.setContent(3, 4)
            entry.modified = Instant.ofEpochMilli(123)
            repo.update(it, entry)
        }

        assertEquals(2, updated.version)
        assertEquals(Instant.ofEpochMilli(123), updated.modified)
        assertArrayEquals(byteArrayOf(3, 4), updated.content)
    }
}
