package com.servicelink.core.repository.notification;

import com.servicelink.core.model.notification.Notification;
import com.servicelink.core.model.user.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch paginated notification history for a specific user/provider
    Page<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(
            Long recipientId,
            Role recipientRole,
            Pageable pageable
    );

    // Count unread notifications for navbar badge
    long countByRecipientIdAndRecipientRoleAndIsReadFalse(Long recipientId, Role recipientRole);

    // Mark single notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.recipientId = :recipientId")
    int markAsRead(@Param("id") Long id, @Param("recipientId") Long recipientId);

    // Mark ALL as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.recipientRole = :role")
    int markAllAsRead(@Param("recipientId") Long recipientId, @Param("role") Role role);
}
