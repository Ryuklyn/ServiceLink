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

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use.");
        }

        // ✅ Build user and explicitly set default role
        User user = new User();
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(Role.CUSTOMER); // Explicitly ensure standard signups start as CUSTOMER

        // ✅ Build profile — fullName set, profileImage null until upload
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

        // ✅ Cleanly calls updated dual-argument signature packing the role claim
        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        UserProfile profile = user.getProfile();

        return AuthResponseDTO.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .profileImage(profile != null ? profile.getProfileImage() : null)
                .requiresProfileImage(profile == null || profile.getProfileImage() == null)
                .build();
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("RESET EMAIL: [" + email + "]");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}