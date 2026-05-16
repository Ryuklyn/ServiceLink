package com.servicelink.core.dto.request.business;

import com.servicelink.core.model.business.BusinessType;
import com.servicelink.core.model.business.CompanySize;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OrganizationRequest {
    @NotBlank(message = "Company name is required")
    @Size(max = 100)
    private String companyName;

    @NotNull(message = "Business type is required")
    private BusinessType businessType;

    @NotNull(message = "Company size is required")
    private CompanySize companySize;

    @NotBlank(message = "Work Email is required")
    @Email(message = "Invalid email format")
    private String workEmail;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[+]?[0-9]{7,15}$", message = "Invalid phone number")
    private String contactNumber;

}
