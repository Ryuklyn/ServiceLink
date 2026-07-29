package com.servicelink.core.dto.response.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnreadCountDto {
    private long unreadCount;
}
