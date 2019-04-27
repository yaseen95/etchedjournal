package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.Schema
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
class JournalRepositoryIntegrationTest {

    @Autowired
    private lateinit var repo: JournalRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Autowired
    private lateinit var txnHelper: TxnHelper

    private lateinit var keyPair: KeyPair

    @Before
    fun setup() {
        testRepoUtils.cleanDb()

        keyPair = testRepoUtils.createKeyPair(
            id = IdSerializer.serialize(10_000),
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )
    }

    @Test
    fun `create() sets the version`() {
        val id = IdSerializer.serialize(1)
        var journal = Journal(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            keyPair.id,
            0,
            Schema.V1_0
        )
        journal = txnHelper.execute { repo.create(it, journal) }
        assertEquals(1, journal.version)
    }

    @Test(expected = DataAccessException::class)
    fun `create() with the same id fails`() {
        val id = IdSerializer.serialize(1)
        var journal1 = Journal(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            keyPair.id,
            0,
            Schema.V1_0
        )
        journal1 = txnHelper.execute { repo.create(it, journal1) }
        assertEquals(1, journal1.version)

        val journal2 = Journal(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            keyPair.id,
            // set version to 0
            0,
            Schema.V1_0
        )
        // Try to create again with the version 0
        txnHelper.execute { repo.create(it, journal2) }
    }

    @Test
    fun `created item can be found by id`() {
        val id = IdSerializer.serialize(1)
        val journal = Journal(
            id,
            Instant.EPOCH,
            byteArrayOf(1, 2),
            TestAuthService.TESTER_USER_ID,
            OwnerType.USER,
            keyPair.id,
            0,
            Schema.V1_0
        )
        val created = txnHelper.execute { repo.create(it, journal) }

        val found = txnHelper.execute { repo.findById(it, created.id) }
        assertEquals(found, created)
    }

    @Test
    fun `returns null when no item with id exists`() {
        val result = txnHelper.execute { repo.findById(it, IdSerializer.serialize(24)) }
        assertNull(result)
    }

    @Test
    fun `fetchByOwner is sorted by id ascending`() {
        val id1 = IdSerializer.serialize(1)
        val id2 = IdSerializer.serialize(2)
        val id3 = IdSerializer.serialize(3)

        // insert in reverse order
        listOf(id3, id2, id1).map {
            testRepoUtils.createJournal(
                id = it,
                content = byteArrayOf(1, 2),
                keyPairId = keyPair.id
            )
        }

        val fetched = txnHelper.execute { repo.fetchByOwner(it, TESTER_USER_ID) }
        val fetchedIds = fetched.map { it.id }
        // Is this test robust enough?
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }
}
