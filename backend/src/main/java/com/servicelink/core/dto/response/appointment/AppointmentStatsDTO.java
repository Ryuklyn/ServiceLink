// com/servicelink/core/dto/response/appointment/AppointmentStatsDTO.java
package com.servicelink.core.dto.response.appointment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentStatsDTO {
    private long total;
    private long pending;
    private long confirmed;
    private long inProgress;
    private long completed;
    private long cancelled;
}
