package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestConfig
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import javax.transaction.Transactional

@RunWith(SpringRunner::class)
@SpringBootTest
@Transactional
@ContextConfiguration(classes = [TestConfig::class])
class RedirectControllerTest {

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var webAppCtx: WebApplicationContext

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webAppCtx)
            .build()
    }

    @Test
    fun `redirects non-api path to home page`() {
        val paths = listOf(
            "/journals",
            "/login",
            "/register",
            "/entries"
        )

        for (path in paths) {
            val response = mockMvc.perform(get(path))
                .andExpect(status().isOk)
                .andReturn()
            assertEquals("/", response.response.forwardedUrl)
        }
    }

    @Test
    @WithMockUser(username = "tester", roles = ["USER"])
    fun `does not redirect known page`() {
        val response = mockMvc.perform(get("/api/v1/journals"))
            .andExpect(status().isOk)
            .andReturn()
        assertNull(response.response.forwardedUrl)
    }
}
