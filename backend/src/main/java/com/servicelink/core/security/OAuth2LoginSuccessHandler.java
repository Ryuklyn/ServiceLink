package com.servicelink.core.security;

import com.servicelink.core.model.auth.AuthProvider;
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

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;

        if (optionalUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setProvider(AuthProvider.GOOGLE);

            UserProfile profile = new UserProfile();
            profile.setFullName(name);
            profile.setProfileImage(picture);
            profile.setUser(user);

            user.setProfile(profile);

            userRepository.save(user);

        } else {
            user = optionalUser.get();

            UserProfile profile = user.getProfile();

            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
                profile.setFullName(name);
            }
            profile.setProfileImage(picture);
            user.setProfile(profile);

            userRepository.save(user);
        }

        // ✅ JWT Claims for the access token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("email", email);
        extraClaims.put("name", user.getProfile().getFullName());
        extraClaims.put("picture", user.getProfile().getProfileImage());
        extraClaims.put("role", user.getRole().name());

        String accessToken = jwtService.generatePurposeToken(extraClaims, email);

        // ✅ Issue + store refresh token, same pattern as AuthService.login()
        String refreshToken = jwtService.generateRefreshToken(email);
        String jti = jwtService.extractJti(refreshToken);
        refreshTokenService.store(email, jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());

        // ✅ Redirect to frontend with both tokens
        response.sendRedirect("http://localhost:3000/dashboard?token=" + accessToken + "&refreshToken=" + refreshToken);
    }
}