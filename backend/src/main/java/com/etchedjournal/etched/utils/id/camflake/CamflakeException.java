package com.etchedjournal.etched.utils.id.camflake;

// Copy pasted from
// https://github.com/cam-inc/camflake/blob/develop/camflake/src/main/java/com/camobile/camflake/CamflakeException.java

/**
 * Runtime exception of {@link Camflake}.
 */
public final class CamflakeException extends RuntimeException {

    /**
     * Constructs a new exception with the specified detail message.
     *
     * @param message the detail message.
     */
    public CamflakeException(String message) {
        super(message);
    }

    /**
     * Constructs a new exception with the specified detail message and cause.
     *
     * @param message the detail message.
     * @param cause the cause.
     */
    public CamflakeException(String message, Throwable cause) {
        super(message, cause);
    }
}
