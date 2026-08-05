// Raw enum values your backend returns via /api/admin/kyc
export type KycStatusRaw =
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";

// Your existing UI badge bucket — DON'T change, this is shared with onboarding
export type VerificationStatus =
    | "verified"
    | "manual_audit"
    | "pending_kyc"
    | "suspended";

export interface KycListItem {
    id: number;
    referenceNumber: string;
    fullName: string;
    email: string;
    phone: string;
    primaryService: string;
    status: KycStatusRaw | string;
    submittedAt: string;
    photoUrl?: string;
}

export interface KycDetail extends KycListItem {
    dob: string;
    gender: string;
    province: string;
    district: string;
    municipality: string;
    ward: string;
    tole: string;
    otherService?: string;
    additionalServices: string[];
    experienceYears: number;
    primaryDistrict: string;
    secondaryDistricts: string[];
    travelRadius: string;
    bio: string;
    citizenshipFrontPath: string;
    citizenshipBackPath: string;
    photoPath: string;
    panPath: string;
    professionalCertPaths: string[];
    profilePhotoUrl?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    scheduledMeetLink?: string;
    scheduledMeetAt?: string;
}

export interface ScheduleVideoAuditRequest {
    meetDate: string;        // "yyyy-MM-dd"
    meetTime: string;        // "HH:mm"
    meetLink?: string;       // Optional custom Google Meet link override
    sendEmail: boolean;
    sendWhatsApp: boolean;
}

export function toBadgeStatus(raw: string): VerificationStatus {
    switch (raw) {
        case "APPROVED":     return "verified";
        case "UNDER_REVIEW": return "manual_audit";
        case "REJECTED":     return "suspended";
        case "PENDING":
        default:              return "pending_kyc";
    }
}