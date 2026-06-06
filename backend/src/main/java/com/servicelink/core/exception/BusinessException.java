// com/servicelink/core/exception/BusinessException.java
package com.servicelink.core.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a business rule is violated.
 * Examples:
 *   - Slot already booked
 *   - Invalid status transition
 *   - Missing required quantity field for pricing
 *   - Provider does not offer service
 */
public class BusinessException extends AppException {

    public BusinessException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION");
    }

    public BusinessException(String message, String errorCode) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode);
    }

    public BusinessException(String message, String errorCode, String details) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode, details);
    }
}
