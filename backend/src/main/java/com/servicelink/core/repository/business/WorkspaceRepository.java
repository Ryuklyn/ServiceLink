package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOrganizationId(Long orgId);
}
