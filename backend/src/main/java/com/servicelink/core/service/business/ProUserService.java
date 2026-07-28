package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.mapper.business.ProUserMapper;
import com.servicelink.core.model.auth.AuthProvider; // adjust to your actual package/enum name
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final ProUserMapper proUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final BusinessRegistrationSessionService businessRegistrationSessionService;

    @Transactional
    public ProUserResponse create(ProUserRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + request.getWorkspaceId()));

        if (proUserRepository.findByWorkspaceId(request.getWorkspaceId()).isPresent()) {
            throw new IllegalArgumentException("Pro user already exists for this workspace");
        }

        // The org's workEmail (captured at signup Step 1) becomes this admin's login email.
        String email = workspace.getOrganization().getWorkEmail();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "This email is already registered with a different account type. " +
                            "Please use a different email address to register your business.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create the account/credential record — same pattern already used
        // for Provider signup elsewhere in the codebase.
        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(hashedPassword)
                .provider(AuthProvider.LOCAL)
                .role(Role.PRO)
                .verified(true)
                .build();

        User savedUser = userRepository.save(user);

        // ProUser is the workspace-scoped profile, linked to that account.
        ProUser proUser = ProUser.builder()
                .fullName(request.getFullName().trim())
                .user(savedUser)
                .workspace(workspace)
                .build();

        ProUser saved = proUserRepository.save(proUser);

        businessRegistrationSessionService.updateStep(
                workspace.getOrganization().getId(), "ADMIN", workspace.getId(), saved.getId(), null);

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