package com.etchedjournal.etched.repository

import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.jooq.generated.tables.daos.KeyPairDao
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
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
class KeyPairRepositoryTest {

    @Autowired
    private lateinit var dao: KeyPairDao

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
            0
        )
        dao.insert(keyPair)

        val retrieved = dao.findById("abcdefghijk")!!
        assertEquals("abcdefghijk", retrieved.id)
        assertEquals(Instant.EPOCH, retrieved.timestamp)
        assertArrayEquals(byteArrayOf(1), retrieved.publicKey)
        assertArrayEquals(byteArrayOf(2), retrieved.privateKey)
        assertEquals("owner", retrieved.owner)
        assertEquals(OwnerType.USER, retrieved.ownerType)
    }
}
