package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.appointment.AppointmentPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentPaymentTransactionRepository extends JpaRepository<AppointmentPaymentTransaction, Long> {

    Optional<AppointmentPaymentTransaction> findByReferenceId(String referenceId);

    List<AppointmentPaymentTransaction> findByAppointment_IdOrderByCreatedAtDesc(Long appointmentId);
}
