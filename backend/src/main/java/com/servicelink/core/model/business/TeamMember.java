package com.servicelink.core.model.business;

import com.servicelink.core.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "team_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"workspace_id", "email"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus inviteStatus;

    @Column(unique = true)
    private String inviteToken;

    private Instant invitedAt;
    private Instant lastActiveAt;

    // Linked once the invite is accepted and a real User account is created.
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}