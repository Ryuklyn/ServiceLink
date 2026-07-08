package com.servicelink.core.config;

import com.servicelink.core.security.JwtAuthenticationFilter;
import com.servicelink.core.security.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ---------------------------------------------------------
                // CORS & CSRF
                // ---------------------------------------------------------
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // ---------------------------------------------------------
                // Stateless JWT Authentication
                // ---------------------------------------------------------
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ---------------------------------------------------------
                // Authentication Exception
                // ---------------------------------------------------------
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                        )
                )

//                // ---------------------------------------------------------
//                // Authorization Rules
//                // ---------------------------------------------------------
//                .authorizeHttpRequests(auth -> auth
//
//                        // Allow browser pre-flight requests
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//
//                        // =====================================================
//                        // PUBLIC ENDPOINTS
//                        // =====================================================
//
//                        // Authentication
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/oauth2/**",
//                                "/error"
//                        ).permitAll()
//
//                        // File Uploads
//                        .requestMatchers(
//                                HttpMethod.POST,
//                                "/api/storage/upload"
//                        ).permitAll()
//
//                        // KYC
//                        .requestMatchers(
//                                HttpMethod.GET, "/api/kyc/status/by-reference"
//                        ).permitAll()
//
//                        .requestMatchers(
//                                "/api/kyc/**"
//                        ).permitAll()
//
//                        // Business / Payment
//                        .requestMatchers(
//                                "/api/business/**"
//                        ).permitAll()
//
//                        // Provider Catalog (GET only)
//                        .requestMatchers(HttpMethod.GET,
//                                "/api/providers",
//                                "/api/providers/catalog",
//                                "/api/providers/{providerId}",
//                                "/api/providers/{providerId}/reviews"
//                        ).permitAll()
//
//                        // Provider PIN auth (POST — OTP-adjacent, not method-restricted)
//                        .requestMatchers(
//                                "/api/providers/auth/check-device",
//                                "/api/providers/auth/set-pin",
//                                "/api/providers/auth/skip-pin",
//                                "/api/providers/auth/verify-pin"
//                        ).permitAll()
//
//                        // =====================================================
//                        // ADMIN
//                        // =====================================================
//                        .requestMatchers(
//                                "/api/admin/**"
//                        ).hasRole("ADMIN")
//
//                        // =====================================================
//                        // AUTHENTICATED USERS
//                        // =====================================================
//                        .requestMatchers(
//                                "/api/providers/me/**",
//                                "/api/appointments/**"
//                        ).authenticated()
//
//                        // =====================================================
//                        // EVERYTHING ELSE
//                        // =====================================================
//                        .anyRequest().authenticated()
//                )

                .authorizeHttpRequests(auth -> auth

                        // Allow browser pre-flight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =====================================================
                        // PUBLIC ENDPOINTS
                        // =====================================================

                        .requestMatchers(
                                "/api/auth/**",
                                "/oauth2/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/storage/upload"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET, "/api/kyc/status/by-reference"
                        ).permitAll()

                        .requestMatchers(
                                "/api/kyc/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/business/**"
                        ).permitAll()

                        // Provider PIN auth (POST — OTP-adjacent, not method-restricted)
                        .requestMatchers(
                                "/api/providers/auth/check-device",
                                "/api/providers/auth/set-pin",
                                "/api/providers/auth/skip-pin",
                                "/api/providers/auth/verify-pin"
                        ).permitAll()

                        // =====================================================
                        // AUTHENTICATED PROVIDER — must come BEFORE the generic
                        // "/api/providers/{providerId}" catalog rule below, since
                        // {providerId} matches literal "me" as a path variable and
                        // would otherwise shadow this and leak it as public.
                        // =====================================================
                        .requestMatchers(
                                "/api/providers/me",
                                "/api/providers/me/**"
                        ).authenticated()

                        // =====================================================
                        // Provider Catalog (GET only) — public, generic {providerId}
                        // Declared AFTER /me so it can no longer match it first.
                        // =====================================================
                        .requestMatchers(HttpMethod.GET,
                                "/api/providers",
                                "/api/providers/catalog",
                                "/api/providers/{providerId}",
                                "/api/providers/{providerId}/reviews"
                        ).permitAll()

                        // =====================================================
                        // ADMIN
                        // =====================================================
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // =====================================================
                        // AUTHENTICATED USERS (everything else under these prefixes)
                        // =====================================================
                        .requestMatchers(
                                "/api/appointments/**"
                        ).authenticated()

                        // =====================================================
                        // EVERYTHING ELSE
                        // =====================================================
                        .anyRequest().authenticated()
                )

                // ---------------------------------------------------------
                // OAuth2 Login
                // ---------------------------------------------------------
                .oauth2Login(oauth ->
                        oauth.successHandler(oAuth2LoginSuccessHandler)
                )

                // ---------------------------------------------------------
                // JWT Filter
                // ---------------------------------------------------------
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:3001"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}