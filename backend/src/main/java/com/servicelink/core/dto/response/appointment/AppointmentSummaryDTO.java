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
import com.servicelink.core.model.appointment.AppointmentPaymentMethod;
import com.servicelink.core.model.appointment.AppointmentPaymentStatus;
import com.servicelink.core.model.common.TimeSlot;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class AppointmentSummaryDTO {

    private Long              id;
    private Long              providerId;
    private String            providerPhone;
    private String            providerName;
    private String            providerProfilePicture;
    private String            subServiceName;
    private LocalDate         appointmentDate;
    private TimeSlot          timeSlot;
    private LocalTime         estimatedStartTime;
    private AppointmentStatus status;
    private Integer           totalPrice;
    private Integer           estimatedAmount;
    private Integer           finalAmount;
    private AppointmentPaymentStatus paymentStatus;
    private AppointmentPaymentMethod paymentMethod;
    private List<String> selectedServiceNames;
    private String            address;
    private String            operationalStatus;
    private Integer           hours;
    private Long              serviceCatalogId;
    private LocalDate         previousAppointmentDate;
    private TimeSlot          previousTimeSlot;
    private LocalDateTime     rescheduledAt;

    // ── Customer snapshot — needed by the provider's booking list ──────────
    private String customerName;
    private String customerPhone;
    private String customerProfilePictureUrl;

}
