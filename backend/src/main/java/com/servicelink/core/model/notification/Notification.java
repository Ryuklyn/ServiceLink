package com.servicelink.core.model.notification;
import com.servicelink.core.model.user.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role recipientRole;

    @Enumerated(EnumType.STRING)
    // Keep this as VARCHAR instead of MySQL's native ENUM. Hibernate's schema
    // update does not reliably add newly introduced Java enum constants to an
    // existing MySQL ENUM, which made JOB_TICKET notifications roll back the
    // surrounding job creation transaction.
    @Column(nullable = false, length = 32, columnDefinition = "varchar(32)")
    @Builder.Default
    private NotificationCategory category = NotificationCategory.PLATFORM;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String actionUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
