import { jwtDecode } from "jwt-decode";

export interface ProJwtClaims {
    sub: string;
    // proUserId: number;
    // workspaceId: number;
    role?: string;
    exp: number;
}

/**
 * Reads pro-user session claims out of the JWT.
 * Adjust the storage key ("token") to match whatever key your axios
 * interceptor uses to attach the Authorization header.
 */
export function getProClaims(): ProJwtClaims | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
        return jwtDecode<ProJwtClaims>(token);
    } catch {
        return null;
    }
}