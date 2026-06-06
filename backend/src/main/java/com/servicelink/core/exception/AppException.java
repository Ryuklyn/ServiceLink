// com/servicelink/core/exception/AppException.java
package com.servicelink.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception for all application-level errors.
 * All custom exceptions inherit from this class.
 */
@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final String details;

    public AppException(String message, HttpStatus status, String errorCode) {
        this(message, status, errorCode, null);
    }

    public AppException(String message, HttpStatus status, String errorCode, String details) {
        super(message);
        this.status    = status;
        this.errorCode = errorCode;
        this.details   = details;
    }
}
