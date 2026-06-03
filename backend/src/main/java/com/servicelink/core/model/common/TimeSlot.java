package com.servicelink.core.model.common;

public enum TimeSlot {
    MORNING("08:00-12:00"),
    AFTERNOON("12:00-16:00"),
    EVENING("16:00-20:00");

    private final String displayRange;


    TimeSlot(String displayRange) {
        this.displayRange = displayRange;
    }

    public String getDisplayRange() {
        return displayRange;
    }
}
