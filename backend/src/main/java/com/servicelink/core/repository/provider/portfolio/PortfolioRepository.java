package com.servicelink.core.repository.provider.portfolio;

import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.portfolio.PortfolioMedia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    // Paginated fetch — used by PortfolioService.getProjects()
    Page<Portfolio> findByProviderId(Long providerId, Pageable pageable);

    // Non-paginated variant, newest project first — useful for e.g. a
    // "recent work" widget that doesn't need pagination controls
    List<Portfolio> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    // Projects that contain at least one media item of the given type
    // (replaces the old findByProvider_IdAndMediaType, which assumed a
    // single mediaType directly on Portfolio — a project can now hold
    // both photos and a video, so this traverses the media relation instead)
    List<Portfolio> findByProviderIdAndMedia_MediaType(Long providerId, PortfolioMedia.MediaType mediaType);

    Optional<Portfolio> findByIdAndProviderId(Long id, Long providerId);

    long countByProviderId(Long providerId);

    boolean existsByIdAndProviderId(Long id, Long providerId);

    // NOTE: the old file's clearPrimaryForProvider() and the
    // isPrimary-ordered query are intentionally left out — Portfolio has
    // no isPrimary field in the current schema. If you want a "featured
    // project" concept back, decide where it belongs (project-level
    // isPrimary on Portfolio, or a cover-photo flag on PortfolioMedia)
    // and I'll add the entity field + this query together.
}