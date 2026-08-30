package com.servicelink.core.dto.response.notification;

import com.servicelink.core.model.notification.NotificationCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NotificationPreferenceResponseDto {
    private NotificationCategory category;
    private boolean enabled;
}
