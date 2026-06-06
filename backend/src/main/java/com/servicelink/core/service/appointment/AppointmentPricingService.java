// com/servicelink/core/service/appointment/AppointmentPricingService.java
package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentRequestDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog.PricingUnit;
import org.springframework.stereotype.Service;

@Service
public class AppointmentPricingService {

    /**
     * Calculates total price in NPR based on the pricing unit.
     * Validates that the required quantity field is present before computing.
     */
    public int calculateTotalPrice(ProviderService ps, AppointmentRequestDTO req) {
        int         unitPrice = ps.getCustomPrice();
        PricingUnit unit      = ps.getCatalogItem().getPricingUnit();

        return switch (unit) {
            case PER_JOB  -> unitPrice;

            case PER_SQFT -> {
                if (req.getAreaSqFt() == null || req.getAreaSqFt() <= 0)
                    throw new BusinessException(
                            "areaSqFt is required for PER_SQFT services", "MISSING_QUANTITY");
                yield unitPrice * req.getAreaSqFt();
            }

            case PER_WALL -> {
                if (req.getWallCount() == null || req.getWallCount() <= 0)
                    throw new BusinessException(
                            "wallCount is required for PER_WALL services", "MISSING_QUANTITY");
                yield unitPrice * req.getWallCount();
            }

            case PER_ITEM -> {
                if (req.getItemCount() == null || req.getItemCount() <= 0)
                    throw new BusinessException(
                            "itemCount is required for PER_ITEM services", "MISSING_QUANTITY");
                yield unitPrice * req.getItemCount();
            }
        };
    }
}
