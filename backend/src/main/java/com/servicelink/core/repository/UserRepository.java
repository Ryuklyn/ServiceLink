package com.servicelink.core.repository;

import com.servicelink.core.model.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servicelink.core.model.user.User;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailAndRole(String email, Role role);

    Optional<User> findByEmailAndRole(String email, Role role);

    @Query("""
            select (count(u) > 0) from User u
            join u.profile p
            where p.phoneNumber = :phone and u.role = :role and u.id <> :excludedUserId
            """)
    boolean existsByPhoneAndRoleExcludingUser(@Param("phone") String phone,
                                              @Param("role") Role role,
                                              @Param("excludedUserId") Long excludedUserId);

    List<User> findByRoleIn(Collection<Role> roles);
}
