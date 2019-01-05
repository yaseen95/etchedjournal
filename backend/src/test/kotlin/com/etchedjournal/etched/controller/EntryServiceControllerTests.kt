package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ID_LENGTH_MATCHER
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.entity.JournalEntity
import com.etchedjournal.etched.models.entity.KeypairEntity
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.UUID
import javax.transaction.Transactional

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EntryServiceControllerTests {

    private lateinit var mockMvc: MockMvc
    private lateinit var testJournal: JournalEntity
    private lateinit var testKeyPair: KeypairEntity

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()

        testKeyPair = testRepoUtils.createKeyPair(
            id = "keyPair1",
            publicKey = byteArrayOf(1, 2),
            privateKey = byteArrayOf(3, 4)
        )

        testJournal = testRepoUtils.createJournal(
            id = "journal1",
            content = byteArrayOf(1, 2, 3, 4),
            keyPairId = testKeyPair.id
        )
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET entries`() {
        // User doesn't have any entries yet
        mockMvc.perform(get("$ENTRIES_PATH?journalId=${testJournal.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(0)))

        // Create an entry and check
        val e = testRepoUtils.createEntry("e1", testJournal, byteArrayOf(1, 2), testKeyPair.id)

        mockMvc.perform(get("$ENTRIES_PATH?journalId=${testJournal.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].id", `is`(e.id)))
            .andExpect(jsonPath("$[0].timestamp", `is`(0)))
            .andExpect(jsonPath("$[0].content", `is`("AQI=")))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            // These shouldn't be in the payload
            .andExpect(jsonPath("$[0].etches").doesNotExist())
            .andExpect(jsonPath("$[0].getUserId").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET entry by ID`() {
        val e = testRepoUtils.createEntry("e1", testJournal, byteArrayOf(1, 2), testKeyPair.id)

        mockMvc.perform(get("$ENTRIES_PATH/${e.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.id", `is`(e.id)))
            .andExpect(jsonPath("\$.timestamp", `is`(0)))
            .andExpect(jsonPath("\$.content", `is`("AQI=")))
            .andExpect(jsonPath("\$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("\$.ownerType", `is`("USER")))
            // These shouldn't be in the payload
            .andExpect(jsonPath("\$.etches").doesNotExist())
            .andExpect(jsonPath("\$.getUserId").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET entry by other user is forbidden`() {
        val otherUserEntry = testRepoUtils.createEntry(
            id = "otherEntry",
            journal = testJournal,
            content = byteArrayOf(1, 2),
            owner = "abc",
            keyPairId = testKeyPair.id
        )

        mockMvc.perform(get("$ENTRIES_PATH/${otherUserEntry.id}"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("\$.message", `is`("Forbidden")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `GET entry 404 not found`() {
        val entryId = UUID.randomUUID()
        mockMvc.perform(get("$ENTRIES_PATH/$entryId"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("\$.message", `is`("Unable to find entry with id $entryId")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry`() {
        val entryRequest =
            """
            {
                "content": "abcd",
                "keyPairId": "${testKeyPair.id}"
            }
            """
        mockMvc.perform(
            post("$ENTRIES_PATH?journalId=${testJournal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.id").value(ID_LENGTH_MATCHER))
            .andExpect(jsonPath("\$.timestamp").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("\$.content", `is`("abcd")))
            .andExpect(jsonPath("\$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("\$.ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry - not authorised for journal`() {
        val otherUserJournal = testRepoUtils.createJournal(
            id = "j2",
            content = byteArrayOf(1, 2),
            keyPairId = testKeyPair.id,
            owner = "somebody else"
        )

        val entryRequest =
            """
            {
                "content": "abcd",
                "keyPairId": "${testKeyPair.id}"
            }
            """
        mockMvc.perform(
            post("$ENTRIES_PATH?journalId=${otherUserJournal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            // TODO: Should this return a 404 or a 403?
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry - not authorised for key pair`() {
        // User should not be able to post an entry that references a key pair belonging to
        // another user
        val otherUserKeyPair = testRepoUtils.createKeyPair(
            id = "kp2",
            publicKey = byteArrayOf(),
            privateKey = byteArrayOf(),
            owner = "foobar"
        )

        val entryRequest =
            """
            {
                "content": "abcd",
                "keyPairId": "${otherUserKeyPair.id}"
            }
            """
        mockMvc.perform(
            post("$ENTRIES_PATH?journalId=${testJournal.id}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `POST entry not authenticated`() {
        val entryRequest =
            """
            {
                "content": "Entry content"
            }
            """
        mockMvc.perform(
            post(ENTRIES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry with empty payload`() {
        val entryRequest = """{}"""
        mockMvc.perform(
            post(ENTRIES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'content'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry with keyPairId missing`() {
        mockMvc.perform(
            post(ENTRIES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "content": "AQI=" }""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'keyPairId'")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `POST entry with extra keys in payload`() {

        // We don't fail on unknown properties, so this test doesn't really do much
        // If we want to fail on unknown properties we should enable
        // DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES
        val entryRequest = """{"tomato": "soup", "name": "Sam Sepiol"}"""
        mockMvc.perform(
            post(ENTRIES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(entryRequest)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Cannot supply null for key 'content'")))
    }

    companion object {
        const val ENTRIES_PATH = "/api/v1/entries"
    }
}
