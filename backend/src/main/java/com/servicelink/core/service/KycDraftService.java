//package com.servicelink.core.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Service;
//
//import java.time.Duration;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class KycDraftService {
//
//    private final RedisTemplate<String, String> redisTemplate;
//    private final ObjectMapper objectMapper;    // 👈 Jackson ko ObjectMapper - Spring le auto-inject garcha
//
//    private static final Duration DRAFT_TTL = Duration.ofHours(24);
//    private static final String PREFIX = "kyc:draft:";
//
//    public void saveDraft(String identifier, Map<String, Object> draftData) {
//        try {
//            String key = PREFIX + identifier;
//            String json = objectMapper.writeValueAsString(draftData);
//            redisTemplate.opsForValue().set(key, json, DRAFT_TTL);
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to save KYC draft: " + e.getMessage());
//        }
//    }
//
//    public Map<String, Object> loadDraft(String identifier) {
//        try {
//            String key = PREFIX + identifier;
//            String json = redisTemplate.opsForValue().get(key);
//            if (json == null) return null;
//            return objectMapper.readValue(json, Map.class);
//        } catch (Exception e) {
//            return null;
//        }
//    }
//
//    public void deleteDraft(String identifier) {
//        redisTemplate.delete(PREFIX + identifier);
//    }
//
//    public boolean hasDraft(String identifier) {
//        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + identifier));
//    }
//}