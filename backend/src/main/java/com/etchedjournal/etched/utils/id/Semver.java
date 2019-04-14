package com.etchedjournal.etched.utils.id;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({ FIELD, METHOD, PARAMETER, ANNOTATION_TYPE })
@Retention(RUNTIME)
@Constraint(validatedBy = SemverValidator.class)
@Documented
public @interface Semver {

    String message() default "{com.etchedjournal.etched.utils.Semver.message}";

    Class<?>[] groups() default { };

    Class<? extends Payload>[] payload() default {};
}
