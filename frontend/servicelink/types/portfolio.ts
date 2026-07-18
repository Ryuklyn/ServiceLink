export type MediaType = "IMAGE" | "VIDEO";

export interface PortfolioMedia {
    id: number;
    url: string;
    type: MediaType;
    displayOrder: number;
}

// Mirrors PortfolioResponseDTO returned by GET/POST /api/providers/me/portfolio
export interface PortfolioProject {
    id: number;
    title: string;
    serviceCategory: string;
    description: string;
    completionDate: string | null; // e.g. "May 2026", already formatted server-side
    location: string;
    photoCount: number;
    hasVideo: boolean;
    media: PortfolioMedia[];
    createdAt: string;
}

// Fields the "Add Portfolio Work" form collects before building FormData
export interface PortfolioFormValues {
    title: string;
    serviceType: string;
    description: string;
    completionDate: string; // yyyy-MM from <input type="month">
    location: string;
    photos: File[];
    video: File | null;
}