package com.servicelink.core.repository.provider.pin;

import com.servicelink.core.model.provider.pin.ProviderDevicePin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProviderDevicePinRepository extends JpaRepository<ProviderDevicePin, Long> {

    boolean existsByDeviceId(String deviceId);

    Optional<ProviderDevicePin> findByDeviceId(String deviceId);

    Optional<ProviderDevicePin> findByProvider_IdAndDeviceId(Long providerId, String deviceId);

    void deleteByProvider_IdAndDeviceId(Long providerId, String deviceId);

    boolean existsByProvider_Id(Long providerId);

    Optional<ProviderDevicePin> findFirstByProvider_Id(Long providerId);

    java.util.List<ProviderDevicePin> findByProvider_Id(Long providerId);
}