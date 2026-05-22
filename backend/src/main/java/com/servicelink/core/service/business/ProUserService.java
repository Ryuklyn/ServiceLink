package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.mapper.business.ProUserMapper;
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProUserService {

    private final ProUserRepository proUserRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProUserMapper proUserMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ProUserResponse create(ProUserRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Validate password strength (minimum 8 characters)
        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        // Find workspace
        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + request.getWorkspaceId()));

        // Check if pro user already exists for this workspace
        if (proUserRepository.findByWorkspaceId(request.getWorkspaceId()).isPresent()) {
            throw new IllegalArgumentException("Pro user already exists for this workspace");
        }

        // Hash password using BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create and save pro user
        ProUser proUser = proUserMapper.toEntity(request, workspace, hashedPassword);
        ProUser saved = proUserRepository.save(proUser);

        return proUserMapper.toResponse(saved);
    }

    public ProUserResponse findByWorkspaceId(Long workspaceId) {
        ProUser proUser = proUserRepository.findByWorkspaceId(workspaceId)
                .orElseThrow(() -> new RuntimeException("Pro user not found for workspace: " + workspaceId));

        return proUserMapper.toResponse(proUser);
    }

    public ProUserResponse findById(Long id) {
        ProUser proUser = proUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pro user not found: " + id));

        return proUserMapper.toResponse(proUser);
    }
}
