package com.servicelink.core.dto.request.admin;

import lombok.Data;

@Data
public class ScheduleVideoAuditRequestDTO {
    private String meetLink;   // admin pastes this in, created manually in servicelink@1607gmail.com's Calendar
    private String meetDate;   // "yyyy-MM-dd"
    private String meetTime;   // "HH:mm"
    private boolean sendEmail = true;
}