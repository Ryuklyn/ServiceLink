package com.servicelink.core.model.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String fullName;
    private String profileImage;
    private String phoneNumber;

    @Builder.Default
    private boolean phoneVerified = false;

    @Builder.Default
    private boolean hasSeenOnboarding = false;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}