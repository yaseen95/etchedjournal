package com.etchedjournal.etched.utils.id;

import org.junit.Test;

import static org.junit.Assert.*;

public class IsEtchedIdValidatorTest {

    private static final IsEtchedIdValidator VALIDATOR = new IsEtchedIdValidator();

    @Test
    public void valid() {
        assertValid("ABCDEFGHIJK");
        assertValid("-----------");
        assertValid("___________");
        assertValid("abcdefghijk");
        assertValid("01234567890");
        assertValid("Bad290av_A-");
    }

    @Test
    public void invalid() {
        assertInvalid(null);
        assertInvalid("");
        assertInvalid("           ");
        assertInvalid(" abcdefghij");
        assertInvalid("abcdefghij ");
        assertInvalid("abccdefghi!");
        assertInvalid("!abccdefghi");
        assertInvalid("!abccdefgh!");
        assertInvalid("abcdefghijkl");
        assertInvalid("abcdefghij");
    }

    private void assertValid(String s) {
        assertTrue(VALIDATOR.isValid(s, null));
    }

    private void assertInvalid(String s) {
        assertFalse(VALIDATOR.isValid(s, null));
    }
}
