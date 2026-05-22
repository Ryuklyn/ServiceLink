package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.ProUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProUserRepository extends JpaRepository<ProUser, Long> {

    Optional<ProUser> findByWorkspaceId(Long workspaceId);
}
