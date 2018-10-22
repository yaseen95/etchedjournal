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
import org.hamcrest.Matchers.isIn
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
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
        const val ENTRIES_PATH = "/api/v1/entries"
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
        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(0)))

        // Create an etch and check
        val e = createEtch("abc")

        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches"))
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

        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches/${e.id}"))
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
        mockMvc.perform(get("$ENTRIES_PATH/${UUID.randomUUID()}/etches"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch with entry does not exist`() {
        // Use a valid etch id but not a valid entry id
        val e = createEtch("Etch with id")

        mockMvc.perform(get("$ENTRIES_PATH/${UUID.randomUUID()}/etches/${e.id}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch 404 not found`() {
        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches/${UUID.randomUUID()}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches for entry by other user is forbidden`() {
        val otherUserEntry = createEntry(content = "content", userId = "abc")

        mockMvc.perform(get("$ENTRIES_PATH/${otherUserEntry.id}/etches"))
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
            post("$ENTRIES_PATH/${entry.id}/etches/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(etchRequest)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$[0].content", `is`("YWJj")))
            .andExpect(jsonPath("\$[0].id", UUID_MATCHER))
            .andExpect(jsonPath("\$[0].timestamp", TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("\$[0].owner", `is`(TestAuthService.TESTER_USER_ID)))
            .andExpect(jsonPath("\$[0].ownerType", `is`("USER")))

        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
    }

    @Test
    fun `POST etch not authenticated`() {
        mockMvc.perform(
            post("$ENTRIES_PATH/${entry.id}/etches")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch with empty payload`() {
        mockMvc.perform(
            post("$ENTRIES_PATH/${entry.id}/etches")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
            .andExpect(status().isBadRequest)
            .andReturn()
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch with missing keys`() {
        val completePayload = mapOf(
            "content" to "YWJj",
            "owner" to TestAuthService.TESTER_USER_ID,
            "ownerType" to "USER"
        )
        val errorMessages = completePayload.keys
            .flatMap {
                listOf("Field '$it' may not be null", "Cannot supply null for key '$it'")
            }

        val requestPayload = mutableMapOf<String, Any>()
        // Iterate over the keys and build the payload until it becomes valid
        for ((key, value) in completePayload) {
            // We post a list of etches
            val payload = listOf(requestPayload)
            val content = testUtils.asJson(payload)

            mockMvc.perform(
                post("$ENTRIES_PATH/${entry.id}/etches")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("\$.message", isIn(errorMessages)))

            requestPayload[key] = value
        }

        // TODO: Do we use 201 HTTP created code?
        // Payload is valid now, this next post should work fine
        mockMvc.perform(
            post("$ENTRIES_PATH/${entry.id}/etches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUtils.asJson(listOf(requestPayload)))
        )
            .andExpect(status().isOk)
            .andExpect(content().json(
                """
                    [
                        {
                            "content": "YWJj",
                            "owner": "${TestAuthService.TESTER_USER_ID}",
                            "ownerType": "USER"
                        }
                    ]
                    """

            ))
            .andExpect(jsonPath("\$[0].id").value(UUID_MATCHER))
            .andExpect(jsonPath("\$[0].timestamp").value(TIMESTAMP_RECENT_MATCHER))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch with id raises error`() {
        // User should not POST an entry with an ID field.
        val e = EtchEntity(
            id = UUID.randomUUID(),
            content = ByteArray(1),
            entry = null,
            owner = "owner",
            ownerType = OwnerType.USER
        )

        val etches = listOf(e)

        mockMvc.perform(
            post("$ENTRIES_PATH/${entry.id}/etches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUtils.asJson(etches))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("\$.message", `is`("Must not supply id when creating an etch")))
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
