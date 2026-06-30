package com.servicelink.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.servicelink.core.dto.request.UserRequestDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
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
            @Valid @RequestBody UserRequestDTO userDTO) {

        return userMapper.toResponseDTO(
                service.updateProfile(id, userDTO)
        );
    }

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<UserResponseDTO> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {

        return ResponseEntity.ok(
                userMapper.toResponseDTO(
                        service.updateProfileImage(id, image)
                )
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                userMapper.toResponseDTO(
                        service.getUserById(id)
                )
        );
    }
}