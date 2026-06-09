package com.servicelink.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    // ─── Extraction Utilities ──────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ─── Token Generation Methods ──────────────────────────────────────────────

    /**
     * Primary Token Generation Method for standard system users.
     * Extracts the Role enum string dynamically to inject it as a claim.
     */
    public String generateToken(String email, com.servicelink.core.model.user.Role role) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (role != null) {
            extraClaims.put("role", role.name());
        }
        return buildToken(extraClaims, email, jwtExpiration);
    }

    /**
     * Specialized Token Generation featuring arbitrary claims and explicit duration.
     * Perfect for handling transient verification environments (like 15-minute OTP sessions).
     */
    public String generateToken(Map<String, Object> extraClaims, String subject, long expirationMillis) {
        return buildToken(extraClaims, subject, expirationMillis);
    }

    /**
     * Legacy Overload Support - Generates a token with an arbitrary claims layout
     * utilizing the standard system expiration configuration window.
     */
    public String generateToken(Map<String, Object> extraClaims, String subject) {
        return buildToken(extraClaims, subject, jwtExpiration);
    }

    /**
     * Basic Fallback Token Generation - Generates an empty-claims payload
     * targeting the subject identity string directly.
     */
    public String generateToken(String email) {
        return buildToken(new HashMap<>(), email, jwtExpiration);
    }

    // ─── Private Infrastructure Mechanics ──────────────────────────────────────

    private String buildToken(
            Map<String, Object> extraClaims,
            String subject,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}