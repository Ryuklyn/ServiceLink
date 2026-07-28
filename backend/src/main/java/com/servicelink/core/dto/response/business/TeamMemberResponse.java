package com.servicelink.core.dto.response.business;

import com.servicelink.core.model.business.InviteStatus;
import com.servicelink.core.model.business.TeamRole;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class TeamMemberResponse {
    private Long id;
    private String fullName;
    private String email;
    private TeamRole role;
    private InviteStatus inviteStatus;
    private Instant invitedAt;
    private Instant lastActiveAt;
}