package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
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
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EtchRepositoryTest {

    @Autowired
    private lateinit var repo: EtchRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    private lateinit var keyPair: KeyPair
    private lateinit var journal: Journal
    private lateinit var entry: Entry

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

        entry = testRepoUtils.createEntry(
            id = IdSerializer.serialize(30_000),
            journal = journal,
            content = byteArrayOf(),
            keyPairId = keyPair.id
        )
    }

    @Test
    fun `create() sets the version`() {
        val id = IdSerializer.serialize(1)
        val e = Etch(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            entry.id,
            keyPair.id,
            0,
            "1.0.0"
        )
        val created = repo.createEtches(listOf(e))[0]
        assertEquals(1, created.version)
    }

    @Test(expected = DataAccessException::class)
    fun `create() with the same id fails`() {
        val id = IdSerializer.serialize(1)
        var e1 = Etch(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            entry.id,
            keyPair.id,
            0,
            "1.0.0"
        )
        e1 = repo.createEtches(listOf(e1))[0]
        assertEquals(1, e1.version)

        val e2 = Etch(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            entry.id,
            keyPair.id,
            // set version to 0
            0,
            "1.0.0"
        )
        // Try to create again with the version 0
        repo.createEtches(listOf(e2))
    }

    @Test
    fun `created item can be found by id`() {
        val id = IdSerializer.serialize(1)
        val e = Etch(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            entry.id,
            keyPair.id,
            0,
            "1.0.0"
        )
        val created = repo.createEtches(listOf(e))[0]

        val found = repo.findById(created.id)
        assertEquals(found, created)
    }

    @Test
    fun `returns null when no item with id exists`() {
        assertNull(repo.findById(IdSerializer.serialize(24)))
    }

    @Test
    fun `fetchByEntryId is sorted by id ascending`() {
        val id1 = IdSerializer.serialize(1)
        val id2 = IdSerializer.serialize(2)
        val id3 = IdSerializer.serialize(3)

        // insert in reverse order
        listOf(id3, id2, id1).map {
            testRepoUtils.createEtch(
                id = it,
                content = byteArrayOf(1, 2),
                keyPairId = keyPair.id,
                entry = entry
            )
        }

        val fetched = repo.fetchByEntryId(entry.id)
        val fetchedIds = fetched.map { it.id }
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }
}
