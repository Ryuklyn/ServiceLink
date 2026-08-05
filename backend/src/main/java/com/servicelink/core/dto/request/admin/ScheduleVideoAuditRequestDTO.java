package com.servicelink.core.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class ScheduleVideoAuditRequestDTO {
    private Instant scheduledAt;
    private String meetLink;
    private String meetDate;   // "yyyy-MM-dd"
    private String meetTime;   // "HH:mm"
    private boolean sendEmail = true;
}