package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestAuthService.Companion.ALICE
import com.etchedjournal.etched.TestAuthService.Companion.TESTER
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.TestRepoUtils.Companion.ID_1
import com.etchedjournal.etched.TestRepoUtils.Companion.ID_2
import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.service.JournalService
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.dto.UpdateEntryReq
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.clock.FakeClock
import com.etchedjournal.etched.utils.id.IdGenerator
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

@RunWith(SpringRunner::class)
@SpringBootTest
@ContextConfiguration(classes = [TestConfig::class])
class EntryServiceImplIntegrationTest {

    private lateinit var service: EntryServiceImpl
    private lateinit var clock: FakeClock
    private lateinit var keyPair: KeyPair
    private lateinit var journal: JournalRecord

    @Autowired
    private lateinit var entryRepo: EntryRepository
    @Autowired
    private lateinit var journalService: JournalService
    @Autowired
    private lateinit var authService: TestAuthService
    @Autowired
    private lateinit var keyPairService: KeyPairService
    @Autowired
    private lateinit var idGenerator: IdGenerator
    @Autowired
    private lateinit var txnHelper: TxnHelper
    @Autowired
    private lateinit var testRepo: TestRepoUtils

    @Before
    fun setup() {
        testRepo.cleanDb()
        authService.clearCurrentUser()

        clock = FakeClock()
        keyPair = testRepo.createKeyPair(id = ID_1)
        journal = testRepo.createJournal(id = ID_1, keyPairId = keyPair.id)

        service = EntryServiceImpl(
            authService = authService,
            idGenerator = idGenerator,
            keyPairService = keyPairService,
            clock = clock,
            journalService = journalService,
            entryRepo = entryRepo
        )
    }

    /*
     * GET ENTRY TESTS
     */

    @Test
    fun `getEntry retrieves entry`() {
        authService.setCurrentUser(TESTER)

        val entry = testRepo.createEntry(
            id = ID_1,
            content = byteArrayOf(1, 2, 3),
            keyPairId = keyPair.id,
            owner = TESTER.id
        )
        val actual = txnHelper.execute { txn -> service.getEntry(txn, entry.id) }

        assertEquals(ID_1, actual.id)
        assertEquals(keyPair.id, actual.keyPairId)
        assertArrayEquals(byteArrayOf(1, 2, 3), actual.content)
    }

    @Test(expected = NotFoundException::class)
    fun `getEntry throws not found`() {
        authService.setCurrentUser(TESTER)
        txnHelper.execute { txn -> service.getEntry(txn, ID_1) }
    }

    @Test(expected = ForbiddenException::class)
    fun `getEntry throws forbidden if user cannot access entity`() {
        authService.setCurrentUser(TESTER)
        val entry = testRepo.createEntry(
            id = ID_1,
            content = byteArrayOf(1),
            keyPairId = keyPair.id,
            owner = "somebody else"
        )
        txnHelper.execute { txn -> service.getEntry(txn, entry.id) }
    }

    /*
     * GET ENTRIES TESTS
     */

    @Test
    fun `getEntries - returns nothing when no entries for journal`() {
        authService.setCurrentUser(TESTER)
        val entries = txnHelper.execute { txn -> service.getEntries(txn, journal.id) }
        assertEquals(0, entries.size)
    }

    @Test
    fun `getEntries - returns journals in ascending order`() {
        authService.setCurrentUser(TESTER)
        txnHelper.execute { txn ->
            service.create(txn, createEncryptedEntityReq(byteArrayOf(1)), journal.id)
            service.create(txn, createEncryptedEntityReq(byteArrayOf(2)), journal.id)
            service.create(txn, createEncryptedEntityReq(byteArrayOf(3)), journal.id)
        }
        val entries = txnHelper.execute { txn -> service.getEntries(txn, journal.id) }

        assertEquals(3, entries.size)
        assertArrayEquals(byteArrayOf(1), entries[0].content)
        assertArrayEquals(byteArrayOf(2), entries[1].content)
        assertArrayEquals(byteArrayOf(3), entries[2].content)
    }

    @Test(expected = NotFoundException::class)
    fun `getEntries - throws not found if journal does not exist`() {
        authService.setCurrentUser(TESTER)
        txnHelper.execute { txn -> service.getEntries(txn, ID_2) }
    }

    @Test(expected = ForbiddenException::class)
    fun `getEntries - throws forbidden found if caller cannot access journal`() {
        authService.setCurrentUser(ALICE)
        // journal belongs to TESTER
        txnHelper.execute { txn -> service.getEntries(txn, journal.id) }
    }

    /*
     * CREATE ENTRY TESTS
     */

    @Test
    fun `createEntry - creates entry`() {
        authService.setCurrentUser(TESTER)
        clock.millis = 101

        val req = createEncryptedEntityReq()
        val created = txnHelper.execute { service.create(it, req, journal.id) }

        assertArrayEquals(byteArrayOf(1), created.content)
        assertEquals(TESTER.id, created.owner)
        assertEquals(Schema.V1_0, created.schema)
        assertEquals(101, created.created.toEpochMilli())
        assertNull(created.modified)
        assertEquals(1, created.version)
        assertEquals(Schema.V1_0, created.schema)
    }

    @Test(expected = ForbiddenException::class)
    fun `createEntry fails when accessing unowned key pair`() {
        authService.setCurrentUser(ALICE)
        val req = createEncryptedEntityReq()
        txnHelper.execute { service.create(it, req, journal.id) }
    }

    @Test(expected = NotFoundException::class)
    fun `createEntry - fails when key pair does not exist`() {
        authService.setCurrentUser(TESTER)
        val req = createEncryptedEntityReq(keyPairId = ID_2)
        txnHelper.execute { service.create(it, req, journal.id) }
    }

    @Test
    fun `createEntry can be getEntryd`() {
        authService.setCurrentUser(TESTER)

        val req = createEncryptedEntityReq()
        val created = txnHelper.execute { service.create(it, req, journal.id) }
        val got = getEntry(created.id)
        assertEquals(created, got)
    }

    private fun createEntryUpdateReq(
        id: String,
        content: ByteArray = byteArrayOf(1),
        keyPairId: String = keyPair.id,
        schema: Schema = Schema.V1_0
    ): UpdateEntryReq {
        return UpdateEntryReq(
            entryId = id,
            content = content,
            keyPairId = keyPairId,
            schema = schema
        )
    }

    private fun createEncryptedEntityReq(
        content: ByteArray = byteArrayOf(1),
        keyPairId: String = keyPair.id,
        schema: Schema = Schema.V1_0
    ): EncryptedEntityRequest {
        return EncryptedEntityRequest(content = content, keyPairId = keyPairId, schema = schema)
    }

    /*
     * UPDATE ENTRY TESTS
     */

    @Test
    fun `updateEntry updates entry`() {
        authService.setCurrentUser(TESTER)
        clock.millis = 123

        val created = testRepo.createEntry(ID_1, keyPair.id, byteArrayOf(1))
        assertNull(created.modified)
        assertArrayEquals(byteArrayOf(1), created.content)

        txnHelper.execute { txn ->
            val req = createEntryUpdateReq(created.id, byteArrayOf(2))
            service.update(txn, req)
        }

        val updated = getEntry(ID_1)
        assertEquals(123, updated.modified.toEpochMilli())
        assertEquals(2, updated.version)
        assertArrayEquals(byteArrayOf(2), updated.content)
    }

    @Test
    fun `updateEntry can update the key pair`() {
        authService.setCurrentUser(TESTER)

        val created = testRepo.createEntry(ID_1, keyPair.id, byteArrayOf(1))
        assertEquals(ID_1, created.keyPairId)

        val keyPair2 = testRepo.createKeyPair(id = ID_2)

        txnHelper.execute { txn ->
            val req = createEntryUpdateReq(created.id, keyPairId = keyPair2.id)
            service.update(txn, req)
        }

        val updated = getEntry(ID_1)
        assertEquals(ID_2, updated.keyPairId)
    }

    @Test(expected = NotFoundException::class)
    fun `updateEntry that does not exist 404s`() {
        authService.setCurrentUser(TESTER)
        val req = createEntryUpdateReq(ID_1)
        txnHelper.execute { txn -> service.update(txn, req) }
    }

    @Test(expected = ForbiddenException::class)
    fun `updateEntry throws forbidden if user cannot access entry`() {
        authService.setCurrentUser(TESTER)

        testRepo.createEntry(
            // Owner is "somebody else" but current user is TESTER
            owner = "somebody else",
            id = ID_1,
            content = byteArrayOf(1),
            keyPairId = keyPair.id
        )

        txnHelper.execute { txn ->
            val req = createEntryUpdateReq(ID_1)
            service.update(txn, req)
        }
    }

    @Test(expected = ForbiddenException::class)
    fun `updateEntry throws forbidden if user cannot access keyPair`() {
        authService.setCurrentUser(TESTER)
        testRepo.createEntry(id = ID_1, keyPairId = keyPair.id)

        val aliceKeyPair = testRepo.createKeyPair(id = ID_2, owner = ALICE.id)
        txnHelper.execute { txn ->
            val req = createEntryUpdateReq(ID_1, keyPairId = aliceKeyPair.id)
            service.update(txn, req)
        }
    }

    @Test(expected = NotFoundException::class)
    fun `updateEntry throws not found if keyPair does not exist`() {
        authService.setCurrentUser(TESTER)
        testRepo.createEntry(id = ID_1, keyPairId = keyPair.id)

        txnHelper.execute { txn ->
            val req = createEntryUpdateReq(ID_1, keyPairId = ID_2)
            service.update(txn, req)
        }
    }

    private fun getEntry(id: String): EntryRecord {
        return txnHelper.execute { txn -> service.getEntry(txn, id) }
    }
}
