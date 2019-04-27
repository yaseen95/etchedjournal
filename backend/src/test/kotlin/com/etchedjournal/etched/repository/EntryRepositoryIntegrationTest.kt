package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.utils.id.IdSerializer
import org.jooq.exception.DataAccessException
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
    private lateinit var journal: Journal

    @Before
    fun setup() {
        testRepoUtils.cleanDb()

        keyPair = testRepoUtils.createKeyPair(
            id = IdSerializer.serialize(10_000),
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )

        journal = testRepoUtils.createJournal(
            id = IdSerializer.serialize(20_000),
            content = byteArrayOf(),
            keyPairId = keyPair.id
        )
    }

    @Test
    fun `create() sets the version`() {
        val id = IdSerializer.serialize(1)
        var entry = Entry(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            0,
            Schema.V1_0
        )
        entry = txnHelper.execute { repo.create(it, entry) }
        assertEquals(1, entry.version)
    }

    @Test(expected = DataAccessException::class)
    fun `create() with the same id fails`() {
        val id = IdSerializer.serialize(1)
        var entry1 = Entry(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            journal.id,
            keyPair.id,
            0,
            Schema.V1_0
        )
        entry1 = txnHelper.execute { repo.create(it, entry1) }
        assertEquals(1, entry1.version)

        val entry2 = Entry(
            id,
            Instant.EPOCH,
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
                journal = journal
            )
        }

        val fetched = txnHelper.execute { repo.fetchByJournal(it, journal.id) }
        val fetchedIds = fetched.map { it.id }
        // Is this test robust enough?
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }
}
