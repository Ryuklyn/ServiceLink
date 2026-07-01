package com.servicelink.core.service;

import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import org.springframework.stereotype.Service;

import java.util.List;

import com.servicelink.core.dto.request.UserRequestDTO;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository repo;
    private final SupabaseStorageService supabaseStorageService;

    public UserService(UserRepository repo, SupabaseStorageService supabaseStorageService) {
        this.repo = repo;
        this.supabaseStorageService = supabaseStorageService;
    }

    // ✅ Get all users
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ✅ Get single user by id
    public User getUserById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    // ✅ Save user (used internally)
    public User save(User user) {
        return repo.save(user);
    }

    // ✅ Update user profile
    public User updateProfile(Long id, UserRequestDTO dto) {
        return repo.findById(id)
                .map(existing -> {
                    if (dto.getEmail() != null) {
                        existing.setEmail(dto.getEmail());
                    }

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

    // ✅ Update profile image — Supabase Storage + MySQL URL
    public User updateProfileImage(Long id, MultipartFile image) {

        User user = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        try {
            // 1️⃣ Supabase मा upload गर्ने (validation SupabaseStorageService भित्रै हुन्छ)
            String imageUrl = supabaseStorageService.uploadFile(image, "profiles");

            // 2️⃣ MySQL profile मा URL save गर्ने
            UserProfile profile = user.getProfile();
            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
            }
            profile.setProfileImage(imageUrl);
            user.setProfile(profile);

            return repo.save(user);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage(), e);
        }
    }

    // ✅ Mark onboarding as seen
    public User markOnboardingSeen(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        profile.setHasSeenOnboarding(true);
        user.setProfile(profile);

        return repo.save(user);
    }
}