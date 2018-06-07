package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestAuthService
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestUtils
import com.etchedjournal.etched.entity.Entry
import com.etchedjournal.etched.entity.EntryState
import com.etchedjournal.etched.entity.Etch
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
import javax.transaction.Transactional
import javax.ws.rs.core.MediaType

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class EtchServiceControllerTests {

    private lateinit var mockMvc: MockMvc
    private lateinit var entry: Entry

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
        val e = createEtch("Etch 1")

        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$", hasSize<Any>(1)))
                .andExpect(jsonPath("$[0].content", `is`("Etch 1")))
                .andExpect(jsonPath("$[0].id", `is`(e.id!!.toInt())))
                .andExpect(jsonPath("$[0].contentKey", `is`("contentKey")))
                .andExpect(jsonPath("$[0].contentIv", `is`("contentIv")))
                .andExpect(jsonPath("$[0].keyIv", `is`("keyIv")))
                .andExpect(jsonPath("$[0].ivIv", `is`("ivIv")))
                .andExpect(jsonPath("$[0].position", `is`(1)))
                .andExpect(jsonPath("$[0].timestamp", `is`(1000)))
                .andExpect(jsonPath("$[0].entry").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch by ID`() {
        // Create an etch and check
        val e = createEtch("Etch with id")

        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches/${e.id}"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("\$.content", `is`("Etch with id")))
                .andExpect(jsonPath("\$.id", `is`(e.id!!.toInt())))
                .andExpect(jsonPath("\$.contentKey", `is`("contentKey")))
                .andExpect(jsonPath("\$.contentIv", `is`("contentIv")))
                .andExpect(jsonPath("\$.keyIv", `is`("keyIv")))
                .andExpect(jsonPath("\$.ivIv", `is`("ivIv")))
                .andExpect(jsonPath("\$.position", `is`(1)))
                .andExpect(jsonPath("\$.timestamp", `is`(1000)))
                .andExpect(jsonPath("\$.entry").doesNotExist())
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches with entry does not exist`() {
        mockMvc.perform(get("$ENTRIES_PATH/${1_000_000}/etches"))
                .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch with entry does not exist`() {
        // Use a valid etch id but not a valid entry id
        val e = createEtch("Etch with id")

        mockMvc.perform(get("$ENTRIES_PATH/${1_000_000}/etches/${e.id}"))
                .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etch 404 not found`() {
        mockMvc.perform(get("$ENTRIES_PATH/${entry.id}/etches/${1_000_000}"))
                .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET etches for entry by other user is forbidden`() {
        val otherUserEntry = createEntry(title = "title", userId = "abc")

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
                        "position": 1,
                        "content": "foo",
                        "contentKey": "bar",
                        "contentIv": "baz",
                        "keyIv": "sam",
                        "ivIv": "sepiol"
                    }
                ]
                """
        mockMvc.perform(
                post("$ENTRIES_PATH/${entry.id}/etches/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(etchRequest)
        )
                .andExpect(status().isOk)
                .andExpect(jsonPath("\$[0].position", `is`(1)))
                .andExpect(jsonPath("\$[0].content", `is`("foo")))
                .andExpect(jsonPath("\$[0].contentKey", `is`("bar")))
                .andExpect(jsonPath("\$[0].contentIv", `is`("baz")))
                .andExpect(jsonPath("\$[0].keyIv", `is`("sam")))
                .andExpect(jsonPath("\$[0].ivIv", `is`("sepiol")))
                .andExpect(jsonPath("\$[0].id").isNumber)
                .andExpect(jsonPath("\$[0].timestamp").isNumber)

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
        val completePayload = mapOf<String, Any>(
                "ivIv" to "foo",
                "keyIv" to "bar",
                "contentKey" to "baz",
                "contentIv" to "foobarbaz",
                "content" to "super encrypted etch!",
                "timestamp" to 1000,
                "position" to 1
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
                            "content": "super encrypted etch!",
                            "ivIv": "foo",
                            "keyIv": "bar",
                            "contentKey": "baz",
                            "contentIv": "foobarbaz",
                            "position": 1
                        }
                    ]
                    """

                ))
                .andExpect(jsonPath("\$[0].id").isNumber)
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST etch with id raises error`() {
        // User should not POST an entry with an ID field.
        val e = Etch(
                id = 1_000L,
                position = 1,
                content = "content",
                contentKey = "contentKey",
                contentIv = "contentIv",
                keyIv = "keyIv",
                ivIv = "ivIv",
                entry = null
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

    final fun createEntry(title: String, userId: String, created: Instant? = null): Entry {
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

    fun createEtch(content: String): Etch {
        val etch = Etch(
                id = null,
                timestamp = Instant.ofEpochSecond(1),
                position = 1,
                content = content,
                contentKey = "contentKey",
                contentIv = "contentIv",
                keyIv = "keyIv",
                ivIv = "ivIv",
                entry = entry
        )
        return etchRepository.save(etch)
    }
}
