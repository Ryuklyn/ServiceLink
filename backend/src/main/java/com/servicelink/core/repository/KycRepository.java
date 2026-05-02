package com.servicelink.core.repository;

import com.servicelink.core.model.KycSubmission;
import com.servicelink.core.model.KycStatus;
import com.servicelink.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KycRepository extends JpaRepository<KycSubmission, Long> {
    Optional<KycSubmission> findByUser(User user);
    Optional<KycSubmission> findByReferenceNumber(String referenceNumber);
    boolean existsByUser(User user);
}