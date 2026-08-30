package com.servicelink.core.service;

import com.servicelink.core.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final RefreshTokenService refreshTokenService;

    private static final String SESSION_KEY_PREFIX = "servicelink:session:user:";

    public void registerSession(Long userId, String email, String jti, long expirationMillis) {
        String key = SESSION_KEY_PREFIX + userId;

        // 1. Look up the currently active session jti in Redis.
        String previousJti = redisTemplate.opsForValue().get(key);

        if (previousJti != null) {
            // 2. Revoke the previous refresh token
            refreshTokenService.revoke(email, previousJti);
            log.info("Revoking previous session {} for user {}", previousJti, userId);

            // 3. Notify the old browser via WebSockets
            try {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(userId),
                        "/queue/notifications",
                        Map.of(
                                "type", "SESSION_REVOKED",
                                "message", "Your account was signed in on another device."
                        )
                );
            } catch (Exception e) {
                log.warn("Failed to send WebSocket session revocation to user {}", userId, e);
            }
        }

        // 4. Store the new active session jti in Redis.
        redisTemplate.opsForValue().set(key, jti, Duration.ofMillis(expirationMillis));
    }

    public boolean isSessionActive(Long userId, String jti) {
        if (jti == null) return false;
        String key = SESSION_KEY_PREFIX + userId;
        String activeJti = redisTemplate.opsForValue().get(key);
        return jti.equals(activeJti);
    }

    public void clearSession(Long userId) {
        redisTemplate.delete(SESSION_KEY_PREFIX + userId);
    }
}