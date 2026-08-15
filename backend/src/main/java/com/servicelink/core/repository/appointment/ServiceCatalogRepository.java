package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.provider.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {

    // ── Existing Methods ──────────────────────────────────────────────────────

    List<ServiceCatalog> findByCategory_IdAndIsActiveTrueOrderBySubServiceNameAsc(Long categoryId);

    List<ServiceCatalog> findByIsActiveTrueOrderByCategory_NameAscSubServiceNameAsc();

    Optional<ServiceCatalog> findByIdAndIsActiveTrue(Long id);

    boolean existsByCategory_IdAndSubServiceNameIgnoreCase(Long categoryId, String subServiceName);

    List<ServiceCatalog> findAllByOrderByCategory_NameAscSubServiceNameAsc();

    long countByCategory_Id(Long categoryId);

    // ── NEW METHOD: Category Name / Key String based lookup ───────────────────
    /**
     * Search sub-services by Category Name or Alias Key (e.g. "Electrical", "Electrician").
     */
    @Query("SELECT s FROM ServiceCatalog s WHERE s.isActive = true AND " +
            "(LOWER(s.category.name) = LOWER(:categoryName) OR " +
            "LOWER(s.category.name) LIKE LOWER(CONCAT('%', :categoryName, '%')))")
    List<ServiceCatalog> findByCategoryNameOrAlias(@Param("categoryName") String categoryName);
}