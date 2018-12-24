package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ID_LENGTH_MATCHER
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.models.entity.JournalEntity
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.UUID
import javax.transaction.Transactional
import javax.ws.rs.core.MediaType

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EtchServiceControllerTests {

    private lateinit var mockMvc: MockMvc
    private lateinit var entry: EntryEntity
    private lateinit var journal: JournalEntity

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    @Before
    fun setup() {
        journal = testRepoUtils.createJournal(id = "journal1", content = byteArrayOf(1, 2, 3, 4))
        entry = testRepoUtils.createEntry("entry1", journal, byteArrayOf(5, 6, 7, 8))

        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches`() {
        // Entry doesn't have any etches yet
        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(0)))

        // Create an etch and check
        val e = testRepoUtils.createEtch(id = "e1", entry = entry, content = byteArrayOf(1, 2))

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].content", `is`("AQI=")))
            .andExpect(jsonPath("$[0].id", `is`(e.id)))
            .andExpect(jsonPath("$[0].timestamp", `is`(0)))
            .andExpect(jsonPath("$[0].entry").doesNotExist())
            .andExpect(jsonPath("$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch by ID`() {
        // Create an etch and check
        val e = testRepoUtils.createEtch(id = "e1", entry = entry, content = byteArrayOf(1, 2))

        mockMvc.perform(get("$ETCHES_PATH/${e.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.content", `is`("AQI=")))
            .andExpect(jsonPath("\$.id", `is`(e.id)))
            .andExpect(jsonPath("\$.timestamp", `is`(0)))
            .andExpect(jsonPath("\$.entry").doesNotExist())
            .andExpect(jsonPath("\$.owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("\$.ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches with entry does not exist`() {
        mockMvc.perform(get("$ETCHES_PATH?entryId=${UUID.randomUUID()}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch 404 not found`() {
        mockMvc.perform(get("$ETCHES_PATH/${UUID.randomUUID()}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches for entry by other user is forbidden`() {
        val otherUserEntry = testRepoUtils.createEntry(
            id = "e1",
            journal = journal,
            content = byteArrayOf(),
            owner = "abc"
        )

        mockMvc.perform(get("$ETCHES_PATH?entryId=${otherUserEntry.id}"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("\$.message", `is`("Forbidden")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch`() {
        val etchRequest =

            """
            [
                {
                    "content": "YWJj",
                    "owner": "${TestAuthService.TESTER_USER_ID}",
                    "ownerType": "USER"
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
            .andExpect(jsonPath("\$[0].content", `is`("YWJj")))
            .andExpect(jsonPath("\$[0].id", ID_LENGTH_MATCHER))
            .andExpect(jsonPath("\$[0].timestamp", TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("\$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("\$[0].ownerType", `is`("USER")))
            // Should only be the above 5 keys in the json response
            .andExpect(jsonPath("\$[0].*", hasSize<Any>(5)))

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
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
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch with empty payload`() {
        mockMvc.perform(
            post(ETCHES_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
            .andExpect(status().isBadRequest)
            .andReturn()
    }

    companion object {
        const val ETCHES_PATH = "/api/v1/etches"
    }
}
