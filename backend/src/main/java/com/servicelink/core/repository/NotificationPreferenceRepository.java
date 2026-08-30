package com.servicelink.core.repository;

import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.notification.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserIdAndCategory(Long userId, NotificationCategory category);
    List<NotificationPreference> findByUserId(Long userId);
}
