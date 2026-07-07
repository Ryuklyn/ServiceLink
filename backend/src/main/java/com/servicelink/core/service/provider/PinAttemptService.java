package com.servicelink.core.service.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class PinAttemptService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCKOUT_WINDOW = Duration.ofMinutes(15);

    private String key(String deviceId) {
        return "pin_attempts:" + deviceId;
    }

    /** Returns remaining attempts AFTER this failure. 0 means locked out. */
    public int recordFailure(String deviceId) {
        String k = key(deviceId);
        Long count = redisTemplate.opsForValue().increment(k);
        if (count != null && count == 1L) {
            redisTemplate.expire(k, LOCKOUT_WINDOW);
        }
        long used = count != null ? count : 1L;
        return (int) Math.max(MAX_ATTEMPTS - used, 0);
    }

    public boolean isLockedOut(String deviceId) {
        String val = redisTemplate.opsForValue().get(key(deviceId));
        if (val == null) return false;
        return Long.parseLong(val) >= MAX_ATTEMPTS;
    }

    public void resetOnSuccess(String deviceId) {
        redisTemplate.delete(key(deviceId));
    }
}
