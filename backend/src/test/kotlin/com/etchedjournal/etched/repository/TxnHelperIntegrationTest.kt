package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.Tables
import com.etchedjournal.etched.models.jooq.generated.tables.records.KeyPairRecord
import com.etchedjournal.etched.service.exception.ClientException
import com.etchedjournal.etched.utils.id.IdSerializer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
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
class TxnHelperIntegrationTest {

    @Autowired
    private lateinit var txnHelper: TxnHelper
    @Autowired
    private lateinit var testRepo: TestRepoUtils

    @Before
    fun setup() {
        testRepo.cleanDb()
    }

    @Test
    fun `execute commits txn`() {
        txnHelper.execute { txn ->
            assertEquals(0, txn.dslCtx.fetchCount(Tables.KEY_PAIR))
            createKeyPair(txn, ID_1).insert()
        }

        txnHelper.execute { txn ->
            val existing = txn.dslCtx
                .selectFrom(Tables.KEY_PAIR)
                .where(Tables.KEY_PAIR.ID.eq(ID_1))
                .fetchOne()
            assertNotNull(existing)
        }
    }

    @Test
    fun `operations during txn are not visible to other txn`() {
        txnHelper.execute { txn1 ->
            assertEquals(0, txn1.dslCtx.fetchCount(Tables.KEY_PAIR))

            createKeyPair(txn1, ID_1).insert()
            txnHelper.execute { txn2 ->
                // Should still be 0 because outer transaction has not completed
                assertEquals(0, txn2.dslCtx.fetchCount(Tables.KEY_PAIR))
            }
        }

        txnHelper.execute { txn ->
            assertEquals(1, txn.dslCtx.fetchCount(Tables.KEY_PAIR))
        }
    }

    @Test
    fun `client exception thrown during test rolls back txn`() {
        try {
            txnHelper.execute { txn ->
                createKeyPair(txn, ID_1).insert()
                throw ClientException(message = "foobar")
            }
            fail()
        } catch (expected: ClientException) {
        }

        // No records should exist in db because it would have been rolled back
        txnHelper.execute { txn ->
            assertEquals(0, txn.dslCtx.fetchCount(Tables.KEY_PAIR))
        }
    }

    @Test
    fun `runtime exception thrown during test rolls back txn`() {
        try {
            txnHelper.execute { txn ->
                createKeyPair(txn, ID_1).insert()
                throw RuntimeException()
            }
            fail()
        } catch (expected: RuntimeException) {
        }

        // No records should exist in db because it would have been rolled back
        txnHelper.execute { txn ->
            assertEquals(0, txn.dslCtx.fetchCount(Tables.KEY_PAIR))
        }
    }

    private fun createKeyPair(txn: Transaction, id: String): KeyPairRecord {
        val keyPair = txn.dslCtx.newRecord(Tables.KEY_PAIR)
        keyPair.id = id
        keyPair.setPrivateKey(1)
        keyPair.setPublicKey(2)
        keyPair.iterations = 10
        keyPair.salt = "salt"
        keyPair.owner = "owner"
        keyPair.ownerType = OwnerType.USER
        keyPair.created = Instant.EPOCH
        return keyPair
    }

    companion object {
        private val ID_1 = IdSerializer.serialize(1)
        private val ID_2 = IdSerializer.serialize(2)
    }
}
