package com.etchedjournal.etched.controller

import com.etchedjournal.etched.ABC_BASE_64_ENCODED
import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestUtils
import com.etchedjournal.etched.UUID_MATCHER
import com.etchedjournal.etched.models.OwnerType
import com.etchedjournal.etched.models.entity.EntryEntity
import com.etchedjournal.etched.models.entity.EtchEntity
import com.etchedjournal.etched.repository.EntryRepository
import com.etchedjournal.etched.repository.EtchRepository
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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
import java.util.Base64
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

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var entryRepository: EntryRepository

    @Autowired
    private lateinit var etchRepository: EtchRepository

    @Autowired
    private lateinit var testUtils: TestUtils

    companion object {
        const val ETCHES_PATH = "/api/v1/etches"
        val logger: Logger = LoggerFactory.getLogger(EtchServiceControllerTests::class.java)
    }

    @Before
    fun setup() {

        entry = createEntry("test entry", TestAuthService.TESTER_USER_ID)

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
        val e = createEtch("abc")

        mockMvc.perform(get("$ETCHES_PATH?entryId=${entry.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].content", `is`(ABC_BASE_64_ENCODED)))
            .andExpect(jsonPath("$[0].id", `is`(e.id.toString())))
            .andExpect(jsonPath("$[0].timestamp", `is`(1000)))
            .andExpect(jsonPath("$[0].entry").doesNotExist())
            .andExpect(jsonPath("$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch by ID`() {
        // Create an etch and check
        val e = createEtch("abc")

        mockMvc.perform(get("$ETCHES_PATH/${e.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.content", `is`(ABC_BASE_64_ENCODED)))
            .andExpect(jsonPath("\$.id", `is`(e.id.toString())))
            .andExpect(jsonPath("\$.timestamp", `is`(1000)))
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
        val otherUserEntry = createEntry(content = "content", userId = "abc")

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
            .andExpect(jsonPath("\$[0].id", UUID_MATCHER))
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

    private fun createEntry(
        content: String,
        userId: String,
        created: Instant? = null
    ): EntryEntity {
        val e = EntryEntity(
            id = null,
            timestamp = created ?: Instant.ofEpochSecond(1),
            owner = userId,
            ownerType = OwnerType.USER,
            content = Base64.getEncoder().encode(content.toByteArray())
        )
        return entryRepository.save(e)
    }

    private fun createEtch(content: String): EtchEntity {
        val etch = EtchEntity(
            id = null,
            timestamp = Instant.ofEpochSecond(1),
            content = Base64.getEncoder().encode(content.toByteArray()),
            entry = entry,
            owner = TestAuthService.TESTER_USER_ID,
            ownerType = OwnerType.USER
        )
        return etchRepository.save(etch)
    }
}
