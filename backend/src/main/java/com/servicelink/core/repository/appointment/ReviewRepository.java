package com.servicelink.core.repository.appointment;

// com/servicelink/core/repository/provider/ReviewRepository.java
import com.servicelink.core.model.provider.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Paged reviews for a provider — public-facing (newest first).
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.customer
            WHERE r.provider.id = :providerId
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findByProviderIdWithCustomer(
            @Param("providerId") Long providerId,
            Pageable pageable);

    /**
     * Most recent N reviews for the profile snapshot.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.customer
            WHERE r.provider.id = :providerId
            ORDER BY r.createdAt DESC
            LIMIT :limit
            """)
    List<Review> findTopByProviderId(
            @Param("providerId") Long providerId,
            @Param("limit") int limit);

    /**
     * Check whether the customer has already reviewed a specific appointment.
     * Prevents duplicate reviews per appointment.
     */
    boolean existsByCustomer_IdAndAppointmentId(Long customerId, Long appointmentId);

    /**
     * All reviews written by a customer (for their own history screen).
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.provider
            WHERE r.customer.id = :customerId
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findByCustomerIdWithProvider(
            @Param("customerId") Long customerId,
            Pageable pageable);

    /**
     * Optional: find a specific review by customer + provider for display.
     */
    Optional<Review> findByCustomer_IdAndProvider_Id(Long customerId, Long providerId);
}
