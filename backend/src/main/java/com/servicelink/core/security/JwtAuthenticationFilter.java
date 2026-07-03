package com.servicelink.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtService.isTokenValid(token, email)) {

                    // NOTE: not every valid JWT belongs to a registered User row.
                    // Provider tokens (issued right after OTP verification, before
                    // the applicant has a full account) carry a valid subject/email
                    // that legitimately has no matching users-table entry yet.
                    // Previously this threw a RuntimeException in that case, which
                    // was silently swallowed below — it "worked" but logged a scary
                    // stack trace on every single request from a not-yet-registered
                    // applicant, and made this behavior easy to lose track of.
                    //
                    // We now look the user up as an Optional: if found, we populate
                    // full Authentication (used by @PreAuthorize, role checks, etc).
                    // If not found, we deliberately leave SecurityContext empty and
                    // fall through — controllers that need to support these callers
                    // (e.g. KycController.resolveIdentifier) read the raw
                    // X-Provider-Token header themselves instead of relying on
                    // Spring Security's Authentication object.
                    Optional<User> maybeUser = userRepository.findByEmail(email);

                    if (maybeUser.isPresent()) {
                        User user = maybeUser.get();

                        List<GrantedAuthority> authorities = new ArrayList<>();
                        String roleStr = user.getRole().name();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleStr));

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        authorities
                                );

                        auth.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        SecurityContextHolder.getContext()
                                .setAuthentication(auth);
                    }
                    // else: valid token, no registered user yet — leave unauthenticated,
                    // no exception, no log spam. Downstream controllers that expect
                    // this case handle it via X-Provider-Token.
                }
            }

        } catch (Exception e) {
            System.out.println("JWT ERROR: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}