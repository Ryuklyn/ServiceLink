package com.servicelink.core.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.servicelink.core.dto.request.UserRequestDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.service.UserService;
import com.servicelink.mapper.UserMapper;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
