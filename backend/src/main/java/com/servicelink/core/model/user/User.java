package com.servicelink.core.model.user;

import com.servicelink.core.model.auth.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    private String password; // null for Google users

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Builder.Default
    private boolean verified = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // 🔗 One-to-one profile
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private UserProfile profile;

    @Builder.Default
    @Column(nullable = false)
    private boolean is2FAEnabled = false;

    @Column(length = 512)
    private String twoFactorSecret; // Base32 TOTP secret

    @Enumerated(EnumType.STRING)
    private TwoFactorMethod twoFactorMethod;

    @ElementCollection
    @CollectionTable(name = "user_backup_codes", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "code_hash")
    @Builder.Default
    private List<String> backupCodes = new ArrayList<>(); // stored as bcrypt hashes, not plaintext
}