package com.etchedjournal.etched.utils.id;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class SemverValidatorTest {

    private static final SemverValidator VALIDATOR = new SemverValidator();

    @Test
    public void valid() {
        assertValid("1.0.0");
        assertValid("1.2.3");
        // TODO should this be valid?
        assertValid("0.0.0");
        assertValid("0.0.1");
        assertValid("0.0.99");
        assertValid("0.99.0");
        assertValid("99.0.0");
        assertValid("99.99.99");
    }

    @Test
    public void invalid() {
        assertInvalid(null);
        assertInvalid("abc");
        assertInvalid("01.0.0");
        assertInvalid("1.0.00");
        assertInvalid("100.0.0");
        assertInvalid("1.0.0-1");
        assertInvalid("1.0.0-beta");
        assertInvalid("1.0.0.0");
        assertInvalid("-1.0.0");
        assertInvalid("1");
        assertInvalid("100..0");
    }

    private void assertValid(String s) {
        assertTrue(VALIDATOR.isValid(s, null));
    }

    private void assertInvalid(String s) {
        assertFalse(VALIDATOR.isValid(s, null));
    }
}
