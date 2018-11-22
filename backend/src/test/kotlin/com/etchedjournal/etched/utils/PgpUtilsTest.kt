package com.etchedjournal.etched.utils

import org.bouncycastle.bcpg.PublicKeyAlgorithmTags
import org.bouncycastle.openpgp.PGPException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import java.util.Base64

class PgpUtilsTest {

    @Test
    fun `readPublicKey - tester`() {
        // ETCHED_TESTER_RSA_2048_GPG_PUBLIC_KEY was created using gpg
        val key = PgpUtils.readPublicKey(ETCHED_TESTER_RSA_2048_GPG_PUBLIC_KEY)
        assertEquals(PublicKeyAlgorithmTags.RSA_GENERAL, key.algorithm)
        assertEquals(
            "Etched Tester (Etched Unit Test Key) <etchedtester@example.com>",
            key.userIDs.asSequence().first()
        )
        assertEquals(2048, key.bitStrength)
        assertTrue(key.isEncryptionKey)
    }

    @Test
    fun `readPublicKey - abcdef`() {
        // abcdef key was created using openpgpjs
        val key = PgpUtils.readPublicKey(ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY)
        assertEquals(PublicKeyAlgorithmTags.RSA_GENERAL, key.algorithm)
        assertEquals(
            "abcdef <abcdef@user.etchedjournal.com>",
            key.userIDs.asSequence().first()
        )
        assertEquals(2048, key.bitStrength)
        assertTrue(key.isEncryptionKey)
    }

    @Test
    fun `readPublicKey - abcdef armored`() {
        // read using the armored public key
        val key = PgpUtils.readPublicKey(ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY_ARMORED_STR)
        assertEquals(PublicKeyAlgorithmTags.RSA_GENERAL, key.algorithm)
        assertEquals(
            "abcdef <abcdef@user.etchedjournal.com>",
            key.userIDs.asSequence().first()
        )
        assertEquals(2048, key.bitStrength)
        assertTrue(key.isEncryptionKey)
    }
    @Test
    fun `readPublicKey - throws when key is invalid`() {
        // read using the armored public key
        try {
            PgpUtils.readPublicKey("ABCDEFGHI")
            fail()
        } catch (e: IllegalArgumentException) {
            // Expected exception
            assertEquals("Unable to read public key", e.message)
        }
    }

    @Test
    fun `readPublicKey - throws when given a private key`() {
        try {
            PgpUtils.readPublicKey(TESTER_RSA_4096_OPENPGPJS_PRIVATE_KEY)
            fail()
        } catch (e: PGPException) {
            assertEquals("org.bouncycastle.openpgp.PGPSecretKeyRing found where PGPPublicKeyRing " +
                "expected", e.message)
        }
    }

    companion object {
        val ETCHED_TESTER_RSA_2048_GPG_PUBLIC_KEY =
            """
            -----BEGIN PGP PUBLIC KEY BLOCK-----

            mQENBFvlJYkBCADca6wVbcBLkNd/CjfnDks+/UzYnMzMWWY8vV0twhr4LquScHpb
            pj10BotcgIPvPA4tRIKa+OcTGr6SFeSqdYj1hvCt/eUSdZ3D5/AExyw6pp5wDCkq
            UJyh1veqvEcj/JkGE+bpFUZZZyENV4g2pqKoZF4A+0YBNuoCZkWzuXBJ0I6jyztV
            n3qra321LcTGXVOQqwYLuOAF2nkhDl3uT6pXBLJ6pOJEk+XGJgXEyMrL74jq+1/+
            ilu/of7e2GzoulT1fgdkxTGWWnxctGm4KYA05ziikyP9QwweZNc4BkoF/QwjSwUR
            tSVlkyClbWy4DtwoOMS7O8gaMG4pBAVJn3xNABEBAAG0P0V0Y2hlZCBUZXN0ZXIg
            KEV0Y2hlZCBVbml0IFRlc3QgS2V5KSA8ZXRjaGVkdGVzdGVyQGV4YW1wbGUuY29t
            PokBTgQTAQoAOBYhBGeNwBdZLGsvOD3H66PKVUhURizvBQJb5SWJAhsDBQsJCAcD
            BRUKCQgLBRYCAwEAAh4BAheAAAoJEKPKVUhURizvnxsIANm9kiu7AmONhYaiVQev
            OTAG6F/2gePtwj5O80l7aX6SsUYSBH3f90oH2hWokNxyLDPzm54v/RfwYY8WA4TH
            R0fw/ILr4AUDaheOpjOeqzDOhmhhgXL9/i9IlSBGtWbmET8kWAbIa52Q/nIu2MdO
            qqLduqEX1bVDRBXBhfzcJDu4J7HRr8B118ortFKViFbviOvudx3zMrEuN3J9i8TM
            OzNP+f6hsFTvFFwu5Juy8THp5W9rnyBtArPgLZvjeSrWTLuGaqYanvNZ2OvtVkwF
            6tcAzFCAV0EzElNM2PfcZuGisEWVhc+zDhqAwhBkQL7oMnfTdXHx4olP1mAQaY8t
            G9K5AQ0EW+UliQEIAMiGicUvUencLGidUSRg6hbAra7uCPD9p9SvlhlhhtB1VAcT
            rbZHbtytYl7EDmmR99RCYGA5lt5cFIaRuneUBWdK2GGttFLLoAo/zhWWBMr8Lejs
            VZf9B2myFT3HxMSX2wXVYbHCE0A4pkSvDb7h2FiUcMijJeP9BX5uOnAN4r2CyWlN
            dsYstfBypPtxPp7uTz3jbNSZrUm+6x+OnlGigVdcdAokWyb/6vUPCuuRS8UBXE7O
            T/SlVH3zlK9WtUomvKVNKEt5y9qLkUHxU8bSc/TiAF4bXtUqXx1Y0rGX7pfd4IE5
            P0uBteKLsblZ/Sq+qg3rMJ5vPabq7AkJwizvqKkAEQEAAYkBNgQYAQoAIBYhBGeN
            wBdZLGsvOD3H66PKVUhURizvBQJb5SWJAhsMAAoJEKPKVUhURizvlGUH/2vOwjoJ
            rs+lk5PPmyibI9Jiucvo0I8NMlacq6s+Ctb6/IcQBYCurckrYUwALNfnzlDyP2FE
            knW6A8HcVOk2ogCq5L4CfuX6PbjlO9a7vayNBZgIwv0Ar41NLBThTErIjhhABM4h
            LutiHXswEo3mxc7vH37hWUKZoc3TI+EoLVJpo+7gFjTJ4iev6m9xbkKxfpKlCAEM
            hErkQCi6+SCmLjqOoZI9wZxyHg9ddgdk1L73VAGR+e+lQN69+PUK6vqEAYdSkDyf
            ItDtZjJpL5gDdzKMyeqCDnkl/wv8lvZMdwrwLoABVqT4MgEp+zBhzEohabZfu0RS
            bvEvsme9OMXNSx8=
            =92YX
            -----END PGP PUBLIC KEY BLOCK-----""".trimIndent()

        /**
         * This key was created for our test user 01234567-89ab-cdef-0123-456789abcdef via openpgpjs
         *
         * Has user id "01234567-89ab-cdef-0123-456789abcdef <01234567-89ab-cdef-0123-456789abcdef@user.etchedjournal.com>"
         *
         * Public key component for private key [TESTER_RSA_4096_OPENPGPJS_PRIVATE_KEY]
         */
        val TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY =
            """
            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
            BrFAjSNICjsaATUu5Xf4qlf41b9n
            """.trimIndent()

        /**
         * This key was created for our test user 01234567-89ab-cdef-0123-456789abcdef via openpgpjs
         *
         * Private key component for public key [TESTER_RSA_4096_OPENPGPJS_PUBLIC_KEY]
         */
        val TESTER_RSA_4096_OPENPGPJS_PRIVATE_KEY =
            """
            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
            lInRn1PYSJq4n4LjnjDYo1uv0Ko0iBx0nORQzNEse4mPMP+/0lEAHOX5LAD9
            mH59hdqBfnK03WrxRpb+aISpngcDEs3C6pwYvejz/o+8829QLQcPBDVtDxhd
            dSs1DB5seMwtXrXtWuSgVINSuCqFLTr1rMJ0Ugl4p4zVzo8VNZ3ydQIsBOgM
            As6A7z0Nk71tsxk/sk3YbOGgc9JvZbV44ZTn7+v5FbZ3o3CSbLfLlNNLokyN
            YDwpqhijy65L6GBQrX9TbFoXYVfBH+Jz72qqGvZE/j5CMyNcbVctNBdOHHk+
            3yHrTe+QP8n9zc3dCxxhw/d7+DlFy/jvTbwXapTFNaBmlMDZSPuK9pvgLqE5
            nfmw6hd1KPEQDq8FBH525iwZybr7b2fXKFSxmzIhoyCBhHRBgbRXniJvNnnv
            kR9k0FyeupnRTvhoXpui5Bb+v0bNYzAxMjM0NTY3LTg5YWItY2RlZi0wMTIz
            LTQ1Njc4OWFiY2RlZiA8MDEyMzQ1NjctODlhYi1jZGVmLTAxMjMtNDU2Nzg5
            YWJjZGVmQHVzZXJzLmV0Y2hlZGpvdXJuYWwuY29tPsLBdQQQAQgAKQUCW/UH
            YwYLCQcIAwIJEPah4BndsUBOBBUICgIDFgIBAhkBAhsDAh4BAABiuRAAzz/h
            aN1nHtEjf3LbhtstaWbcx27qYMaOYD5/gy4ptu3DSb/R1TQB5ULH4U5q/HS2
            ExR1XX4xypIAt2ISMlG1vTBIJiH+O1zHFJ3SJDBkj2qI3mRVez1SDxz9Qicp
            lyaxoJ3juFszZNiQr0ckqt9lRCzgGYpgEKSbkcXxXChFfZVZ924ntVp3XxWJ
            kRNSVESwEc4p5PsxQlTPx/xXzugtS6KuSTJtTUwayfvWxPYJ2jdbIyRXMaxX
            3voBjLv3c17T26mP0xmtsNE0bShqopJqTa8yMtVol70PxA99NWSjpOuZmSWI
            kyt5kPlzC261bD8I2ZvPGu0MJzdV3tN5M/VIizTAORjEq9zB2k/o23sONZ+J
            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

            """.trimIndent()

        val TESTER_RSA_2048_OPENPGPJS_PUBLIC_KEY =
            """
            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
            """.trimIndent()

        /**
         * This key was created for user abcdef via openpgpjs
         *
         * Has user id "abcdef <abcdef@user.etchedjournal.com>"
         */
        val ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY =
            """
            xsBNBFvnftgBCADH4Yx3Fhm7L+U4Hq79iy0Kl0EOl0boHZUGw4n+IuZF4Oz7
            X/IotIDT/AdukjSlDjm79wgQtPP9oM4ZYH3lmuqrLL1FGJrZb2BHNzfcSyo8
            U6zu9pEwiX/S87KEdbQp6ZuVtf8xb8U18Yr0ih6jaC2Bz85ThkPaiaLhlmTH
            UFKXc/VIMawqneNzF890rfGS9e1pEEvooEnwUoGZqxV05/c3PzOleWwJffPB
            PupFGdI2pEMufKHiqHQsnrpP9dPtNMMgN5vvVnhCjqVxVl67gHSsQ65FbMcC
            TSmGRU9N3uzQ4cO7RPtBbp38RQVzkelatXSjP5+7C4g/CJcDmxXnat7BABEB
            AAHNJmFiY2RlZiA8YWJjZGVmQHVzZXIuZXRjaGVkam91cm5hbC5jb20+wsB1
            BBABCAApBQJb537YBgsJBwgDAgkQ4spEjFzTARAEFQgKAgMWAgECGQECGwMC
            HgEAAJEhCAC9NpRg36MetK+lUCVMSI+cFmwEES6ArbbcRZalh8ZlyqqGbSEu
            otgcQOaRyEvL8avSs9sem6SF4lxsgO48OuowPLe9xuaVj+ojkyUc5ZfA6SdU
            jDvBQMvYVR5LNruE5PN5hEjuyZNtBEpSmu2N9Aa7euAGUZolPe16xbh9gY6k
            GbyCmcRbvyuMhVI24GtCInZCnxyFQXhuBZ5QflJD4eFtVE2iauZEG8B05BhT
            RuVDiDvcrQSY25P5VpRZuZlb4vXK13gHxXTYM9cxoDLhw8HzHRise4yNtZmI
            trQbm6IxFDu9W2H20bDtIsiS6g/1nKOf+yud0K244fObuMS9ISN4zsBNBFvn
            ftgBCAC6mpFrPxJxhHg1chEDEOBi0ScSRYDUvs/RqjGGamu0mb8fBndI67a7
            hyBjJoV1vLFmPJcdNak4gN+oeXxtF/We1nx/GcposnvwnMybyEfcec1M2SY7
            UOGU5tdw+Yg/fdQv6rx+x04gIMcfevKaZMHZeasTv3srYMKpHOTlzJTUU0Jt
            IXpUZyv4WMnbSUn46k2/pGSYlBCZOlEzy/0neetWqgZp/RW+ZKsOqamdDMk6
            CxSnnuWPbKGHWQCq2yVmwI89ksp1OqcJfVDmu9AP5D4F7C+DFT56DhjWNOET
            vyvXRI6IjgyzTXjHiwIVUNItnbL5ru4vCDA6pkAJVT/3tRQXABEBAAHCwF8E
            GAEIABMFAlvnftgJEOLKRIxc0wEQAhsMAADcBwf/bsxX7vrWdFmFci5kh4H8
            Zoea+1Iy3L6lZW6jOH8CD2cDmSYo2vocRbMQwXjftfJshADZAZSwhUaRPpzu
            lTovFvyFVL7BtreHJkt5ZIELTWVGbiL39N7S9la9/GfFomflvFWTnfo2249e
            DCyxaWX7FOPao1OjmeTKTJJTfWjEhbux5OZgpENdZJj7Bp+xiKpqjl8PtU8O
            nZj260+syHyNk4AOsNksqnC4ETL+VHYHSu6dYc6L+zj9Oruvw9Z7R+6T/hL3
            JBrPoCo1q2zy8hLHQ9FsyYpt7GnW+V0zWboy3595C5AskjLvI3cH/J3pNl9l
            +LdywSuxd+XTmwC16hc1tQ==
            """.trimIndent()

        val ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY_BYTES = Base64.getDecoder()
            .decode(ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY.replace("\n", ""))!!

        val ABCDEF_RSA_2048_OPENPGPJS_PUBLIC_KEY_ARMORED_STR =
            """
            -----BEGIN PGP PUBLIC KEY BLOCK-----
            Version: OpenPGP.js v4.1.1
            Comment: https://openpgpjs.org

            xsBNBFvnftgBCADH4Yx3Fhm7L+U4Hq79iy0Kl0EOl0boHZUGw4n+IuZF4Oz7
            X/IotIDT/AdukjSlDjm79wgQtPP9oM4ZYH3lmuqrLL1FGJrZb2BHNzfcSyo8
            U6zu9pEwiX/S87KEdbQp6ZuVtf8xb8U18Yr0ih6jaC2Bz85ThkPaiaLhlmTH
            UFKXc/VIMawqneNzF890rfGS9e1pEEvooEnwUoGZqxV05/c3PzOleWwJffPB
            PupFGdI2pEMufKHiqHQsnrpP9dPtNMMgN5vvVnhCjqVxVl67gHSsQ65FbMcC
            TSmGRU9N3uzQ4cO7RPtBbp38RQVzkelatXSjP5+7C4g/CJcDmxXnat7BABEB
            AAHNJmFiY2RlZiA8YWJjZGVmQHVzZXIuZXRjaGVkam91cm5hbC5jb20+wsB1
            BBABCAApBQJb537YBgsJBwgDAgkQ4spEjFzTARAEFQgKAgMWAgECGQECGwMC
            HgEAAJEhCAC9NpRg36MetK+lUCVMSI+cFmwEES6ArbbcRZalh8ZlyqqGbSEu
            otgcQOaRyEvL8avSs9sem6SF4lxsgO48OuowPLe9xuaVj+ojkyUc5ZfA6SdU
            jDvBQMvYVR5LNruE5PN5hEjuyZNtBEpSmu2N9Aa7euAGUZolPe16xbh9gY6k
            GbyCmcRbvyuMhVI24GtCInZCnxyFQXhuBZ5QflJD4eFtVE2iauZEG8B05BhT
            RuVDiDvcrQSY25P5VpRZuZlb4vXK13gHxXTYM9cxoDLhw8HzHRise4yNtZmI
            trQbm6IxFDu9W2H20bDtIsiS6g/1nKOf+yud0K244fObuMS9ISN4zsBNBFvn
            ftgBCAC6mpFrPxJxhHg1chEDEOBi0ScSRYDUvs/RqjGGamu0mb8fBndI67a7
            hyBjJoV1vLFmPJcdNak4gN+oeXxtF/We1nx/GcposnvwnMybyEfcec1M2SY7
            UOGU5tdw+Yg/fdQv6rx+x04gIMcfevKaZMHZeasTv3srYMKpHOTlzJTUU0Jt
            IXpUZyv4WMnbSUn46k2/pGSYlBCZOlEzy/0neetWqgZp/RW+ZKsOqamdDMk6
            CxSnnuWPbKGHWQCq2yVmwI89ksp1OqcJfVDmu9AP5D4F7C+DFT56DhjWNOET
            vyvXRI6IjgyzTXjHiwIVUNItnbL5ru4vCDA6pkAJVT/3tRQXABEBAAHCwF8E
            GAEIABMFAlvnftgJEOLKRIxc0wEQAhsMAADcBwf/bsxX7vrWdFmFci5kh4H8
            Zoea+1Iy3L6lZW6jOH8CD2cDmSYo2vocRbMQwXjftfJshADZAZSwhUaRPpzu
            lTovFvyFVL7BtreHJkt5ZIELTWVGbiL39N7S9la9/GfFomflvFWTnfo2249e
            DCyxaWX7FOPao1OjmeTKTJJTfWjEhbux5OZgpENdZJj7Bp+xiKpqjl8PtU8O
            nZj260+syHyNk4AOsNksqnC4ETL+VHYHSu6dYc6L+zj9Oruvw9Z7R+6T/hL3
            JBrPoCo1q2zy8hLHQ9FsyYpt7GnW+V0zWboy3595C5AskjLvI3cH/J3pNl9l
            +LdywSuxd+XTmwC16hc1tQ==
            =jpi9
            -----END PGP PUBLIC KEY BLOCK-----
            """.trimIndent()
    }
}
