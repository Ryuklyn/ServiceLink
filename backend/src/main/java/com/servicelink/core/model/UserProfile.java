package com.servicelink.core.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String profileImage;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}