package com.servicelink.core.dto.request.provider;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProviderProfileDTO {

    @Size(max = 100)
    private String businessName;

    @Size(max = 2000)
    private String bio;

    @Min(0) @Max(100)
    private Integer experienceYears;

    @Size(max = 255)
    private String baseDistrict;

    @Size(max = 1000)
    private String serviceAreaText;

    /** Comma-separated district names e.g. "Kathmandu,Lalitpur,Bhaktapur" */
    @Size(max = 2000)
    private String coveredDistricts;

    private Double latitude;
    private Double longitude;

    @Min(0) @Max(500)
    private Integer travelRadiusKm;
}