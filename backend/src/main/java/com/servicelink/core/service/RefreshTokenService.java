package com.servicelink.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String PREFIX = "refresh_token:";

    public void store(String email, String jti, String token, long expirationMillis) {
        String key = PREFIX + email + ":" + jti;
        redisTemplate.opsForValue().set(key, token, Duration.ofMillis(expirationMillis));
    }

    public boolean isValid(String email, String jti, String token) {
        String key = PREFIX + email + ":" + jti;
        String stored = redisTemplate.opsForValue().get(key);
        return stored != null && stored.equals(token);
    }

    public void revoke(String email, String jti) {
        String key = PREFIX + email + ":" + jti;
        redisTemplate.delete(key);
    }

    public void revokeAllForUser(String email) {
        Set<String> keys = redisTemplate.keys(PREFIX + email + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}