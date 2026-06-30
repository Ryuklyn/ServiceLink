"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (!accessToken) {
            toast.error("Google login failed.");
            router.replace("/login/user");
            return;
        }

        try {
            // Save tokens
            localStorage.setItem("accessToken", accessToken);

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            toast.success("Login successful!");

            // Clean redirect into the app
            router.replace("/dashboard/user");
        } catch (error) {
            console.error(error);
            toast.error("Unable to complete login.");
            router.replace("/login/user");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">

                <div className="w-14 h-14 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />

                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        Completing Sign In
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Please wait while we securely sign you in...
                    </p>
                </div>

            </div>
        </div>
    );
}