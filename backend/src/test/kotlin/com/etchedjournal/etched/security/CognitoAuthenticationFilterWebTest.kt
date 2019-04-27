package com.etchedjournal.etched.security

import com.auth0.jwk.Jwk
import com.auth0.jwk.JwkProvider
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.etchedjournal.etched.security.jwt.TokenProcessor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

// Other tests mock out the cognito filter
// These tests actually test the filter in the context of the running app
@RunWith(SpringRunner::class)
@SpringBootTest
class CognitoAuthenticationFilterWebTest {

    @TestConfiguration
    class CognitoFilterTestConfig {

        @Bean
        fun jwkProvider(): JwkProvider {
            return mock()
        }

        @Bean
        fun tokenProcessor(jwkProvider: JwkProvider): TokenProcessor {
            return TokenProcessor(jwkProvider)
        }

        @Bean
        fun mapper(): CognitoAuthenticationMapper {
            return CognitoAuthenticationMapper()
        }

        @Bean
        fun cognitoFilter(
            tokenProcessor: TokenProcessor,
            mapper: CognitoAuthenticationMapper
        ): CognitoAuthenticationFilter {
            return CognitoAuthenticationFilter(tokenProcessor, mapper)
        }
    }

    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @Autowired
    private lateinit var jwkProvider: JwkProvider

    @Before
    fun setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            // Have to apply apply spring security mock
            .apply<DefaultMockMvcBuilder>(SecurityMockMvcConfigurers.springSecurity())
            .build()

        // we only mock out the jwk provider
        whenever(jwkProvider.get("testkeyid")).thenReturn(AUTH_JWK)
    }

    @Test
    fun `GET journals`() {
        val token = createJwt(subject = "subject", username = "samsepiol")
        mockMvc.perform(get("/api/v1/journals")
            .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(content().json("[]", true))
    }

    @Test
    fun `request without token returns 401`() {
        mockMvc.perform(get("/api/v1/journals"))
            .andExpect(status().isUnauthorized)
            .andExpect(header().string("WWW-Authenticate", "Bearer"))
            .andExpect(content().string(""))
    }

    @Test
    fun `username missing from jwt returns 400`() {
        val token = createJwt(subject = "subject", username = null)
        mockMvc.perform(get("/api/v1/journals")
            .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().json("""{ "message": "Invalid jwt" }""", true))
    }

    @Test
    fun `subject missing from jwt returns 400`() {
        val token = createJwt(subject = null, username = "samsepiol")
        mockMvc.perform(get("/api/v1/journals")
            .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().json("""{ "message": "Invalid jwt" }""", true))
    }

    fun createJwt(
        subject: String? = "subjectUuid",
        username: String? = "samsepiol",
        tokenUse: String? = "access",
        keyId: String = "testkeyid"
    ): String {
        val algo = Algorithm.RSA256(PUBLIC_KEY, PRIVATE_KEY)
        return JWT.create()
            .withSubject(subject)
            .withClaim("username", username)
            .withClaim("token_use", tokenUse)
            .withKeyId(keyId)
            .sign(algo)
    }

    companion object {
        /*
        Test keys were created with the following commands

        val gen = KeyPairGenerator.getInstance("RSA")
        gen.initialize(2048)
        val kp = gen.genKeyPair()

        val encoder = Base64.getEncoder()
        val pubKeyStr = encoder.encodeToString(kp.public.encoded)
        val privKeyStr = encoder.encodeToString(kp.private.encoded)
         */
        private val PRIVATE_KEY_STR: String =
            """
            MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcNx1C2ifw
            r2dg4d7tHkvH1nCdLvvyBSdePu6ATMdGnj4rYmNc3vsiDPbp94bUVx/kMQb0
            IDZO3gqArkBLMXOZ6Wz73HFd2gyI7LYH8xSApDZidMj8nwrdNwQ2P6g2pHtj
            rr9a+y4LblylkFIiCp9PdMRPVLoSShUBtRppRctTTdctjpKID3txVlnYrkob
            rHyVqn8AX24z8o7qj3DUGWemrUIBBCjEt2FeJjfNIJjgjMb8glVjwB0c8Mvr
            imzsKXCKghagSeiwKrFjhFPmUkbcaKLuCc8QFLQtUQfXUJV2IEvydi7rM2DQ
            iqlJImvn3oi5jA2uGGiqOYKIM3HCHXuxAgMBAAECggEAc7jsZ0q+zbDSr1WD
            1DpePwLfV8GniGlC+bE68zZtZSXyvibbnr/cYCQkgbwJWKHWETA0i4KVWKVq
            OFtda5aNoZXnU0jBfpn6MTDRxF/Rb162nwcOoP2cibWo3BsaHKiKc5TPUrHC
            MVunLEsWXPtreuvwRShp0wSoPSSRFS1L60ATCUGlNKeNiQmnlFCzmnp76XPb
            Uh0wytBH/3wPqlRqRSfacjlHAsdecq02IvLtoFmoBMbCt2KxFdxcxTR1f11i
            pUXHYjTW8HhhBLD9PrBRV0dl4V/PnjN7DdiLB9fZELPumpFbfP3O3Y4fca8T
            PAzhhCfLGZOfBTRn5ZuvLFlMRQKBgQDjdSeVEDNcZYvE7D/im1yrNPSsdEwP
            x8kXDa/2iZhlwM2CqSEQ3+PSfigRoZTvflZY9/Xx7A5MElUP53lvTjLQObqL
            B7W7oKNdOTSxCpaFZMT3+3t39/YbvupRHW2jKLrpUvxQtan6k8t2PFIGry0W
            ICPoB3o6KnGBL2ingMc4awKBgQCv0V8q86Pba/RXQBzXc6qneTBXo3AO/AEg
            FCeviTR8xwgNHrfqpU+SuVqWEBP6EJBKaXsBjVEuP+/1BQD2V1kBRb2k9Zan
            UGak3P4holFZ6veM2FGvRmEU5jTY8i06YbPUlLVv4pXRbkAE9ab13XbG6ila
            xPMl4kol8Ql+I5LTUwKBgQCvzpq0lZwNO5PHto8+eLUsw7amIRG1VMdyISsz
            1HBNnbN63XzoTRULWmVgE1NJtY3KIIYh4kG+vKCwtUpgJMITvbsYwPHPvz7l
            zFSUzsk++39e6SsqtCaulWcJIUTfypiFxZWuUGu8eUXW8pK4BehEZL08F6N6
            l9m5b0plxZy2VwKBgQCX2xIEyi1DzslbNt/yY1AJmI3dlCeseZMLPv1MCwjP
            oSTeGCMoQyIoi3mnVTm76eSGsPZyT7nHZaf/DBRZsPYKOE9llE1MNBCD4vCI
            4ma7cEviVdCvv+0IHRGWNA5Gd67YNJ1FhwJ5wmz/G6HaiC8X/ZY8dRHCLeJ3
            ROo7DcS6SwKBgFEvbueWMuv6YBAYYQq+lWsMFJoJCDbdqgOKrIuQNluab+Xi
            SjCNE4sm3YNcqgl8MZl4kY3xWdBlid4x5XgTyTtxj46+ywyh+wB2BW2UEDWJ
            DH66lP9w3iQ486/XZWQqgtiNKagJprLF3cfJzy2KJV3jREtE/mIA2EWsYNYf
            OKq7
            """.trimIndent().split("\n").joinToString("")

        private val PUBLIC_KEY_STR: String =
            """
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDcdQton8K9nYOHe
            7R5Lx9ZwnS778gUnXj7ugEzHRp4+K2JjXN77Igz26feG1Fcf5DEG9CA2Tt4K
            gK5ASzFzmels+9xxXdoMiOy2B/MUgKQ2YnTI/J8K3TcENj+oNqR7Y66/Wvsu
            C25cpZBSIgqfT3TET1S6EkoVAbUaaUXLU03XLY6SiA97cVZZ2K5KG6x8lap/
            AF9uM/KO6o9w1Blnpq1CAQQoxLdhXiY3zSCY4IzG/IJVY8AdHPDL64ps7Clw
            ioIWoEnosCqxY4RT5lJG3Gii7gnPEBS0LVEH11CVdiBL8nYu6zNg0IqpSSJr
            596IuYwNrhhoqjmCiDNxwh17sQIDAQAB
            """.trimIndent().split("\n").joinToString("")

        val PUBLIC_KEY: RSAPublicKey
        val PRIVATE_KEY: RSAPrivateKey

        val AUTH_JWK: Jwk

        init {
            val decoder = Base64.getDecoder()
            val encoder = Base64.getEncoder()
            val factory = KeyFactory.getInstance("RSA")

            val privateKeyBytes = decoder.decode(PRIVATE_KEY_STR)
            val pkcs8Spec = PKCS8EncodedKeySpec(privateKeyBytes)
            PRIVATE_KEY = factory.generatePrivate(pkcs8Spec) as RSAPrivateKey

            val publicKeyBytes = decoder.decode(PUBLIC_KEY_STR)
            val x509Spec = X509EncodedKeySpec(publicKeyBytes)
            PUBLIC_KEY = factory.generatePublic(x509Spec) as RSAPublicKey

            AUTH_JWK = Jwk(
                /* ktlint-disable no-multi-spaces */
                "jwkId",    // kid
                "RSA",      // kty
                "RS256",    // alg
                "sig",      // use
                /* ktlint-enable no-multi-spaces */
                listOf<String>(),
                null,
                listOf<String>(),
                null,
                mapOf(
                    "e" to encoder.encodeToString(PUBLIC_KEY.publicExponent.toByteArray()),
                    "n" to encoder.encodeToString(PUBLIC_KEY.modulus.toByteArray())
                )
            )
        }
    }
}
