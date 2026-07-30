package com.servicelink.core.dto.response.notification;

import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private Long recipientId;
    private Role recipientRole;
    private NotificationCategory category;
    private String title;
    private String message;
    private String actionUrl;
    private boolean isRead;
    private LocalDateTime createdAt;
}