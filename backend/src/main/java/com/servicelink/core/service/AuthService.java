//package com.servicelink.core.service;
//
//import com.servicelink.core.dto.request.LoginRequestDTO;
//import com.servicelink.core.dto.request.RegisterRequestDTO;
//import com.servicelink.core.dto.response.AuthResponseDTO;
//import com.servicelink.core.model.AuthProvider;
//import com.servicelink.core.model.User;
//import com.servicelink.core.repository.UserRepository;
//import com.servicelink.core.security.JwtService;
//import com.servicelink.mapper.UserMapper;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@RequiredArgsConstructor
//public class AuthService {
//
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtService jwtService;
//
//    @Transactional
//    public AuthResponseDTO register(RegisterRequestDTO request) {
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already exists");
//        }
//
//        User user = UserMapper.toEntity(request);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        user.setProvider(AuthProvider.LOCAL);
//        user.setVerified(true);
//
//        userRepository.save(user);
//
//        String jwtToken = jwtService.generateToken(user.getEmail());
//
//        AuthResponseDTO response = new AuthResponseDTO();
//        response.setToken(jwtToken);
//        response.setUser(UserMapper.toDTO(user));
//
//        return response;
//    }
//
//    public AuthResponseDTO login(LoginRequestDTO request) {
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (user.getProvider() != AuthProvider.LOCAL) {
//            throw new RuntimeException("Please use " + user.getProvider() + " to login");
//        }
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid password");
//        }
//
//        String jwtToken = jwtService.generateToken(user.getEmail());
//
//        AuthResponseDTO response = new AuthResponseDTO();
//        response.setToken(jwtToken);
//        response.setUser(UserMapper.toDTO(user));
//
//        return response;
//    }
//}

package com.servicelink.core.service;

import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.model.AuthProvider;
import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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

        // ✅ Build user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);

        // ✅ Build profile — fullName set, profileImage null until upload
        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setProfileImage(null); // user will upload later
        profile.setUser(user);
        user.setProfile(profile);

        userRepository.save(user);

        // ✅ Return a response but DO NOT issue JWT — redirect to login instead
        return AuthResponseDTO.builder()
                .message("Registration successful. Please log in.")
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw new IllegalArgumentException("This account uses Google login.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("email", user.getEmail());

        if (user.getProfile() != null) {
            extraClaims.put("name",    user.getProfile().getFullName());
            extraClaims.put("picture", user.getProfile().getProfileImage()); // may be null
        }

        String jwt = jwtService.generateToken(extraClaims, user.getEmail());

        return AuthResponseDTO.builder()
                .token(jwt)
                .email(user.getEmail())
                .fullName(user.getProfile() != null ? user.getProfile().getFullName() : null)
                .profileImage(user.getProfile() != null ? user.getProfile().getProfileImage() : null)
                .requiresProfileImage(
                        user.getProvider() == AuthProvider.LOCAL
                                && (user.getProfile() == null || user.getProfile().getProfileImage() == null)
                )
                .build();
    }
}