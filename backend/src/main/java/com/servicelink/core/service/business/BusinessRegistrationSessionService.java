package com.servicelink.core.service.business;

import tools.jackson.databind.ObjectMapper;
import com.servicelink.core.dto.cache.business.RegistrationSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BusinessRegistrationSessionService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String KEY_PREFIX = "business:registration:session:";
    private static final Duration TTL = Duration.ofHours(24);

    public void updateStep(Long organizationId, String step, Long workspaceId, Long proUserId, Long kybId) {
        RegistrationSession session = getSession(organizationId).orElse(null);
        if (session == null) {
            session = new RegistrationSession();
        }
        session.setOrganizationId(organizationId);
        session.setLastCompletedStep(step);
        if (workspaceId != null) session.setWorkspaceId(workspaceId);
        if (proUserId != null) session.setProUserId(proUserId);
        if (kybId != null) session.setKybId(kybId);
        session.setUpdatedAt(LocalDateTime.now());

        try {
            redisTemplate.opsForValue().set(
                    KEY_PREFIX + organizationId,
                    objectMapper.writeValueAsString(session),
                    TTL
            );
        } catch (Exception e) {
            log.warn("Failed to cache registration session for org {}", organizationId, e);
            // non-fatal: Redis is a cache, not the source of truth
        }
    }

    public Optional<RegistrationSession> getSession(Long organizationId) {
        try {
            String json = redisTemplate.opsForValue().get(KEY_PREFIX + organizationId);
            if (json == null) return Optional.empty();
            return Optional.ofNullable(objectMapper.readValue(json, RegistrationSession.class));
        } catch (Exception e) {
            log.warn("Failed to get registration session from Redis for org {}", organizationId, e);
            return Optional.empty();
        }
    }

    public void clearSession(Long organizationId) {
        try {
            redisTemplate.delete(KEY_PREFIX + organizationId);
        } catch (Exception e) {
            log.warn("Failed to clear registration session from Redis for org {}", organizationId, e);
        }
    }

}
