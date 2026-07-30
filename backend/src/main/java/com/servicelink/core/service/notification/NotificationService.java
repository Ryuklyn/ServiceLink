package com.servicelink.core.service.notification;

import com.servicelink.core.dto.request.notification.NotificationRequestDto;
import com.servicelink.core.dto.response.notification.NotificationResponseDto;
import com.servicelink.core.mapper.notification.NotificationMapper;
import com.servicelink.core.model.notification.Notification;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.user.Role;

import com.servicelink.core.repository.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper notificationMapper;

    /**
     * Primary method to trigger targeted private notifications.
     * Saves to MySQL first, then pushes real-time event via WebSockets.
     */
    @Transactional
    public NotificationResponseDto sendPrivateNotification(NotificationRequestDto requestDto) {
        Notification notification = Notification.builder()
                .recipientId(requestDto.getRecipientId())
                .recipientRole(requestDto.getRecipientRole())
                .category(requestDto.getCategory())
                .title(requestDto.getTitle())
                .message(requestDto.getMessage())
                .actionUrl(requestDto.getActionUrl())
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponseDto responseDto = notificationMapper.toDto(savedNotification);

        // Real-time STOMP Push to /user/{recipientId}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                String.valueOf(requestDto.getRecipientId()),
                "/queue/notifications",
                responseDto
        );

        return responseDto;
    }

    /**
     * Convenience helper method for internal cross-service calls (e.g., AppointmentService, SubscriptionService).
     */
    @Transactional
    public NotificationResponseDto sendPrivateNotification(Long recipientId, Role role, NotificationCategory category, String title, String message, String actionUrl) {
        NotificationRequestDto requestDto = NotificationRequestDto.builder()
                .recipientId(recipientId)
                .recipientRole(role)
                .category(category)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .build();

        return sendPrivateNotification(requestDto);
    }

    /**
     * Broadcasts global real-time notifications to ServiceLink Pro Admins.
     */
    public void sendAdminBroadcast(String title, String message, String actionUrl) {
        NotificationResponseDto responseDto = NotificationResponseDto.builder()
                .recipientRole(Role.ADMIN)
                .category(NotificationCategory.PLATFORM)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .build();

        // Broadcast to channel: /topic/admin-alerts
        messagingTemplate.convertAndSend("/topic/admin-alerts", responseDto);
    }

    /**
     * Fetches paginated notification history for the specified user/provider dashboard.
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getUserNotifications(Long recipientId, Role role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository
                .findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(recipientId, role, pageable)
                .map(notificationMapper::toDto);
    }

    /**
     * Returns total unread notification count for badge counters.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId, Role role) {
        return notificationRepository.countByRecipientIdAndRecipientRoleAndIsReadFalse(recipientId, role);
    }

    /**
     * Marks a single notification item as read.
     */
    @Transactional
    public void markAsRead(Long notificationId, Long recipientId) {
        notificationRepository.markAsRead(notificationId, recipientId);
    }

    /**
     * Marks all notifications as read for the recipient.
     */
    @Transactional
    public void markAllAsRead(Long recipientId, Role role) {
        notificationRepository.markAllAsRead(recipientId, role);
    }
}