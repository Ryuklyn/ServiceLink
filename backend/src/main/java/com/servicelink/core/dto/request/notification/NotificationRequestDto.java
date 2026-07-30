package com.servicelink.core.dto.request.notification;

import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotNull(message = "Recipient role is required")
    private Role recipientRole;

    @NotNull(message = "Category is required")
    private NotificationCategory category;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Message cannot be blank")
    private String message;

    private String actionUrl;
}
