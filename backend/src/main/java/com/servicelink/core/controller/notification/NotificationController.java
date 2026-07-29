package com.servicelink.core.controller.notification;

import com.servicelink.core.dto.request.notification.NotificationRequestDto;
import com.servicelink.core.dto.response.notification.NotificationResponseDto;
import com.servicelink.core.dto.response.notification.UnreadCountDto;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.service.notification.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Manual endpoint (typically for Admins/ServiceLink Pro) to dispatch custom notifications.
     * POST /api/v1/notifications
     */
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(@Valid @RequestBody NotificationRequestDto requestDto) {
        NotificationResponseDto response = notificationService.sendPrivateNotification(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get paginated notifications history for dashboard view.
     * GET /api/v1/notifications?recipientId=10&role=CUSTOMER&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDto>> getNotifications(
            @RequestParam Long recipientId,
            @RequestParam Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<NotificationResponseDto> notifications = notificationService.getUserNotifications(recipientId, role, page, size);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get real-time unread count for navbar badges.
     * GET /api/v1/notifications/unread-count?recipientId=10&role=CUSTOMER
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountDto> getUnreadCount(
            @RequestParam Long recipientId,
            @RequestParam Role role) {

        long count = notificationService.getUnreadCount(recipientId, role);
        return ResponseEntity.ok(new UnreadCountDto(count));
    }

    /**
     * Mark a specific notification as read.
     * PATCH /api/v1/notifications/5/read?recipientId=10
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestParam Long recipientId) {

        notificationService.markAsRead(id, recipientId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all notifications as read for current active user.
     * PATCH /api/v1/notifications/read-all?recipientId=10&role=CUSTOMER
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam Long recipientId,
            @RequestParam Role role) {

        notificationService.markAllAsRead(recipientId, role);
        return ResponseEntity.noContent().build();
    }
}
