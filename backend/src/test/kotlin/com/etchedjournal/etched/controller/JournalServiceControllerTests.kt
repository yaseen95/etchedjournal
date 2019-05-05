package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ID_LENGTH_MATCHER
import com.etchedjournal.etched.INVALID_ETCHED_IDS
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService.Companion.ALICE
import com.etchedjournal.etched.TestAuthService.Companion.TESTER
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.TestRepoUtils.Companion.ID_1
import com.etchedjournal.etched.TestRepoUtils.Companion.ID_2
import com.etchedjournal.etched.isNull
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.repository.JournalRepository
import com.etchedjournal.etched.repository.TxnHelper
import com.etchedjournal.etched.utils.id.IdSerializer
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertEquals
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
class JournalServiceControllerTests {

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var journalRepo: JournalRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Autowired
    private lateinit var txnHelper: TxnHelper

    private lateinit var mockMvc: MockMvc
    private lateinit var keyPair: KeyPair

    @Before
    fun setup() {
        testRepoUtils.cleanDb()

        keyPair = testRepoUtils.createKeyPair(
            id = "keyPair1",
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )

        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET journals - returns empty list when no journals`() {
        // Precondition - no journals should exist
        val result = txnHelper.execute { txn ->
            journalRepo.fetchByOwner(txn, TESTER_USER_ID).size
        }
        assertEquals(0, result)

        mockMvc.perform(get(JOURNALS_URL))
            .andExpect(status().isOk)
            .andExpect(content().json("[]", true))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET journals - returns created journal`() {
        val j = testRepoUtils.createJournal(
            id = "j1",
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id
        )

        mockMvc.perform(get(JOURNALS_URL))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].id", `is`(j.id)))
            .andExpect(jsonPath("$[0].created", `is`(0)))
            .andExpect(jsonPath("$[0].modified", isNull()))
            .andExpect(jsonPath("$[0].content", `is`("AQI=")))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[0].keyPairId", `is`(keyPair.id)))
            .andExpect(jsonPath("$[0].version", `is`(1)))
            .andExpect(jsonPath("$[0].schema", `is`("V1_0")))
            .andExpect(jsonPath("$[0].*", hasSize<Any>(9)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET journal - returns created journal`() {
        val j = testRepoUtils.createJournal(
            id = "j1",
            content = byteArrayOf(1, 2),
            keyPairId = keyPair.id
        )

        mockMvc.perform(get("$JOURNALS_URL/${j.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", `is`(j.id)))
            .andExpect(jsonPath("$.created", `is`(0)))
            .andExpect(jsonPath("$.modified", isNull()))
            .andExpect(jsonPath("$.content", `is`("AQI=")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
            .andExpect(jsonPath("$.keyPairId", `is`(keyPair.id)))
            .andExpect(jsonPath("$.version", `is`(1)))
            .andExpect(jsonPath("$.schema", `is`("V1_0")))
            .andExpect(jsonPath("$.*", hasSize<Any>(9)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET journal - invalid etched id returns 400`() {
        for (id in INVALID_ETCHED_IDS) {
            mockMvc.perform(get("$JOURNALS_URL/$id"))
                .andExpect(status().isBadRequest)
                .andExpect(content().json("""{"message": "Invalid value '$id' for journalId"}"""))
        }
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST journal - creates a journal`() {
        // Precondition - no journals should exist
        val result = txnHelper.execute { journalRepo.fetchByOwner(it, TESTER_USER_ID).size }
        assertEquals(0, result)

        mockMvc.perform(
            post(JOURNALS_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "content": "abcd",
                        "keyPairId": "${keyPair.id}",
                        "schema": "V1_0"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(ID_LENGTH_MATCHER))
            .andExpect(jsonPath("$.created").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$.modified", isNull()))
            .andExpect(jsonPath("$.content", `is`("abcd")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
            .andExpect(jsonPath("$.schema", `is`("V1_0")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `updateJournal - updates journal content`() {
        val journal = createJournal()

        mockMvc.perform(
            post("$JOURNALS_URL/${journal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "content": "abcd",
                        "keyPairId": "${keyPair.id}",
                        "schema": "V1_0"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", `is`(ID_1)))
            .andExpect(jsonPath("$.version", `is`(2)))
            .andExpect(jsonPath("$.modified").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$.content", `is`("abcd")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `updateJournal - update for other users journal is forbidden`() {
        val aliceKeyPair = testRepoUtils.createKeyPair(id = ID_2, owner = ALICE.id)
        val aliceJournal = createJournal(owner = ALICE.id, keyPairId = aliceKeyPair.id)
        mockMvc.perform(
            post("$JOURNALS_URL/${aliceJournal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "content": "abcd",
                        "keyPairId": "${keyPair.id}",
                        "schema": "V1_0"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isForbidden)
            .andExpect(content().json("""{"message": "Forbidden"}""", true))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `updateJournal - updated key pair belongs to another user`() {
        val aliceKeyPair = testRepoUtils.createKeyPair(id = ID_2)
        val aliceJournal = createJournal(owner = ALICE.id, keyPairId = aliceKeyPair.id)
        mockMvc.perform(
            post("$JOURNALS_URL/${aliceJournal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "content": "abcd",
                        "keyPairId": "${aliceKeyPair.id}",
                        "schema": "V1_0"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `updateJournal - update for non existent key pair 404s`() {
        val journal = createJournal()
        mockMvc.perform(
            post("$JOURNALS_URL/${journal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "content": "abcd",
                        "keyPairId": "${IdSerializer.serialize(24)}",
                        "schema": "V1_0"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isNotFound)
    }

    private fun createJournal(
        id: String = ID_1,
        owner: String = TESTER.id,
        keyPairId: String = keyPair.id
    ): JournalRecord {
        return testRepoUtils.createJournal(id = id, owner = owner, keyPairId = keyPairId)
    }

    companion object {
        private const val JOURNALS_URL = "/api/v1/journals"
    }
}
