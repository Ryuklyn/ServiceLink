package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByWorkspaceIdOrderByIdAsc(Long workspaceId);
    Optional<TeamMember> findByInviteToken(String token);
    Optional<TeamMember> findByWorkspaceIdAndEmail(Long workspaceId, String email);
    boolean existsByWorkspaceIdAndEmail(Long workspaceId, String email);
    Optional<TeamMember> findByUser_Id(Long userId); // ← naya
}