package com.servicelink.core.service.notification;

import com.servicelink.core.dto.request.notification.NotificationRequestDto;
import com.servicelink.core.dto.response.notification.NotificationPreferenceResponseDto;
import com.servicelink.core.dto.response.notification.NotificationResponseDto;
import com.servicelink.core.mapper.notification.NotificationMapper;
import com.servicelink.core.model.notification.Notification;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.notification.NotificationPreference;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.NotificationPreferenceRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper notificationMapper;

    @Transactional
    public NotificationResponseDto sendPrivateNotification(NotificationRequestDto request) {
        if (!isEnabled(request.getRecipientId(), request.getCategory())) return null;
        Notification saved = notificationRepository.save(Notification.builder()
                .recipientId(request.getRecipientId()).recipientRole(request.getRecipientRole())
                .category(request.getCategory()).title(request.getTitle()).message(request.getMessage())
                .actionUrl(request.getActionUrl()).isRead(false).build());
        NotificationResponseDto response = notificationMapper.toDto(saved);
        messagingTemplate.convertAndSendToUser(String.valueOf(saved.getRecipientId()), "/queue/notifications", response);
        return response;
    }

    @Transactional
    public NotificationResponseDto sendPrivateNotification(Long recipientId, Role role, NotificationCategory category,
                                                           String title, String message, String actionUrl) {
        return sendPrivateNotification(NotificationRequestDto.builder().recipientId(recipientId).recipientRole(role)
                .category(category).title(title).message(message).actionUrl(actionUrl).build());
    }

    /** Platform updates are individual, persisted inbox events rather than an unaudited public topic. */
    @Transactional
    public void sendPlatformNotificationToRoles(Collection<Role> roles, String title, String message, String actionUrl) {
        for (User user : userRepository.findByRoleIn(roles)) {
            sendPrivateNotification(user.getId(), user.getRole(), NotificationCategory.PLATFORM, title, message, actionUrl);
        }
    }

    public void sendAdminBroadcast(String title, String message, String actionUrl) {
        sendPlatformNotificationToRoles(List.of(Role.ADMIN), title, message, actionUrl);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getUserNotifications(User user, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return notificationRepository.findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(user.getId(), user.getRole(), pageable)
                .map(notificationMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientIdAndRecipientRoleAndIsReadFalse(user.getId(), user.getRole());
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) { notificationRepository.markAsRead(notificationId, user.getId()); }

    @Transactional
    public void markAllAsRead(User user) { notificationRepository.markAllAsRead(user.getId(), user.getRole()); }

    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponseDto> getPreferences(User user) {
        Map<NotificationCategory, Boolean> saved = preferenceRepository.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(NotificationPreference::getCategory, NotificationPreference::isEnabled));
        return Arrays.stream(NotificationCategory.values())
                .map(category -> new NotificationPreferenceResponseDto(category, saved.getOrDefault(category, true))).toList();
    }

    @Transactional
    public NotificationPreferenceResponseDto updatePreference(User user, NotificationCategory category, boolean enabled) {
        NotificationPreference preference = preferenceRepository.findByUserIdAndCategory(user.getId(), category)
                .orElseGet(() -> NotificationPreference.builder().userId(user.getId()).category(category).build());
        preference.setEnabled(enabled);
        preferenceRepository.save(preference);
        return new NotificationPreferenceResponseDto(category, enabled);
    }

    private boolean isEnabled(Long userId, NotificationCategory category) {
        return preferenceRepository.findByUserIdAndCategory(userId, category)
                .map(NotificationPreference::isEnabled).orElse(true);
    }
}
