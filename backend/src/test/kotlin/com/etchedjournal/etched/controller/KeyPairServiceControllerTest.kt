package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ID_LENGTH_MATCHER
import com.etchedjournal.etched.INVALID_ETCHED_IDS
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.utils.PgpUtilsTest
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
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

@RunWith(SpringRunner::class)
@SpringBootTest
@ContextConfiguration(classes = [TestConfig::class])
class KeyPairServiceControllerTest {

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var testRepo: TestRepoUtils

    @Before
    fun setup() {
        testRepo.cleanDb()

        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET keyPairs`() {
        testRepo.createKeyPair(
            id = "k1",
            publicKey = byteArrayOf(1, 2, 3, 4),
            privateKey = byteArrayOf(5, 6, 7, 8)
        )
        testRepo.createKeyPair(
            id = "k2",
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(5, 6)
        )

        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(2)))

            .andExpect(jsonPath("$[0].*", hasSize<Any>(9)))
            .andExpect(jsonPath("$[0].id", `is`("k1".padEnd(11, '0'))))
            .andExpect(jsonPath("$[0].created", `is`(0)))
            .andExpect(jsonPath("$[0].publicKey", `is`("AQIDBA==")))
            .andExpect(jsonPath("$[0].privateKey", `is`("BQYHCA==")))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[0].salt", `is`("salt")))
            .andExpect(jsonPath("$[0].iterations", `is`(1)))
            .andExpect(jsonPath("$[0].version", `is`(1)))

            .andExpect(jsonPath("$[1].id", `is`("k2".padEnd(11, '0'))))
            .andExpect(jsonPath("$[1].created", `is`(0)))
            .andExpect(jsonPath("$[1].publicKey", `is`("AQI=")))
            .andExpect(jsonPath("$[1].privateKey", `is`("BQY=")))
            .andExpect(jsonPath("$[1].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[1].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[1].salt", `is`("salt")))
            .andExpect(jsonPath("$[1].iterations", `is`(1)))
            .andExpect(jsonPath("$[1].version", `is`(1)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET keyPairs - no keys`() {
        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isOk)
            .andExpect(content().json("[]", true))
    }

    @Test
    fun `GET keyPairs - unauthenticated`() {
        mockMvc.perform(get("/api/v1/keypairs"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET key pair`() {
        val keyPair = testRepo.createKeyPair(
            id = "k1",
            publicKey = byteArrayOf(1, 2, 3, 4),
            privateKey = byteArrayOf(5, 6, 7, 8)
        )

        mockMvc.perform(get("/api/v1/keypairs/${keyPair.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", `is`(keyPair.id)))
            .andExpect(jsonPath("$.created", `is`(0)))
            .andExpect(jsonPath("$.publicKey", `is`("AQIDBA==")))
            .andExpect(jsonPath("$.privateKey", `is`("BQYHCA==")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
            .andExpect(jsonPath("$.salt", `is`("salt")))
            .andExpect(jsonPath("$.iterations", `is`(1)))
            .andExpect(jsonPath("$.version", `is`(1)))
            .andExpect(jsonPath("$.*", hasSize<Any>(9)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET keyPair - not found`() {
        mockMvc.perform(get("/api/v1/keypairs/foobarbaz10"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET keyPair - belongs to other user is forbidden`() {
        val keyPair = testRepo.createKeyPair(id = "k1", owner = "somebody else")

        mockMvc.perform(get("/api/v1/keypairs/${keyPair.id}"))
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
    fun `GET keyPair - unauthenticated`() {
        val keyPair = testRepo.createKeyPair(id = "k1")

        mockMvc.perform(get("/api/v1/keypairs/${keyPair.id}"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET keyPair - invalid etched id returns 400`() {
        for (id in INVALID_ETCHED_IDS) {
            mockMvc.perform(get("/api/v1/keypairs/$id"))
                .andExpect(status().isBadRequest)
                .andExpect(content().json("""{"message": "Invalid value '$id' for keypairId"}"""))
        }
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(9)))
            .andExpect(jsonPath("$.id").value(ID_LENGTH_MATCHER))
            .andExpect(jsonPath("$.created").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$.publicKey").value(publicKey))
            .andExpect(jsonPath("$.privateKey").value("AQIDBA=="))
            .andExpect(jsonPath("$.owner").value(TESTER_USER_ID))
            .andExpect(jsonPath("$.ownerType").value("USER"))
            .andExpect(jsonPath("$.salt", `is`("salt")))
            .andExpect(jsonPath("$.iterations", `is`(1)))
            .andExpect(jsonPath("$.version", `is`(1)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs - 2048 bit RSA key`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.publicKey").value(publicKey))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs - 4096 bit RSA key`() {
        val publicKey = PgpUtilsTest.TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.publicKey").value(publicKey))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs - public key invalid format`() {
        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "!@#$%^&*()",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
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
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs - private key invalid format`() {
        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "privateKey": "!@#$%^&*()",
                        "publicKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
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
    fun `POST keyPairs - unauthenticated`() {
        val publicKey = PgpUtilsTest.ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
                    }
                    """.trimIndent()
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isUnauthorized)
            .andExpect(content().string(""))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST keyPairs - public key has incorrect user id`() {
        // user id is "abcdef <abcdef@user.etchedjournal.com>" for this key
        // But we expect the id to use the uuids not the usernames
        val publicKey = PgpUtilsTest.ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", "")

        mockMvc.perform(
            post("/api/v1/keypairs")
                .content(
                    """
                    {
                        "publicKey": "$publicKey",
                        "privateKey": "AQIDBA==",
                        "salt": "salt",
                        "iterations": 1
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
}
