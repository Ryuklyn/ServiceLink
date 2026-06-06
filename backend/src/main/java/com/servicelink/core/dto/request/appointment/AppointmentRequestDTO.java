//package com.servicelink.core.dto.request.appointment;
//
//import com.servicelink.core.model.appointment.AppointmentStatus;
//import com.servicelink.core.model.common.TimeSlot;
//import jakarta.validation.constraints.Future;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import lombok.Data;
//
//import java.time.LocalDateTime;
//
//@Data
//public class AppointmentRequestDTO {
//
//    @NotNull(message = "Provider is required")
//    private Long providerId;
//
//    @NotNull (message = "Service is required")
//    private Long serviceCatalogId;
//
//    @NotNull(message = "Appointment date is required")
//    @Future(message = "Appointment date must be in future")
//    private LocalDateTime appointmentDate;
//
//    @NotNull(message = "Time slot is required")
//    private TimeSlot timeSlot;
//
//    @NotBlank(message = "Address is required")
//    private String address;
//
//    private String notes;
//    private String attachedImgUrl;
//    private String attachedVideoUrl;
//
//    /** Required when pricingUnit = PER_SQFT (e.g. full room painting) */
//    private Integer areaSqFt;
//
//    /** Required when pricingUnit = PER_WALL (e.g. wall touch-up) */
//    private Integer wallCount;
//
//    /** Required when pricingUnit = PER_ITEM (e.g. fan installation × 3) */
//    private Integer itemCount;
//
//}

// com/servicelink/core/dto/request/appointment/AppointmentRequestDTO.java
package com.servicelink.core.dto.request.appointment;

import com.servicelink.core.model.common.TimeSlot;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequestDTO {

    @NotNull(message = "Provider is required")
    private Long providerId;

    @NotNull(message = "Service is required")
    private Long serviceCatalogId;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Time slot is required")
    private TimeSlot timeSlot;

    @NotBlank(message = "Address is required")
    @Size(max = 512, message = "Address must not exceed 512 characters")
    private String address;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    @Size(max = 1024)
    private String attachedImgUrl;

    @Size(max = 1024)
    private String attachedVideoUrl;

    /** Required when pricingUnit = PER_SQFT (e.g. full room painting) */
    @Min(value = 1, message = "Area must be at least 1 sq ft")
    private Integer areaSqFt;

    /** Required when pricingUnit = PER_WALL (e.g. wall touch-up) */
    @Min(value = 1, message = "Wall count must be at least 1")
    private Integer wallCount;

    /** Required when pricingUnit = PER_ITEM (e.g. fan installation x 3) */
    @Min(value = 1, message = "Item count must be at least 1")
    private Integer itemCount;
}
