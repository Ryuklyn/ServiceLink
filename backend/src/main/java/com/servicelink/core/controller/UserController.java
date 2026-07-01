package com.servicelink.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.servicelink.core.dto.request.UserRequestDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.UserService;
import com.servicelink.core.mapper.UserMapper;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final UserMapper userMapper; // ✅ inject mapper

    public UserController(UserService service, UserMapper userMapper) {
        this.service = service;
        this.userMapper = userMapper;
    }

    // ✅ Reusable ownership check — self OR admin matra allow garne
    private void verifyOwnership(Long requestedId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isSelf = currentUser.getId().equals(requestedId);

        if (!isAdmin && !isSelf) {
            throw new AccessDeniedException("You are not allowed to access this resource");
        }
    }

    @GetMapping
    public List<UserResponseDTO> getUsers() {
        return service.getAllUsers()
                .stream()
                .map(userMapper::toResponseDTO) // ✅ use instance method
                .toList();
    }

    @PutMapping("/{id}")
    public UserResponseDTO update(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO userDTO,
            Authentication authentication) {

        verifyOwnership(id, authentication);

        return userMapper.toResponseDTO(
                service.updateProfile(id, userDTO)
        );
    }

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<UserResponseDTO> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        verifyOwnership(id, authentication);

        return ResponseEntity.ok(
                userMapper.toResponseDTO(
                        service.updateProfileImage(id, image)
                )
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        verifyOwnership(id, authentication);
        service.deleteById(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        // ✅ Read-only — ownership check jaanabujhera hataako, kina ki provider profile
        // aru user le pani herna milne huna sakxa (public-facing profile view).
        // Restrict garnu paryo bhane, verifyOwnership(id, authentication) thapna sakincha.
        return ResponseEntity.ok(
                userMapper.toResponseDTO(
                        service.getUserById(id)
                )
        );
    }

    // ✅ Onboarding modal dismiss vaepachi call huney endpoint
    @PatchMapping("/{id}/onboarding-seen")
    public ResponseEntity<UserResponseDTO> markOnboardingSeen(
            @PathVariable Long id,
            Authentication authentication) {

        verifyOwnership(id, authentication);

        return ResponseEntity.ok(
                userMapper.toResponseDTO(
                        service.markOnboardingSeen(id)
                )
        );
    }
}