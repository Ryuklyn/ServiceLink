package com.servicelink.core.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        return build(ex.getStatus(), ex.getErrorCode(), ex.getMessage(), ex.getDetails());
    }

    /**
     * ResponseStatusException carries its own intended HTTP status (e.g. 403,
     * 404, 409, 410) — thrown all over the controller/service layer via
     * `new ResponseStatusException(HttpStatus.FORBIDDEN, "No workspace found")`.
     * Because it's a RuntimeException, it would otherwise be swallowed by the
     * generic RuntimeException handler below and reported as a 500. This
     * handler must exist so the real status/reason reaches the client.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String reason = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return build(status, status.name(), reason);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return build(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage());
    }

    /**
     * Thrown by Spring Boot 3.2+ / Spring 6.1+ when no static resource or
     * controller mapping exists for a given request path. Prevents unmapped routes
     * from falling through to the generic Exception handler and triggering a 500.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        log.warn("Resource or endpoint not found: {}", ex.getResourcePath());
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND",
                "The requested endpoint or resource was not found: " + ex.getResourcePath());
    }

    /**
     * Thrown by Hibernate/JPA when a DB constraint (NOT NULL, unique, FK) is
     * violated — e.g. inserting a Provider with a null email. Without this
     * handler it falls through to the generic RuntimeException handler and
     * reports as an opaque 500, hiding a real data-integrity bug behind
     * "please try again."
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage(), ex);
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "DATA_INTEGRITY_ERROR",
                "The request could not be completed due to a data constraint. Please check the submission and try again.");
    }

    /**
     * Thrown when a route exists but not for the HTTP verb used (e.g. a
     * frontend POST hitting a @PutMapping-only route). Without this handler
     * Spring's default 405 gets swallowed by the generic Exception handler
     * below and reported as a 500, hiding what is really a client-side
     * routing/verb mismatch.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to access this resource.");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("Unhandled runtime exception: {}", ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled checked exception: {}", ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again.");
    }

    private static ResponseEntity<Map<String, Object>> build(
            HttpStatus status, String code, String message) {
        return build(status, code, message, null);
    }

    private static ResponseEntity<Map<String, Object>> build(
            HttpStatus status, String code, String message, String details) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status",    status.value());
        body.put("code",      code);
        body.put("message",   message);
        if (details != null && !details.isBlank()) {
            body.put("details", details);
        }
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, Object>> handleBookingConflict(BookingConflictException ex) {
        return build(HttpStatus.CONFLICT, "BOOKING_CONFLICT", ex.getMessage());
    }
}
