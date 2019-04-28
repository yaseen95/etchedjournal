package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestAuthService.Companion.ALICE
import com.etchedjournal.etched.TestAuthService.Companion.TESTER
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.service.KeyPairService
import com.etchedjournal.etched.service.dto.UpdateJournalReq
import com.etchedjournal.etched.service.exception.ForbiddenException
import com.etchedjournal.etched.service.exception.NotFoundException
import com.etchedjournal.etched.utils.clock.FakeClock
import com.etchedjournal.etched.utils.id.IdGenerator
import com.etchedjournal.etched.utils.id.IdSerializer
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
class JournalServiceImplIntegrationTest {

    private lateinit var service: JournalServiceImpl
    private lateinit var clock: FakeClock
    private lateinit var keyPair: KeyPair

    @Autowired
    private lateinit var journalRepo: JournalRepository
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
        keyPair = testRepo.createKeyPair(ID_1)

        service = JournalServiceImpl(
            journalRepo = journalRepo,
            authService = authService,
            idGenerator = idGenerator,
            keyPairService = keyPairService,
            clock = clock
        )
    }

    /*
     * GET JOURNAL TESTS
     */

    @Test
    fun `getJournal retrieves journal`() {
        authService.setCurrentUser(TESTER)

        val journal = testRepo.createJournal(
            id = ID_1,
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id,
            owner = TESTER.id
        )
        val actual = txnHelper.execute { txn -> service.getJournal(txn, journal.id) }

        assertEquals(ID_1, actual.id)
        assertEquals(keyPair.id, actual.keyPairId)
        assertArrayEquals(byteArrayOf(1, 2), actual.content)
    }

    @Test(expected = NotFoundException::class)
    fun `getJournal throws not found`() {
        authService.setCurrentUser(TESTER)
        txnHelper.execute { txn -> service.getJournal(txn, ID_1) }
    }

    @Test(expected = ForbiddenException::class)
    fun `getJournal throws forbidden if user cannot access entity`() {
        authService.setCurrentUser(TESTER)
        val journal = testRepo.createJournal(
            id = ID_1,
            content = byteArrayOf(1),
            keyPairId = keyPair.id,
            owner = "somebody else"
        )
        txnHelper.execute { txn -> service.getJournal(txn, journal.id) }
    }

    /*
     * UPDATE JOURNAL TESTS
     */

    @Test
    fun `updateJournal updates journal`() {
        authService.setCurrentUser(TESTER)
        clock.millis = 123

        val created = testRepo.createJournal(ID_1, keyPair.id, byteArrayOf(1))
        assertNull(created.modified)
        assertArrayEquals(byteArrayOf(1), created.content)

        txnHelper.execute { txn ->
            val req = createJournalUpdateReq(created.id, byteArrayOf(2))
            service.update(txn, req)
        }

        val updated = getJournal(ID_1)
        assertEquals(123, updated.modified.toEpochMilli())
        assertEquals(2, updated.version)
        assertArrayEquals(byteArrayOf(2), updated.content)
    }

    @Test(expected = NotFoundException::class)
    fun `updateJournal that does not exist 404s`() {
        authService.setCurrentUser(TESTER)
        val req = UpdateJournalReq(ID_1, byteArrayOf(1), keyPair.id, Schema.V1_0)
        txnHelper.execute { txn -> service.update(txn, req) }
    }

    @Test(expected = ForbiddenException::class)
    fun `updateJournal throws forbidden if user cannot access journal`() {
        authService.setCurrentUser(TESTER)

        testRepo.createJournal(
            // Owner is "somebody else" but current user is TESTER
            owner = "somebody else",
            id = ID_1,
            content = byteArrayOf(1),
            keyPairId = keyPair.id
        )

        txnHelper.execute { txn ->
            val req = createJournalUpdateReq(ID_1)
            service.update(txn, req)
        }
    }

    @Test(expected = ForbiddenException::class)
    fun `updateJournal throws forbidden if user cannot access keyPair`() {
        authService.setCurrentUser(TESTER)
        testRepo.createJournal(id = ID_1, keyPairId = keyPair.id)

        val aliceKeyPair = testRepo.createKeyPair(id = ID_2, owner = ALICE.id)
        txnHelper.execute { txn ->
            val req = createJournalUpdateReq(ID_1, keyPairId = aliceKeyPair.id)
            service.update(txn, req)
        }
    }

    @Test(expected = NotFoundException::class)
    fun `updateJournal throws not found if keyPair does not exist`() {
        authService.setCurrentUser(TESTER)
        testRepo.createJournal(id = ID_1, keyPairId = keyPair.id)

        txnHelper.execute { txn ->
            val req = createJournalUpdateReq(ID_1, keyPairId = ID_2)
            service.update(txn, req)
        }
    }

    /*
     * CREATE JOURNAL TESTS
     */

    @Test
    fun `createJournal - creates journal`() {
        authService.setCurrentUser(TESTER)
        clock.millis = 101

        val req = createEncryptedEntityReq()
        val created = txnHelper.execute { service.create(it, req) }

        assertArrayEquals(byteArrayOf(1), created.content)
        assertEquals(TESTER.id, created.owner)
        assertEquals(Schema.V1_0, created.schema)
        assertEquals(101, created.created.toEpochMilli())
        assertNull(created.modified)
        assertEquals(1, created.version)
        assertEquals(Schema.V1_0, created.schema)
    }

    @Test(expected = ForbiddenException::class)
    fun `createJournal fails when accessing unowned key pair`() {
        authService.setCurrentUser(ALICE)
        val req = createEncryptedEntityReq()
        txnHelper.execute { service.create(it, req) }
    }

    @Test(expected = NotFoundException::class)
    fun `createJournal - fails when key pair does not exist`() {
        authService.setCurrentUser(TESTER)
        val req = createEncryptedEntityReq(keyPairId = ID_2)
        txnHelper.execute { service.create(it, req) }
    }

    @Test
    fun `createJournal can be getJournald`() {
        authService.setCurrentUser(TESTER)

        val req = createEncryptedEntityReq()
        val created = txnHelper.execute { service.create(it, req) }
        val got = getJournal(created.id)
        assertEquals(created, got)
    }

    private fun createJournalUpdateReq(
        id: String,
        content: ByteArray = byteArrayOf(1),
        keyPairId: String = keyPair.id,
        schema: Schema = Schema.V1_0
    ): UpdateJournalReq {
        return UpdateJournalReq(
            journalId = id,
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

    private fun getJournal(id: String): JournalRecord {
        return txnHelper.execute { txn -> service.getJournal(txn, id) }
    }

    companion object {
        private val ID_1 = IdSerializer.serialize(1)
        private val ID_2 = IdSerializer.serialize(2)
    }
}
