import api from "@/utils/axios";
import type { OrganizationResponse, WorkspaceResponse } from "@/types/business";

export const getOrganization = (id: number) =>
    api.get<OrganizationResponse>(`/business/organization/${id}`).then((r) => r.data);

export const updateOrganization = (id: number, body: { companyName?: string; contactNumber?: string }) =>
    api.patch<OrganizationResponse>(`/business/organization/${id}`, body).then((r) => r.data);

export const uploadOrgLogo = (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
        .post<OrganizationResponse>(`/business/organization/${id}/logo`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
};

export const getWorkspace = (id: number) =>
    api.get<WorkspaceResponse>(`/business/workspace/${id}`).then((r) => r.data);

export const updateWorkspace = (id: number, body: { primaryBranchLocation?: string; preferredServices?: string[] }) =>
    api.patch<WorkspaceResponse>(`/business/workspace/${id}`, body).then((r) => r.data);