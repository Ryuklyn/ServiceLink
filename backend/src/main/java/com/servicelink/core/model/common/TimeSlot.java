package com.servicelink.core.model.common;

import java.time.LocalTime;

public enum TimeSlot {
    MORNING("08:00-12:00", LocalTime.of(8, 0), LocalTime.of(12, 0)),
    AFTERNOON("12:00-16:00", LocalTime.of(12, 0), LocalTime.of(16, 0)),
    EVENING("16:00-20:00", LocalTime.of(16, 0), LocalTime.of(20, 0));

    private final String displayRange;
    private final LocalTime startTime;
    private final LocalTime endTime;

    TimeSlot(String displayRange, LocalTime startTime, LocalTime endTime) {
        this.displayRange = displayRange;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getDisplayRange() {
        return displayRange;
    }

    public String getDisplayLabel() {
        return displayRange;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }
}
