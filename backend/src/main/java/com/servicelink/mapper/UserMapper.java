//package com.servicelink.mapper;
//
//import com.servicelink.core.dto.request.UserRequestDTO;
//import com.servicelink.core.dto.request.RegisterRequestDTO;
//import com.servicelink.core.dto.response.UserResponseDTO;
//import com.servicelink.core.model.User;
//import com.servicelink.core.model.UserProfile;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//public class UserMapper {
//    public static User toEntity(RegisterRequestDTO dto) {
//        User user = new User();
//        user.setEmail(dto.getEmail());
//        user.setPassword(dto.getPassword());
//
//        UserProfile profile = new UserProfile();
//        profile.setFullName(dto.getFullName());
//        profile.setUser(user);
//        user.setProfile(profile);
//
//        return user;
//    }
//
//    public static User toEntity(UserRequestDTO dto) {
//        User user = new User();
//        user.setEmail(dto.getEmail());
//        user.setPassword(dto.getPassword());
//
//        UserProfile profile = new UserProfile();
//        profile.setFullName(dto.getFullName());
//        profile.setUser(user);
//        user.setProfile(profile);
//
//        return user;
//    }
//
//    public static UserResponseDTO toDTO(User user) {
//        UserResponseDTO dto = new UserResponseDTO();
//
//        dto.setId(user.getId());
//        dto.setEmail(user.getEmail());
//        dto.setProvider(
//            user.getProvider() != null ? user.getProvider().name() : null
//        );
//        dto.setVerified(user.isVerified());
//        dto.setCreatedAt(user.getCreatedAt());
//
//        // handle profile safely
//        if (user.getProfile() != null) {
//            dto.setFullName(user.getProfile().getFullName());
//        }
//
//        return dto;
//    }
//
//    public static List<UserResponseDTO> toDTOList(List<User> users) {
//        return users.stream()
//                .map(UserMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//}

package com.servicelink.mapper;

import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;

import java.util.List;
import java.util.stream.Collectors;

// public class UserMapper {

//     public static UserResponseDTO toDTO(User user) {
//         UserResponseDTO dto = new UserResponseDTO();
//         dto.setId(user.getId());
//         dto.setEmail(user.getEmail());
//         dto.setProvider(user.getProvider());
//         dto.setVerified(user.isVerified());
//         dto.setCreatedAt(user.getCreatedAt());

//         // ✅ FIXED: always read name/image from UserProfile, not User directly
//         if (user.getProfile() != null) {
//             dto.setFullName(user.getProfile().getFullName());
//             dto.setProfileImage(user.getProfile().getProfileImage());
//         }

//         return dto;
//     }

//     public static List<UserResponseDTO> toDTOList(List<User> users) {
//         return users.stream().map(UserMapper::toDTO).collect(Collectors.toList());
//     }
// }

public class UserMapper {

    public static UserResponseDTO toDTO(User user) {
        if (user == null) return null;

        UserProfile profile = user.getProfile();

        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .profileImage(profile != null ? profile.getProfileImage() : null)
                .provider(user.getProvider())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
    public static List<UserResponseDTO> toDTOList(List<User> users) {
        return users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }
}