import api from "@/utils/axios"; // ⚠️ adjust this path if your alias differs
import type { PortfolioProject, PortfolioFormValues } from "@/types/portfolio";

// api's baseURL already ends in "/api" (see utils/axios.ts), so paths here
// are relative to that, matching the ProviderController mapping:
// @RequestMapping("/api/providers") + "/me/portfolio"
const BASE = "/providers/me/portfolio";

function buildPortfolioFormData(values: PortfolioFormValues): FormData {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("serviceType", values.serviceType);
    formData.append("description", values.description);
    if (values.completionDate) formData.append("completionDate", values.completionDate);
    if (values.location) formData.append("location", values.location);

    values.photos.forEach((photo) => {
        formData.append("photos", photo); // repeated key -> List<MultipartFile> photos
    });

    if (values.video) {
        formData.append("video", values.video);
    }

    return formData;
}

/** GET /api/providers/me/portfolio — returns the full list (max 10 projects), no pagination server-side. */
export async function fetchMyPortfolio(): Promise<PortfolioProject[]> {
    const { data } = await api.get<PortfolioProject[]>(BASE);
    return data;
}

/** POST /api/providers/me/portfolio (multipart/form-data) */
export async function createPortfolioProject(
    values: PortfolioFormValues
): Promise<PortfolioProject> {
    const formData = buildPortfolioFormData(values);
    const { data } = await api.post<PortfolioProject>(BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

/** DELETE /api/providers/me/portfolio/{projectId} */
export async function deletePortfolioProject(projectId: number): Promise<void> {
    await api.delete(`${BASE}/${projectId}`);
}