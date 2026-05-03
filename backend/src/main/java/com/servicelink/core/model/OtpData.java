package com.servicelink.core.model;

import lombok.Value;

import java.time.Instant;

@Value
public class OtpData {
    String otp;
    Instant expiryTime;
}
