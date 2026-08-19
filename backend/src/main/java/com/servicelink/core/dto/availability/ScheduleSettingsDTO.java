package com.servicelink.core.dto.availability;

import com.servicelink.core.model.common.TimeSlot;

import java.util.Set;

public record ScheduleSettingsDTO(Set<Integer> workingDays, Set<TimeSlot> defaultSlots, Boolean acceptsProOrders) {}