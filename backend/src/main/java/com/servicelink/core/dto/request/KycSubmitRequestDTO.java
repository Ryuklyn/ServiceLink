// KycSubmitRequestDTO.java
package com.servicelink.core.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class KycSubmitRequestDTO {

    private String applicantIdentifier; // ← add this

    // Personal
    private String fullName;
    private String dob;
    private String gender;
    private String phone;
    private String email;

    // Address
    private String province;
    private String district;
    private String municipality;
    private String ward;
    private String tole;

    // Professional
    private String primaryService;
    private String otherService;
    private List<String> additionalServices;
    private Integer experienceYears;
    private String primaryDistrict;
    private List<String> secondaryDistricts;
    private String travelRadius;
    private String bio;
    // Files come separately as MultipartFile parameters
}