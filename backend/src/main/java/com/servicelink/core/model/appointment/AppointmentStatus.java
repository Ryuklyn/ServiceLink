// com/servicelink/core/model/appointment/AppointmentStatus.java
package com.servicelink.core.model.appointment;

import java.util.EnumSet;
import java.util.Set;

public enum AppointmentStatus {

    PENDING {
        @Override
        public Set<AppointmentStatus> allowedTransitions() {
            return EnumSet.of(CONFIRMED, CANCELLED);
        }
    },
    CONFIRMED {
        @Override
        public Set<AppointmentStatus> allowedTransitions() {
            return EnumSet.of(IN_PROGRESS, CANCELLED);
        }
    },
    IN_PROGRESS {
        @Override
        public Set<AppointmentStatus> allowedTransitions() {
            return EnumSet.of(COMPLETED, CANCELLED);
        }
    },
    COMPLETED {
        @Override
        public Set<AppointmentStatus> allowedTransitions() {
            return EnumSet.noneOf(AppointmentStatus.class);
        }
    },
    CANCELLED {
        @Override
        public Set<AppointmentStatus> allowedTransitions() {
            return EnumSet.noneOf(AppointmentStatus.class);
        }
    };

    public abstract Set<AppointmentStatus> allowedTransitions();

    public boolean canTransitionTo(AppointmentStatus next) {
        return allowedTransitions().contains(next);
    }

    /** True if the appointment is in a terminal (non-modifiable) state */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }

    /** True if this appointment is still actionable by the provider */
    public boolean isActive() {
        return this == PENDING || this == CONFIRMED || this == IN_PROGRESS;
    }
}
