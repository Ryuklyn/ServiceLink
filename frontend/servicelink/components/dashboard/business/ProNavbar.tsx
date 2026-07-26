"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Search, Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import type { AppDispatch, RootState } from "@/store"; // adjust to your store path
import { clearProSession } from "@/store/slices/proSessionSlice";

function getInitials(name: string | null): string {
    if (!name) return "..";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

export default function ProNavbar() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { fullName } = useSelector((state: RootState) => state.proSession);
    const initials = getInitials(fullName);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close the dropdown on outside click
    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleLogout = () => {
        // Adjust "token" to match whatever key your axios interceptor reads —
        // same key used in utils/jwt.ts's getProClaims().
        localStorage.removeItem("token");
        dispatch(clearProSession());
        setMenuOpen(false);
        router.push("/login/business");
    };

    return (
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700">
                    <Search size={20} />
                </button>
                <button className="relative text-gray-500 hover:text-gray-700">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800 leading-none">
                                {fullName ?? "Loading..."}
                            </p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${
                                menuOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push("/dashboard/business/settings");
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                                <Settings size={16} className="text-gray-500" />
                                Settings
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}