package com.servicelink.core.service;

import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.servicelink.core.dto.request.UserRequestDTO;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository repo;

    private static final String UPLOAD_DIR = "uploads/profile-images/";

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

    public User updateProfileImage(Long id, MultipartFile image) {

        // 1️⃣ Validate the file
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty.");
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Uploaded file must be an image.");
        }

        // 2️⃣ Find the user
        User user = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // 3️⃣ Save file to disk
        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate a unique filename to avoid collisions
            String originalFilename = StringUtils.cleanPath(
                    Objects.requireNonNull(image.getOriginalFilename())
            );
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String uniqueFilename = "user_" + id + "_" + UUID.randomUUID() + extension;

            // Write file to disk
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4️⃣ Save the relative URL to the profile
            String imageUrl = "/uploads/profile-images/" + uniqueFilename;

            UserProfile profile = user.getProfile();
            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
                profile.setFullName(""); // fallback, should already exist from registration
            }
            profile.setProfileImage(imageUrl);
            user.setProfile(profile);

            return repo.save(user);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store image file: " + e.getMessage(), e);
        }
    }
}