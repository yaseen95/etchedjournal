package com.etchedjournal.etched.controller

import com.etchedjournal.etched.TestConfig
import org.hamcrest.Matchers.`is`
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

@RunWith(SpringRunner::class)
@SpringBootTest
@ContextConfiguration(classes = [TestConfig::class])
class StatusControllerTests {

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var statusController: StatusController

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(statusController)
            .build()
    }

    @Test
    fun `GET status is up`() {
        mockMvc.perform(get("/api/v1/status"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.status", `is`("up")))
    }
}
