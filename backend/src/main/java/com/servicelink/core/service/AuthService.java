package com.servicelink.core.service;

import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.model.AuthProvider;
import com.servicelink.core.model.User;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setVerified(true);

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user.getEmail());
        
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(jwtToken);
        response.setUser(UserMapper.toDTO(user));
        
        return response;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Please use " + user.getProvider() + " to login");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String jwtToken = jwtService.generateToken(user.getEmail());

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(jwtToken);
        response.setUser(UserMapper.toDTO(user));

        return response;
    }
}
