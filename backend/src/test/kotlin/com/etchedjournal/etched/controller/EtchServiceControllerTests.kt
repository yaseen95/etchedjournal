package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ID_LENGTH_MATCHER
import com.etchedjournal.etched.INVALID_ETCHED_IDS
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
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
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EtchServiceControllerTests {

    private lateinit var mockMvc: MockMvc
    private lateinit var entry: Entry
    private lateinit var journal: Journal
    private lateinit var keyPair: KeyPair

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Before
    fun setup() {
        keyPair = testRepoUtils.createKeyPair(
            id = "keyPair1",
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )

        journal = testRepoUtils.createJournal(
            id = "journal1",
            content = byteArrayOf(1, 2, 3, 4),
            keyPairId = keyPair.id
        )
        entry = testRepoUtils.createEntry(
            id = "entry1",
            journal = journal,
            content = byteArrayOf(5, 6, 7, 8),
            keyPairId = keyPair.id
        )

        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET etches`() {
        // Entry doesn't have any etches yet
        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(0)))

        // Create an etch and check
        val e = testRepoUtils.createEtch(
            id = "e1",
            entry = entry,
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id
        )

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].content", `is`("AQI=")))
            .andExpect(jsonPath("$[0].id", `is`(e.id)))
            .andExpect(jsonPath("$[0].created", `is`(0)))
            .andExpect(jsonPath("$[0].entry").doesNotExist())
            .andExpect(jsonPath("$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET etch by ID`() {
        // Create an etch and check
        val e = testRepoUtils.createEtch(
            id = "e1",
            entry = entry,
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id
        )

        mockMvc.perform(get("$ETCHES_PATH/${e.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", `is`("AQI=")))
            .andExpect(jsonPath("$.id", `is`(e.id)))
            .andExpect(jsonPath("$.created", `is`(0)))
            .andExpect(jsonPath("$.entry").doesNotExist())
            .andExpect(jsonPath("$.owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET etches with entry does not exist`() {
        mockMvc.perform(get("$ETCHES_PATH?entryId=foobarbaz10"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET etch 404 not found`() {
        mockMvc.perform(get("$ETCHES_PATH/foobarbaz10"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET etches for entry by other user is forbidden`() {
        val otherUserEntry = testRepoUtils.createEntry(
            id = "e1",
            journal = journal,
            content = byteArrayOf(),
            owner = "abc",
            keyPairId = keyPair.id
        )

        mockMvc.perform(get("$ETCHES_PATH?entryId=${otherUserEntry.id}"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("\$.message", `is`("Forbidden")))
    }

    @Test
    @WithMockUser
    fun `GET etches - invalid etched id returns 400`() {
        for (id in INVALID_ETCHED_IDS) {
            mockMvc.perform(get("$ETCHES_PATH/$id"))
                .andExpect(status().isBadRequest)
                .andExpect(content().json("""{"message": "Invalid value '$id' for etchId"}"""))
        }
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch`() {
        val etchRequest =
            """
            [
                {
                    "content": "YWJj",
                    "keyPairId": "${keyPair.id}",
                    "schema": "V1_0"
                }
            ]
            """

        mockMvc.perform(
            post("$ETCHES_PATH?entryId=${entry.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(etchRequest)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].content", `is`("YWJj")))
            .andExpect(jsonPath("$[0].id", ID_LENGTH_MATCHER))
            .andExpect(jsonPath("$[0].created", TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[0].keyPairId", `is`(keyPair.id)))
            .andExpect(jsonPath("$[0].entryId", `is`(entry.id)))
            .andExpect(jsonPath("$[0].version", `is`(1)))
            .andExpect(jsonPath("$[0].schema", `is`("V1_0")))
            .andExpect(jsonPath("$[0].*", hasSize<Any>(9)))

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch - multiple etches`() {
        val etchRequest =
            """
            [
                {
                    "content": "YWJj",
                    "keyPairId": "${keyPair.id}",
                    "schema": "V1_0"
                },
                {
                    "content": "AQI=",
                    "keyPairId": "${keyPair.id}",
                    "schema": "V1_0"
                }
            ]
            """

        mockMvc.perform(
            post("$ETCHES_PATH?entryId=${entry.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(etchRequest)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(2)))
            .andExpect(jsonPath("$[0].content", `is`("YWJj")))
            .andExpect(jsonPath("$[0].id", ID_LENGTH_MATCHER))
            .andExpect(jsonPath("$[0].created", TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))

            .andExpect(jsonPath("$[1].content", `is`("AQI=")))
            .andExpect(jsonPath("$[1].id", ID_LENGTH_MATCHER))
            .andExpect(jsonPath("$[1].created", TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$[1].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[1].ownerType", `is`("USER")))

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(2)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch - not authorised for entry`() {
        val otherUserEntry = testRepoUtils.createEntry(
            id = "entry2",
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id,
            owner = "somebody else",
            journal = journal
        )

        val entryRequest =
            """
            [
                {
                    "content": "abcd",
                    "keyPairId": "${keyPair.id}",
                    "schema": "V1_0"
                }
            ]
            """
        mockMvc.perform(
            post("$ETCHES_PATH?entryId=${otherUserEntry.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch - not authorised for key pair`() {
        // User should not be able to post an etch that references a key pair belonging to
        // another user
        val otherUserKeyPair = testRepoUtils.createKeyPair(
            id = "kp2",
            publicKey = byteArrayOf(),
            privateKey = byteArrayOf(),
            owner = "foobar"
        )

        val entryRequest =
            """
            [
                {

                    "content": "abcd",
                    "keyPairId": "${otherUserKeyPair.id}",
                    "schema": "V1_0"
                }
            ]
            """
        mockMvc.perform(
            post("$ETCHES_PATH?entryId=${entry.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `POST etch not authenticated`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch with empty payload`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .param("entryId", entry.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("[{}]")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'content'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch with keyPairId missing`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .param("entryId", entry.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""[ { "content": "AQI=", "schema": "V1_0" } ] """)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'keyPairId'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch with content missing`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .param("entryId", entry.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""[ { "keyPairId": "${keyPair.id}", "schema": "V1_0" } ] """)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'content'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etch with schema missing`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .param("entryId", entry.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""[ { "keyPairId": "${keyPair.id}", "content": "AQI=" } ] """)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'schema'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST etches - fails when referencing different key pairs`() {
        val keyPair2 = testRepoUtils.createKeyPair(id = "kp2")
        val etchRequest =
            """
            [
                {
                    "content": "YWJj",
                    "keyPairId": "${keyPair.id}",
                    "schema": "V1_0"
                },
                {
                    "content": "AQI=",
                    "keyPairId": "${keyPair2.id}",
                    "schema": "V1_0"
                }
            ]
            """

        mockMvc.perform(
            post("$ETCHES_PATH?entryId=${entry.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(etchRequest)
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().json(
                """
                {
                    "message": "Can only create etches for one key pair at a time"
                }
                """.trimIndent(),
                true
            ))
    }

    companion object {
        const val ETCHES_PATH = "/api/v1/etches"
    }
}
