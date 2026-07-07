package com.servicelink.core.repository;

import com.servicelink.core.model.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import com.servicelink.core.model.user.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndRole(String email, Role role);
}