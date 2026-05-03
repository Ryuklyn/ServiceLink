//package com.servicelink.mapper;
//
//import com.servicelink.core.dto.response.UserResponseDTO;
//import com.servicelink.core.model.User;
//import com.servicelink.core.model.UserProfile;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//public class UserMapper {
//
//    public static UserResponseDTO toDTO(User user) {
//        if (user == null) return null;
//
//        UserProfile profile = user.getProfile();
//
//        return UserResponseDTO.builder()
//                .id(user.getId())
//                .email(user.getEmail())
//                .fullName(profile != null ? profile.getFullName() : null)
//                .profileImage(profile != null ? profile.getProfileImage() : null)
//                .provider(user.getProvider())
//                .verified(user.isVerified())
//                .createdAt(user.getCreatedAt())
//                .build();
//    }
//    public static List<UserResponseDTO> toDTOList(List<User> users) {
//        return users.stream()
//                .map(UserMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//}


package com.servicelink.core.mapper;

import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.model.AuthProvider;
import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequestDTO dto, String encodedPassword) {
        User user = new User();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPassword(encodedPassword);
        user.setProvider(AuthProvider.LOCAL);

        UserProfile profile = new UserProfile();
        profile.setFullName(dto.getFullName());
        profile.setUser(user);
        user.setProfile(profile);

        return user;
    }

    public UserResponseDTO toResponseDTO(User user) {
        UserProfile profile = user.getProfile();
        return UserResponseDTO.builder()
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .profileImage(profile != null ? profile.getProfileImage() : null)
                .build();
    }
}