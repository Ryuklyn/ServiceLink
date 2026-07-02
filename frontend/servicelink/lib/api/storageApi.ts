import { publicClient } from "./client";

export interface FileUploadResponse {
    url: string;
}

export const storageApi = {
    uploadFile: async (file: File, folder: string): Promise<FileUploadResponse> => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        const { data } = await publicClient.post<FileUploadResponse>(
            "/storage/upload",
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data;
    },
};