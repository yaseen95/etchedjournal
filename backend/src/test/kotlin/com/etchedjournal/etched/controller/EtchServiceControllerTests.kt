package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.entity.EntryState
import com.etchedjournal.etched.repository.EntryRepository
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.hamcrest.Matchers.nullValue
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
import java.time.Instant
import javax.transaction.Transactional
import javax.ws.rs.core.MediaType

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EtchServiceControllerTests {

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var entryRepository: EntryRepository

    companion object {
        const val ENTRIES_PATH = "/api/v1/entries"
    }

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
    fun `GET entries`() {
        // User doesn't have any entries yet
        mockMvc.perform(get(ENTRIES_PATH))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$", hasSize<Any>(0)))

        // Create an entry and check
        createEntry("Entry title", TestAuthService.TESTER_USER_ID)

        mockMvc.perform(get(ENTRIES_PATH))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$", hasSize<Any>(1)))
                .andExpect(jsonPath("$[0].title", `is`("Entry title")))
                .andExpect(jsonPath("$[0].id").isNumber)
                .andExpect(jsonPath("$[0].created", `is`(1000)))
                .andExpect(jsonPath("$[0].finished", nullValue()))
                .andExpect(jsonPath("$[0].state", `is`("CREATED")))
                // These shouldn't be in the payload
                .andExpect(jsonPath("$[0].etches").doesNotExist())
                .andExpect(jsonPath("$[0].getUserId").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET entry by ID`() {
        val e = createEntry("title", TestAuthService.TESTER_USER_ID)

        mockMvc.perform(get("$ENTRIES_PATH/${e.id}"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("\$.title", `is`("title")))
                .andExpect(jsonPath("\$.created", `is`(1000)))
                .andExpect(jsonPath("\$.id", `is`(e.id!!.toInt())))
                .andExpect(jsonPath("\$.state", `is`("CREATED")))
                .andExpect(jsonPath("\$.finished", nullValue()))
                // These shouldn't be in the payload
                .andExpect(jsonPath("\$.etches").doesNotExist())
                .andExpect(jsonPath("\$.getUserId").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET entry by other user is forbidden`() {
        val otherUserEntry = createEntry(title = "title", userId = "abc")

        mockMvc.perform(get("$ENTRIES_PATH/${otherUserEntry.id}"))
                .andExpect(status().isForbidden)
                .andExpect(jsonPath("\$.message", `is`("Forbidden")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET entry 404 not found`() {
        val entryId = 100_000
        mockMvc.perform(get("$ENTRIES_PATH/$entryId"))
                .andExpect(status().isNotFound)
                .andExpect(jsonPath("\$.message", `is`("Unable to find entry with id $entryId")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST entry`() {
        val entryRequest =
                """
            {
                "title": "Entry title"
            }
            """
        mockMvc.perform(
                post(ENTRIES_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(entryRequest)
        )
                .andExpect(status().isOk)
                .andExpect(jsonPath("\$.title", `is`("Entry title")))
                .andExpect(jsonPath("\$.id").isNumber)
                .andExpect(jsonPath("\$.created").isNumber)
                .andExpect(jsonPath("\$.state", `is`("CREATED")))
                .andExpect(jsonPath("\$.userId").doesNotExist())
                .andExpect(jsonPath("\$.entries").doesNotExist())
                .andExpect(jsonPath("\$.finished", nullValue()))
    }

    @Test
    fun `POST entry not authenticated`() {
        val entryRequest =
                """
                {
                    "title": "Entry title"
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
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST entry with empty payload`() {
        val entryRequest = """{}"""
        mockMvc.perform(
                post(ENTRIES_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(entryRequest)
        )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("\$.message", `is`("Title can't be null")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
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
                .andExpect(jsonPath("\$.message", `is`("Title can't be null")))
    }

    fun createEntry(title: String, userId: String, created: Instant? = null): Entry {
        val e = Entry(
                title = title,
                userId = userId,
                id = null,
                created = created ?: Instant.ofEpochSecond(1),
                finished = null,
                etches = mutableListOf(),
                state = EntryState.CREATED
        )
        return entryRepository.save(e)
    }
}
