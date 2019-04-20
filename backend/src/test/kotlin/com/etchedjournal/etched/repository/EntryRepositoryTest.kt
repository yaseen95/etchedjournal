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
import org.junit.Assert
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EntryRepositoryTest {

    @Autowired
    private lateinit var repo: EntryRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    private lateinit var keyPair: KeyPair
    private lateinit var journal: Journal

    @Before
    fun setup() {
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
        entry = repo.create(entry)
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
        entry1 = repo.create(entry1)
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
        repo.create(entry2)
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
        val created = repo.create(entry)

        val found = repo.findById(created.id)
        assertEquals(found, created)
    }

    @Test
    fun `returns null when no item with id exists`() {
        Assert.assertNull(repo.findById(IdSerializer.serialize(24)))
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

        val fetched = repo.fetchByJournal(journal.id)
        val fetchedIds = fetched.map { it.id }
        // Is this test robust enough?
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }
}
