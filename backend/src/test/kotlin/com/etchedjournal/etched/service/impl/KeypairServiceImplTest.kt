package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.repository.KeypairRepository
import com.etchedjournal.etched.service.AuthService
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argThat
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import java.time.Instant
import java.util.UUID

class KeypairServiceImplTest {

    private lateinit var keypairServiceImpl: KeypairServiceImpl
    private lateinit var keypairRepository: KeypairRepository
    private lateinit var authService: AuthService

    @Before
    fun setup() {
        keypairRepository = mock()
        authService = mock()
        keypairServiceImpl = KeypairServiceImpl(
            keypairRepository = keypairRepository,
            authService = authService
        )

        whenever(authService.getUserId()).thenReturn("user1")
    }

    @Test
    fun `create keypair saves to database`() {
        val pubKey = byteArrayOf(1, 2, 3)
        val privKey = byteArrayOf(4, 5, 6)

        val keypair = KeypairEntity(
            id = UUID(1, 1),
            timestamp = Instant.EPOCH,
            publicKey = pubKey,
            privateKey = privKey,
            owner = "user1",
            ownerType = OwnerType.USER
        )

        whenever(keypairRepository.save(argThat<KeypairEntity> {
            publicKey.contentEquals(pubKey)
                && privateKey.contentEquals(privKey)
                // Should pull the user from the auth service
                && owner == "user1"
                && ownerType == OwnerType.USER
        })).thenReturn(keypair)

        keypairServiceImpl.createKeypair(publicKey = pubKey, privateKey = privKey)
        verify(keypairRepository, times(1)).save(any<KeypairEntity>())
    }

    @Test
    fun getUserKeypairs() {
        val pubKey = byteArrayOf(1, 2, 3)
        val privKey = byteArrayOf(4, 5, 6)

        val keypair1 = KeypairEntity(
            id = UUID(1, 1),
            timestamp = Instant.EPOCH,
            publicKey = pubKey,
            privateKey = privKey,
            owner = "user1",
            ownerType = OwnerType.USER
        )
        val keypair2 = keypair1.copy(
            id = UUID(2, 2),
            publicKey = byteArrayOf(1),
            privateKey = byteArrayOf(2)
        )

        whenever(keypairRepository.findByOwner("user1"))
            .thenReturn(listOf(keypair1, keypair2))

        val keypairs = keypairServiceImpl.getUserKeypairs()

        assertEquals(2, keypairs.size)
        assertEquals("user1", keypairs[0].owner)
        assertEquals("user1", keypairs[1].owner)
        assertEquals(UUID(1, 1), keypairs[0].id)
        assertEquals(UUID(2, 2), keypairs[1].id)

        verify(keypairRepository, times(1)).findByOwner("user1")
        verify(keypairRepository, times(1)).findByOwner(any())
    }
}
