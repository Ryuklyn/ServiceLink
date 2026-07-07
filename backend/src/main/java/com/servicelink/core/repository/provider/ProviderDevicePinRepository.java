package com.servicelink.core.repository.provider;

import com.servicelink.core.model.provider.ProviderDevicePin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProviderDevicePinRepository extends JpaRepository<ProviderDevicePin, Long> {

    boolean existsByDeviceId(String deviceId);

    Optional<ProviderDevicePin> findByDeviceId(String deviceId);

    Optional<ProviderDevicePin> findByProvider_IdAndDeviceId(Long providerId, String deviceId);

    void deleteByProvider_IdAndDeviceId(Long providerId, String deviceId);
}