package com.etchedjournal.etched.utils

import org.bouncycastle.bcpg.PublicKeyAlgorithmTags
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import java.util.Base64

class PgpUtilsTest {

    @Test
    fun `readPublicKey - tester`() {
        // TESTER_RSA_2048_GPG_PUBLIC_KEY was created using gpg
        val key = PgpUtils.readPublicKey(TESTER_RSA_2048_GPG_PUBLIC_KEY)
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

    companion object {
        val TESTER_RSA_2048_GPG_PUBLIC_KEY =
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
         * This key was created for user abcdef via openpgpjs
         *
         * The base 64 value was created client side via `openpgp.util.Uint8Array_to_b64`
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
