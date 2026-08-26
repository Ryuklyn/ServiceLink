import api from "@/utils/axios";

export interface ProJobTicketResponse {
  id: number;
  reference: string;
  title: string;
  serviceCatalogId: number;
  category: string;
  service: string;
  workersRequired: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string;
  instructions: string;
  pricingModel: "PER_DAY" | "PER_JOB";
  businessPrice: number;
  providerEarning: number;
  status: "REQUESTED" | "ASSIGNING" | "PARTIALLY_ASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "UNFULFILLED";
  createdAt: string;
}

export interface ProJobDetailResponse extends ProJobTicketResponse {
  latitude: number;
  longitude: number;
  assignments: {
    providerId: number;
    fullName: string;
    businessName: string;
    profilePictureUrl: string | null;
  }[];
  billing: {
    id: number;
    estimatedAmount: number;
    finalAmount: number;
    paymentStatus: string;
    transactionId: string | null;
    paymentMethod: string | null;
    paymentDate: string | null;
    invoiceNumber: string | null;
  } | null;
  attendance: {
    id: number;
    providerId: number;
    providerName: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    latitude: number | null;
    longitude: number | null;
    distanceFromJob: number | null;
    locationVerified: boolean;
    rejectionReason: string | null;
  }[];
  sla: {
    id: number;
    providerId: number;
    providerName: string;
    expectedArrival: string;
    actualArrival: string | null;
    arrivalDifferenceMinutes: number | null;
    complianceStatus: string;
  }[];
}

export interface ProEligibleProviderResponse {
  providerId: number;
  fullName: string;
  businessName: string;
  primaryCategoryName: string;
  averageRating: number;
  profilePictureUrl: string | null;
  available: boolean;
  location: string;
}

export interface ProKpiDashboardResponse {
  activeProviders: number;
  pendingApprovals: number;
  jobsThisMonth: number;
  jobsInProgress: number;
  slaComplianceRate: number;
  monthlySpend: number;
  expectedToday: number;
  presentToday: number;
  lateToday: number;
  missingToday: number;
}

export interface ProSlaDashboardResponse {
  overallCompliance: number;
  avgResponseTime: string;
  overdueJobs: number;
  cancelRate: number;
  trend: { month: string; value: number }[];
  categories: { label: string; value: number; color: string }[];
  providers: {
    provider: string;
    category: string;
    totalJobs: number;
    onTime: number;
    breaches: number;
    status: string;
  }[];
}

export interface ProBillingDashboardResponse {
  totalBudget: number;
  spent: number;
  pending: number;
  remaining: number;
  invoices: {
    id: string;
    provider: string;
    service: string;
    amount: number;
    status: string;
    dueDate: string;
  }[];
}

export interface ProComplianceDashboardResponse {
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  providers: {
    name: string;
    category: string;
    status: string;
    joinedDate: string;
  }[];
  auditLogs: {
    timestamp: string;
    action: string;
    subject: string;
    performedBy: string;
    status: string;
  }[];
}

export const proJobService = {
  getJobs: async (status?: string, page = 0, size = 20): Promise<{ content: ProJobTicketResponse[]; totalElements: number }> => {
    const params: Record<string, any> = { page, size };
    if (status) params.status = status;
    const { data } = await api.get("/pro/jobs", { params });
    return data;
  },

  createJob: async (jobData: Partial<ProJobTicketResponse>): Promise<ProJobTicketResponse> => {
    const { data } = await api.post("/pro/jobs", jobData);
    return data;
  },

  getJobDetails: async (id: number): Promise<ProJobDetailResponse> => {
    const { data } = await api.get(`/pro/jobs/${id}`);
    return data;
  },

  getEligibleProviders: async (id: number): Promise<ProEligibleProviderResponse[]> => {
    const { data } = await api.get(`/pro/jobs/${id}/eligible-providers`);
    return data;
  },

  assignProvider: async (jobId: number, providerId: number): Promise<void> => {
    await api.post(`/pro/jobs/${jobId}/assign`, null, { params: { providerId } });
  },

  unassignProvider: async (jobId: number, providerId: number): Promise<void> => {
    await api.post(`/pro/jobs/${jobId}/unassign`, null, { params: { providerId } });
  },

  completeJob: async (jobId: number): Promise<void> => {
    await api.post(`/pro/jobs/${jobId}/complete`);
  },

  getKpiDashboard: async (): Promise<ProKpiDashboardResponse> => {
    const { data } = await api.get("/pro/jobs/kpi-dashboard");
    return data;
  },

  getSlaDashboard: async (): Promise<ProSlaDashboardResponse> => {
    const { data } = await api.get("/pro/jobs/sla-dashboard");
    return data;
  },

  getBillingDashboard: async (): Promise<ProBillingDashboardResponse> => {
    const { data } = await api.get("/pro/jobs/billing-dashboard");
    return data;
  },

  getComplianceDashboard: async (): Promise<ProComplianceDashboardResponse> => {
    const { data } = await api.get("/pro/jobs/compliance-dashboard");
    return data;
  },
};
