package com.etchedjournal.etched

import com.etchedjournal.etched.service.AuthService
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class EtchedApplicationTests {

    @MockBean
    private lateinit var authService: AuthService

    @Test
    fun contextLoads() {
    }

}
