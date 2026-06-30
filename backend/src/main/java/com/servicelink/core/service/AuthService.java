package com.servicelink.core.service;

import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use.");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(Role.CUSTOMER);

        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setProfileImage(null);
        profile.setUser(user);
        user.setProfile(profile);

        userRepository.save(user);

        return AuthResponseDTO.builder()
                .message("Registration successful. Please log in.")
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        String jti = jwtService.extractJti(refreshToken);
        refreshTokenService.store(
                user.getEmail(),
                jti,
                refreshToken,
                jwtService.getRefreshTokenExpirationMillis()
        );

        UserProfile profile = user.getProfile();

        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .profileImage(profile != null ? profile.getProfileImage() : null)
                .requiresProfileImage(profile == null || profile.getProfileImage() == null)
                .build();
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(email);  // new: kills all sessions on password reset
    }
}