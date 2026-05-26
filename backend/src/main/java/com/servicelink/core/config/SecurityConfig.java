//package com.servicelink.core.config;
//
//import com.servicelink.core.security.JwtAuthenticationFilter;
//import com.servicelink.core.security.OAuth2LoginSuccessHandler;
//
//import jakarta.servlet.http.HttpServletResponse;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    public SecurityConfig(OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler, JwtAuthenticationFilter jwtAuthenticationFilter) {
//        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
//        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
//    }
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//            // 🔥 MUST be first
//            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//            .csrf(csrf -> csrf.disable())
//
//            .sessionManagement(session ->
//                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//            )
//
//            .exceptionHandling(ex -> ex
//                .authenticationEntryPoint((req, res, exx) -> {
//                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
//                })
//            )
//            .authorizeHttpRequests(auth -> auth
//            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//
//            // 🔓 PUBLIC AUTH ENDPOINTS
//            .requestMatchers(
//                "/api/auth/**",
//                "/api/kyc/submit/**",  // provider-token auth handled inside KycController
//                "/api/kyc/**",    // provider-token auth handled inside KycController
//                "/oauth2/**",
//                "/error"
//            ).permitAll()
//
//            // 🔒 PROTECTED AUTH ENDPOINTS
//
//            // everything else
//            .anyRequest().authenticated()
//        )
//
//            .oauth2Login(oauth -> oauth
//                .successHandler(oAuth2LoginSuccessHandler)
//            )
//
//            .addFilterBefore(jwtAuthenticationFilter,
//                UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//   @Bean
//public CorsConfigurationSource corsConfigurationSource() {
//    CorsConfiguration config = new CorsConfiguration();
//
//    config.setAllowedOriginPatterns(Arrays.asList("http://localhost:3001")); // ⚠️ MUST match your frontend
//    config.setAllowedMethods(Arrays.asList("*"));
//    config.setAllowedHeaders(Arrays.asList("*"));
//    config.setAllowCredentials(true);
//
//    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//    source.registerCorsConfiguration("/**", config);
//
//    return source;
//}
//}

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

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, exx) ->
                                res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Public: Auth ──────────────────────────────────────
                        .requestMatchers(
                                "/api/auth/**",
                                "/oauth2/**",
                                "/error"
                        ).permitAll()

                        // ── Public: KYC ───────────────────────────────────────
                        .requestMatchers(
                                "/api/kyc/submit/**",
                                "/api/kyc/**"
                        ).permitAll()

                        // ── Public: Payment ───────────────────────────────────
                        // subscription + initiate are public to allow
                        // unauthenticated users to start payment flow.
                        // callbacks MUST be public — gateway hits them directly,
                        // no JWT token is present in those redirects.
                        .requestMatchers(
                                "/api/business/payment/subscription",
                                "/api/business/**",
                                "/api/business/organization",
                                "/api/business/workspace",
                                "/api/business/payment/initiate",
                                "/api/business/payment/esewa/callback",
                                "/api/business/payment/khalti/callback"
                        ).permitAll()

                        // ── Protected: everything else needs JWT ──────────────
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2LoginSuccessHandler))

                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:3001")); // ⚠️ MUST match your frontend
        config.setAllowedMethods(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}