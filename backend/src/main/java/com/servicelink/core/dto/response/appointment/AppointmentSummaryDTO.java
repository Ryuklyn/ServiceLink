//package com.servicelink.core.dto.response.appointment;
//
//import com.servicelink.core.model.appointment.AppointmentStatus;
//import com.servicelink.core.model.common.TimeSlot;
//import lombok.Builder;
//import lombok.Data;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
//@Data
//@Builder
//public class AppointmentSummaryDTO {
//
//    private Long id;
//    private String providerName;
//    private String providerProfilePicture;
//    private String subServiceName;
//    private LocalDate appointmentDate;
//    private TimeSlot timeSlot;
//    private LocalDateTime estimatedStartTime;
//    private AppointmentStatus status;
//    private Integer totalPrice;
//    private String address;
//}


// com/servicelink/core/dto/response/appointment/AppointmentSummaryDTO.java
package com.servicelink.core.dto.response.appointment;

import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.TimeSlot;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentSummaryDTO {

    private Long              id;
    private String            providerName;
    private String            providerProfilePicture;
    private String            subServiceName;
    private LocalDate         appointmentDate;
    private TimeSlot          timeSlot;
    private LocalTime         estimatedStartTime;
    private AppointmentStatus status;
    private Integer           totalPrice;
    private String            address;

    // ── Customer snapshot — needed by the provider's booking list ──────────
    private String customerName;
    private String customerPhone;
    private String customerProfilePictureUrl;

}
