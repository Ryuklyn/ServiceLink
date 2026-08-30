package com.servicelink.core.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import com.servicelink.core.model.user.Role;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
//    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Optional for backwards compatibility; omitted requests are CUSTOMER logins.
    private Role role;
}
