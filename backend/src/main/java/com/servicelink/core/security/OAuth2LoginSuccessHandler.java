package com.servicelink.core.security;

import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {

            user = new User();
            user.setEmail(email);
            user.setProvider(AuthProvider.GOOGLE);
            user.setRole(Role.CUSTOMER);      // Default role
            user.setVerified(true);

            UserProfile profile = new UserProfile();
            profile.setFullName(name);
            profile.setProfileImage(picture);
            profile.setUser(user);

            user.setProfile(profile);

        } else {

            UserProfile profile = user.getProfile();

            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
            }

            profile.setFullName(name);
            profile.setProfileImage(picture);

            user.setProfile(profile);

            if (user.getRole() == null) {
                user.setRole(Role.CUSTOMER);
            }
        }

        userRepository.save(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("name", user.getProfile().getFullName());
        claims.put("picture", user.getProfile().getProfileImage());
        claims.put("role", user.getRole().name());
        claims.put("provider", user.getProvider().name());

        String accessToken =
                jwtService.generatePurposeToken(claims, user.getEmail());

        String refreshToken =
                jwtService.generateRefreshToken(user.getEmail());

        String jti = jwtService.extractJti(refreshToken);

        refreshTokenService.store(
                user.getEmail(),
                jti,
                refreshToken,
                jwtService.getRefreshTokenExpirationMillis()
        );

        String redirectUrl =
                "http://localhost:3000/oauth/callback"
                        + "?accessToken="
                        + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                        + "&refreshToken="
                        + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}