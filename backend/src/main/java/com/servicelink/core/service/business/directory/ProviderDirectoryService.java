package com.servicelink.core.service.business.directory;

import com.servicelink.core.dto.response.business.pool.ProviderDirectoryCardDTO;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.repository.business.ProviderPoolEntryRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.business.pool.ProviderPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderDirectoryService {

    private final ProviderRepository providerRepository;
    private final ProviderPoolEntryRepository poolEntryRepository;
    private final ProviderPoolService providerPoolService;

    public List<ProviderDirectoryCardDTO> listEligibleForOrganization(Long organizationId, String category, String search) {
        Set<Long> alreadyPooled = Set.copyOf(poolEntryRepository.findProviderIdsByOrganizationId(organizationId));

        List<Provider> candidates = (category == null || category.isBlank())
                ? providerRepository.findAll()
                : providerRepository.findAllByPrimaryCategory_Name(category);

        return candidates.stream()
                .filter(providerPoolService::computeProOrdersEligible)
                .filter(p -> matchesSearch(p, search))
                .map(p -> toCard(p, alreadyPooled.contains(p.getId())))
                .toList();
    }

    private boolean matchesSearch(Provider p, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        return (p.getFullName() != null && p.getFullName().toLowerCase().contains(q))
                || (p.getBusinessName() != null && p.getBusinessName().toLowerCase().contains(q))
                || (p.getPrimaryCategoryName() != null && p.getPrimaryCategoryName().toLowerCase().contains(q));
    }

    private ProviderDirectoryCardDTO toCard(Provider p, boolean alreadyInPool) {
        return ProviderDirectoryCardDTO.builder()
                .providerId(p.getId())
                .fullName(p.getFullName())
                .businessName(p.getBusinessName())
                .primaryCategoryName(p.getPrimaryCategoryName())
                .specializesIn(specializesIn(p))
                .profilePictureUrl(p.getProfilePictureUrl())
                .averageRating(p.getAverageRating())
                .responseTimeLabel(responseTimeLabel(p.getAvgResponseMinutes()))
                .location(p.getBaseDistrict() != null ? p.getBaseDistrict() : p.getServiceAreaText())
                .totalJobs(p.getTotalJobs())
                .isVerified(Boolean.TRUE.equals(p.getIsVerified()))
                .alreadyInPool(alreadyInPool)
                .build();
    }

    /**
     * "Specializes in" is the provider's own listed sub-services (structured
     * service claim from their service catalogue), not their bio. Picks up to
     * 2 active sub-service names off ProviderService -> ServiceCatalog,
     * most-recently-added first.
     *
     * NOTE: Provider.services is LAZY-loaded. When listing many providers here,
     * calling p.getServices() on each will cause N+1 queries. This is acceptable
     * for small result sets but should be optimized with a JOIN FETCH query on
     * ProviderRepository once under real load:
     *   `left join fetch p.services s left join fetch s.catalogItem`
     */
    private String specializesIn(Provider p) {
        if (p.getServices() == null || p.getServices().isEmpty()) {
            return null;
        }
        String joined = p.getServices().stream()
                .filter(ps -> Boolean.TRUE.equals(ps.getIsAvailable()))
                .map(ps -> ps.getCatalogItem() != null ? ps.getCatalogItem().getSubServiceName() : null)
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .limit(2)
                .collect(Collectors.joining(", "));
        return joined.isBlank() ? null : joined;
    }

    private String responseTimeLabel(Integer avgResponseMinutes) {
        if (avgResponseMinutes == null) return "Not enough data";
        if (avgResponseMinutes <= 30) return "Under 30 mins";
        if (avgResponseMinutes <= 60) return "Under 1 hour";
        if (avgResponseMinutes <= 120) return "Under 2 hours";
        if (avgResponseMinutes <= 180) return "Under 3 hours";
        if (avgResponseMinutes <= 240) return "Under 4 hours";
        return "Over 4 hours";
    }
}
