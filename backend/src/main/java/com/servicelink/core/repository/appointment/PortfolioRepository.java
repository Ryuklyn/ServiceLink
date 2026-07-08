package com.servicelink.core.repository.appointment;

// com/servicelink/core/repository/provider/PortfolioRepository.java
import com.servicelink.core.model.provider.portfolio.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByProvider_IdOrderByIsPrimaryDescUploadedAtDesc(Long providerId);

    List<Portfolio> findByProvider_IdAndMediaType(Long providerId, Portfolio.MediaType mediaType);

    Optional<Portfolio> findByIdAndProvider_Id(Long id, Long providerId);

    long countByProvider_Id(Long providerId);

    /**
     * Reset all portfolio items for a provider to non-primary,
     * called before setting a new primary.
     */
    @Modifying
    @Query("UPDATE Portfolio p SET p.isPrimary = false WHERE p.provider.id = :providerId")
    void clearPrimaryForProvider(@Param("providerId") Long providerId);
}