package com.servicelink.core.service;

import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import com.servicelink.core.dto.request.UserRequestDTO;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // ✅ Get all users
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ✅ Save user (used internally)
    public User save(User user) {
        return repo.save(user);
    }

    // ✅ Update user profile
    public User updateProfile(Long id, UserRequestDTO dto) {
        return repo.findById(id)
                .map(existing -> {

                    // 🔹 Update email
                    if (dto.getEmail() != null) {
                        existing.setEmail(dto.getEmail());
                    }

                    // 🔹 Update profile
                    UserProfile profile = existing.getProfile();
                    if (profile == null) {
                        profile = new UserProfile();
                        profile.setUser(existing);
                    }

                    if (dto.getFullName() != null) {
                        profile.setFullName(dto.getFullName());
                    }
                    
                    existing.setProfile(profile);
                    return repo.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found with id " + id));
    }

    // ✅ Delete user
    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}