package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.utils.id.IdSerializer
import org.jooq.exception.DataAccessException
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
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
class KeyPairRepositoryIntegrationTest {

    @Autowired
    private lateinit var repo: KeyPairRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Autowired
    private lateinit var txnHelper: TxnHelper

    @Before
    fun setup() {
        testRepoUtils.cleanDb()
    }

    @Test
    fun `create and get`() {
        val keyPair = KeyPair(
            "abcdefghijk",
            Instant.EPOCH,
            byteArrayOf(1),
            byteArrayOf(2),
            "owner",
            OwnerType.USER,
            "foobar",
            10,
            null
        )
        val retrieved: KeyPair = txnHelper.execute {
            repo.create(it, keyPair)
            repo.findById(it, "abcdefghijk")!!
        }

        assertEquals("abcdefghijk", retrieved.id)
        assertEquals(Instant.EPOCH, retrieved.timestamp)
        assertArrayEquals(byteArrayOf(1), retrieved.publicKey)
        assertArrayEquals(byteArrayOf(2), retrieved.privateKey)
        assertEquals("owner", retrieved.owner)
        assertEquals(OwnerType.USER, retrieved.ownerType)
        assertEquals(10, retrieved.iterations)
        assertEquals("foobar", retrieved.salt)
        // version should have incremented
        assertEquals(1, retrieved.version)
    }

    @Test
    fun `throws when create already exists`() {
        val keyPair = KeyPair(
            IdSerializer.serialize(1),
            Instant.EPOCH,
            byteArrayOf(1),
            byteArrayOf(2),
            "owner",
            OwnerType.USER,
            "foobar",
            10,
            null
        )
        txnHelper.execute {
            repo.create(it, keyPair)
            try {
                repo.create(it, keyPair)
                fail()
            } catch (e: DataAccessException) {
                assertTrue(e.message!!.contains("Key (id)=(1) already exists."))
            }
        }
    }

    @Test
    fun `findByOwner is sorted`() {
        val id1 = IdSerializer.serialize(1)
        val id2 = IdSerializer.serialize(2)
        val id3 = IdSerializer.serialize(3)

        // insert in reverse order
        listOf(id3, id2, id1).map {
            testRepoUtils.createKeyPair(id = it)
        }

        val fetched = txnHelper.execute { repo.fetchByOwner(it, TESTER_USER_ID) }
        val fetchedIds = fetched.map { it.id }
        // Is this test robust enough?
        assertEquals(listOf(id1, id2, id3), fetchedIds)
    }

    @Test
    fun `returns null when no key pair with id exists`() {
        val result = txnHelper.execute { repo.findById(it, IdSerializer.serialize(100)) }
        assertNull(result)
    }
}
