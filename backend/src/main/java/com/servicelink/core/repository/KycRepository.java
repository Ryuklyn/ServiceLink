package com.servicelink.core.repository;

import com.servicelink.core.model.KycSubmission;
import com.servicelink.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KycRepository extends JpaRepository<KycSubmission, Long> {

    Optional<KycSubmission> findByUser(User user);

    Optional<KycSubmission> findByReferenceNumber(String referenceNumber);

    /** Find by phone (E.164) or email — the identifier used at OTP verification. */
    Optional<KycSubmission> findByApplicantIdentifier(String applicantIdentifier);

    boolean existsByUser(User user);

    boolean existsByApplicantIdentifier(String applicantIdentifier);
}