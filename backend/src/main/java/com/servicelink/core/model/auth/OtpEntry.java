package com.servicelink.core.model.auth;

import java.time.Instant;

/**
 * Immutable value object stored in OtpService's in-memory map.
 * Using a Java record for zero-boilerplate immutability.
 */
public record OtpEntry(String otp, Instant expiresAt, int sendCount) {}
