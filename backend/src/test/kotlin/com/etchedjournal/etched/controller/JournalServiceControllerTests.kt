package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TIMESTAMP_RECENT_MATCHER
import com.etchedjournal.etched.TestAuthService.Companion.TESTER_USER_ID
import com.etchedjournal.etched.TestConfig
import com.etchedjournal.etched.TestRepoUtils
import com.etchedjournal.etched.UUID_MATCHER
import com.etchedjournal.etched.repository.JournalRepository
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertEquals
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
import javax.transaction.Transactional
import javax.ws.rs.core.MediaType

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class JournalServiceControllerTests {

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var journalRepo: JournalRepository

    @Autowired
    private lateinit var testRepoUtils: TestRepoUtils

    private lateinit var mockMvc: MockMvc

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
    fun `GET journals - creates default when no journals`() {
        // Precondition - no journals should exist
        assertEquals(0, journalRepo.findByOwner(TESTER_USER_ID).toList().size)

        mockMvc.perform(get(JOURNALS_URL))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            // content is empty for the default journal
            .andExpect(jsonPath("$[0].content", `is`("")))
            .andExpect(jsonPath("$[0].default", `is`(true)))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].id").value(UUID_MATCHER))
            .andExpect(jsonPath("$[0].timestamp").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[0].*", hasSize<Any>(6)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET journals - returns created journal`() {
        val j = testRepoUtils.createJournal(content = byteArrayOf(1, 2))

        mockMvc.perform(get(JOURNALS_URL))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(1)))
            .andExpect(jsonPath("$[0].*", hasSize<Any>(6)))
            .andExpect(jsonPath("$[0].id", `is`(j.id!!.toString())))
            .andExpect(jsonPath("$[0].timestamp", `is`(0)))
            .andExpect(jsonPath("$[0].content", `is`("AQI=")))
            .andExpect(jsonPath("$[0].owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$[0].ownerType", `is`("USER")))
            .andExpect(jsonPath("$[0].default", `is`(false)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `GET journal - returns created journal`() {
        val j = testRepoUtils.createJournal(content = byteArrayOf(1, 2))

        mockMvc.perform(get("$JOURNALS_URL/${j.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(6)))
            .andExpect(jsonPath("$.id", `is`(j.id!!.toString())))
            .andExpect(jsonPath("$.timestamp", `is`(0)))
            .andExpect(jsonPath("$.content", `is`("AQI=")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
            .andExpect(jsonPath("$.default", `is`(false)))
    }

    @Test
    @WithMockUser(username = "tester", roles = ["user"])
    fun `POST journal - creates a journal`() {
        // Precondition - no journals should exist
        assertEquals(0, journalRepo.findByOwner(TESTER_USER_ID).toList().size)

        mockMvc.perform(
            post(JOURNALS_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "content": "abcd" }""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.*", hasSize<Any>(6)))
            .andExpect(jsonPath("$.id").value(UUID_MATCHER))
            .andExpect(jsonPath("$.timestamp").value(TIMESTAMP_RECENT_MATCHER))
            .andExpect(jsonPath("$.content", `is`("abcd")))
            .andExpect(jsonPath("$.owner", `is`(TESTER_USER_ID)))
            .andExpect(jsonPath("$.ownerType", `is`("USER")))
            .andExpect(jsonPath("$.default", `is`(false)))
    }

    companion object {
        private const val JOURNALS_URL = "/api/v1/journals"
    }
}
