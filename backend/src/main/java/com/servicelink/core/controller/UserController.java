package com.servicelink.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.servicelink.core.dto.request.UserRequestDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.service.UserService;
import com.servicelink.mapper.UserMapper;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
//@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserResponseDTO> getUsers() {
        return UserMapper.toDTOList(service.getAllUsers());
    }

    @PutMapping("/{id}")
    public UserResponseDTO update(@PathVariable Long id, @Valid @RequestBody UserRequestDTO userDTO) {
        return UserMapper.toDTO(service.updateProfile(id, userDTO));
    }

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<UserResponseDTO> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(UserMapper.toDTO(service.updateProfileImage(id, image)));
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
