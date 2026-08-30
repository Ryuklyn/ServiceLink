package com.servicelink.core.controller.notification;

import com.servicelink.core.dto.request.notification.NotificationRequestDto;
import com.servicelink.core.dto.response.notification.NotificationPreferenceResponseDto;
import com.servicelink.core.dto.response.notification.NotificationResponseDto;
import com.servicelink.core.dto.response.notification.UnreadCountDto;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.notification.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponseDto> createNotification(@Valid @RequestBody NotificationRequestDto request) {
        NotificationResponseDto response = notificationService.sendPrivateNotification(request);
        return response == null ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponseDto>> getNotifications(@AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getUserNotifications(user, page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountDto> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UnreadCountDto(notificationService.getUnreadCount(user)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreferenceResponseDto>> getPreferences(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getPreferences(user));
    }

    @PutMapping("/preferences/{category}")
    public ResponseEntity<NotificationPreferenceResponseDto> updatePreference(@PathVariable NotificationCategory category,
            @RequestParam boolean enabled, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.updatePreference(user, category, enabled));
    }
}
