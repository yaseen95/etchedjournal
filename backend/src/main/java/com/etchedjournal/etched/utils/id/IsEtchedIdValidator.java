package com.etchedjournal.etched.utils.id;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class IsEtchedIdValidator implements ConstraintValidator<IsEtchedId, String> {
    @Override
    public void initialize(IsEtchedId constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value != null && value.length() == 11 && PATTERN.matcher(value).matches();
    }

    private static final Pattern PATTERN = Pattern.compile("[A-Za-z0-9-_]{11}");
}
