package com.etchedjournal.etched.utils.id;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class SemverValidator implements ConstraintValidator<Semver, String> {

    // https://stackoverflow.com/a/27991015
    private static final Pattern NO_LEADING_ZEROES_PATTERN = Pattern.compile(
        "^(0|[1-9][0-9]{0,1})$");

    @Override
    public void initialize(Semver constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        // split on literal dot, not regex "."
        String[] parts = value.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String majorStr = parts[0];
        String minorStr = parts[1];
        String patchStr = parts[2];

        return Stream.of(majorStr, minorStr, patchStr)
            .allMatch(s -> NO_LEADING_ZEROES_PATTERN.matcher(s).matches());
    }
}
