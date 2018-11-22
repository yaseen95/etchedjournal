package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.UUID_MATCHER
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.KeypairEntity
import com.etchedjournal.etched.repository.KeypairRepository
import com.etchedjournal.etched.utils.PgpUtilsTest
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.time.Instant
import java.util.UUID
import javax.transaction.Transactional
import javax.ws.rs.core.MediaType

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class KeypairServiceControllerTest {

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var keypairRepository: KeypairRepository

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET keypairs`() {
        createKeypair(
            id = UUID(0, 1),
            publicKey = byteArrayOf(1, 2, 3, 4),
            privateKey = byteArrayOf(5, 6, 7, 8)
        )
        createKeypair(
            id = UUID(0, 2),
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(5, 6)
        )

        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(2)))

            .andExpect(jsonPath("$[0].*", hasSize<Any>(6)))
            .andExpect(jsonPath("$[0].id").value(UUID_MATCHER))
            .andExpect(jsonPath("$[0].timestamp", `is`(0)))
            .andExpect(jsonPath("$[0].publicKey", `is`("AQIDBA==")))
            .andExpect(jsonPath("$[0].privateKey", `is`("BQYHCA==")))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))

            .andExpect(jsonPath("$[1].id").value(UUID_MATCHER))
            .andExpect(jsonPath("$[1].timestamp", `is`(0)))
            .andExpect(jsonPath("$[1].publicKey", `is`("AQI=")))
            .andExpect(jsonPath("$[1].privateKey", `is`("BQY=")))
            .andExpect(jsonPath("$[1].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[1].ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET keypairs - no keys`() {
        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isOk)
            .andExpect(content().json("[]", true))
    }

    @Test
    fun `GET keypairs - unauthenticated`() {
        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET keypair`() {
        val keypair = createKeypair()

        mockMvc.perform(get("/api/v1/keypairs/${keypair.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(6)))
            .andExpect(jsonPath("$.id", `is`(keypair.id.toString())))
            .andExpect(jsonPath("$.timestamp", `is`(0)))
            .andExpect(jsonPath("$.publicKey", `is`("AQIDBA==")))
            .andExpect(jsonPath("$.privateKey", `is`("BQYHCA==")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET keypair - not found`() {
        mockMvc.perform(get("/api/v1/keypairs/00000000-0000-0000-0000-000000000001"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET keypair - belongs to other user is forbidden`() {
        val keypair = createKeypair(owner = UUID(1, 1).toString())

        mockMvc.perform(get("/api/v1/keypairs/${keypair.id}"))
            .andExpect(status().isForbidden)
            .andExpect(content().json(
                """
                {
                    "message": "Forbidden"
                }
                """.trimIndent(),
                true
            ))
    }

    @Test
    fun `GET keypair - unauthenticated`() {
        val keypair = createKeypair()

        mockMvc.perform(get("/api/v1/keypairs/${keypair.id}"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(6)))
            .andExpect(jsonPath("$.id").value(UUID_MATCHER))
            .andExpect(jsonPath("$.timestamp").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$.publicKey").value(publicKey))
            .andExpect(jsonPath("$.privateKey").value("AQIDBA=="))
            .andExpect(jsonPath("$.owner").value(TESTER_USER_ID))
            .andExpect(jsonPath("$.ownerType").value("USER"))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs - 2048 bit RSA key`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.publicKey").value(publicKey))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs - 4096 bit RSA key`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.publicKey").value(publicKey))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs - public key invalid format`() {
        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "!@#$%^&*()",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().json(
                """
                {
                    "message": "'@#$%^&*()' is not a valid value for key 'publicKey'"
                }
                """.trimIndent(),
                true
            ))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs - private key invalid format`() {
        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "privateKey": "!@#$%^&*()",
                        "publicKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().json(
                """
                {
                    "message": "'@#$%^&*()' is not a valid value for key 'privateKey'"
                }
                """.trimIndent(),
                true
            ))
    }

    @Test
    fun `POST keypairs - unauthenticated`() {
        val publicKey = PgpUtilsTest.ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST keypairs - public key has incorrect user id`() {
        // user id is "abcdef <abcdef@user.etchedjournal.com>" for this key
        // But we expect the id to use the uuids not the usernames
        val publicKey = PgpUtilsTest.ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA=="
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isBadRequest)
            // Should we have a better error message?
            .andExpect(content().json(
                """
                {
                    "message": "Bad request"
                }
                """.trimIndent()
            ))
    }

    private fun createKeypair(
        id: UUID = UUID.randomUUID(),
        timestamp: Instant = Instant.EPOCH,
        owner: String = TESTER_USER_ID,
        ownerType: OwnerType = OwnerType.USER,
        publicKey: ByteArray = byteArrayOf(1, 2, 3, 4),
        privateKey: ByteArray = byteArrayOf(5, 6, 7, 8)
    ): KeypairEntity {
        val keypair = KeypairEntity(
            id = id,
            timestamp = timestamp,
            publicKey = publicKey,
            privateKey = privateKey,
            owner = owner,
            ownerType = ownerType
        )
        return keypairRepository.save(keypair)
    }
}
