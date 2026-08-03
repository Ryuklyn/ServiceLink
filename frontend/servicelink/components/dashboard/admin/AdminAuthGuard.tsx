"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";

export default function AdminAuthGuard({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("adminAccessToken");

        if (!token) {
            router.replace("/admin/login");
            return;
        }

        api
            .get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(({ data }) => {
                if (data.role !== "ADMIN") {
                    router.replace("/admin/login");
                    return;
                }
                setChecking(false);
            })
            .catch(() => {
                localStorage.removeItem("adminAccessToken");
                localStorage.removeItem("adminRefreshToken");
                router.replace("/admin/login");
            });
    }, [router]);

    if (checking) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-500">
                Checking session...
            </div>
        );
    }

    return <>{children}</>;
}