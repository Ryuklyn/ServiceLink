
package com.servicelink.core.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password; // null for Google users

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private boolean isVerified = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    // 🔗 One-to-one profile
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}