package com.servicelink.core.service;

import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

    // ✅ Update user profile (IMPORTANT: no name in User anymore)
    public User updateProfile(Long id, User updatedUser) {
        return repo.findById(id)
                .map(existing -> {

                    // 🔹 Update email (optional, careful in real apps)
                    if (updatedUser.getEmail() != null) {
                        existing.setEmail(updatedUser.getEmail());
                    }

                    // 🔹 Update profile fields
                    if (updatedUser.getProfile() != null) {
                        UserProfile existingProfile = existing.getProfile();

                        if (existingProfile == null) {
                            existingProfile = new UserProfile();
                            existingProfile.setUser(existing);
                        }

                        UserProfile newProfile = updatedUser.getProfile();

                        if (newProfile.getFullName() != null) {
                            existingProfile.setFullName(newProfile.getFullName());
                        }

                        if (newProfile.getProfileImage() != null) {
                            existingProfile.setProfileImage(newProfile.getProfileImage());
                        }

                        existing.setProfile(existingProfile);
                    }

                    return repo.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found with id " + id));
    }

    // ✅ Delete user
    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}