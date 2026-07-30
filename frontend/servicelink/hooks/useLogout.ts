"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";

/**
 * Single source of truth for logging out. Clears the exact token keys that
 * utils/axios.ts writes ("accessToken" / "refreshToken") — using different
 * key names here (e.g. "authToken", "token") would leave real tokens behind
 * even after the user is redirected to /login.
 */
export function useLogout() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    return () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(clearUser());
        router.push("/login");
    };
}