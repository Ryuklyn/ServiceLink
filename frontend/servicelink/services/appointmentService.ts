import api from "@/utils/axios";

export interface AppointmentSummary {
    id: number;
    providerName: string;
    providerProfilePicture: string | null;
    subServiceName: string;
    appointmentDate: string;
    timeSlot: "MORNING" | "AFTERNOON" | "EVENING";
    estimatedStartTime: string;
    status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    totalPrice: number;
    address: string;
}

export interface AppointmentPage {
    content: AppointmentSummary[];
    totalElements: number;
    totalPages: number;
    number: number;
}

export const appointmentService = {
    getMyAppointments: async (
        status?: string,
        page = 0,
        size = 10
    ): Promise<AppointmentPage> => {
        const params: Record<string, any> = { page, size };
        if (status) params.status = status;
        const { data } = await api.get("/appointments", { params });
        return data;
    },

    cancelAppointment: async (id: number, reason?: string): Promise<void> => {
        await api.patch(`/appointments/${id}/cancel`, null, {
            params: reason ? { reason } : {},
        });
    },
};