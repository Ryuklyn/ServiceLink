//
//package com.servicelink.core.model.user;
//
//import com.servicelink.core.model.auth.AuthProvider;
//import jakarta.persistence.*;
//import lombok.Data;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Data
//@Table(name = "users")
//public class User {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String fullName;
//
//    @Column(unique = true, nullable = false)
//    private String email;
//
//    private String password; // null for Google users
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private AuthProvider provider;
//
//    private boolean verified = true;
//
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    // 🔗 One-to-one profile
//    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL,fetch = FetchType.EAGER)
//    private UserProfile profile;
//}


package com.servicelink.core.model.user;

import com.servicelink.core.model.auth.AuthProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
}