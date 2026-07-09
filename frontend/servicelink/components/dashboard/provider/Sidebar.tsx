"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, BadgeCheck, X } from "lucide-react"; // Added X icon
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile, clearProviderProfile } from "@/store/slices/providerProfileSlice";
import { clearUser } from "@/store/slices/userSlice";
import { providerNavItems } from "@/lib/navigation/providerNavItems";
import { getPlanBadgeLabelUpper } from "@/utils/subscriptionDisplay";
import { fetchProviderSubscription } from "@/store/slices/providerSubscriptionSlice";

interface SidebarProps {
    isOpen?: boolean;         // Control mobile visibility
    onNavigate?: () => void;  // Used to close sidebar on navigation/backdrop click
}

export default function Sidebar({ isOpen = false, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const dispatch = useAppDispatch();
    const { data: provider } = useAppSelector((state) => state.providerProfile);
    const { data: subscription } = useAppSelector((state) => state.providerSubscription);

    useEffect(() => {
        if (!provider) {
            dispatch(fetchProviderProfile());
        }
    }, [dispatch, provider]);

    useEffect(() => {
        if (!subscription) {
            dispatch(fetchProviderSubscription());
        }
    }, [dispatch, subscription]);


    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(clearProviderProfile());
        dispatch(clearUser());
        router.push("/login");
    };

    const displayName = provider?.businessName || provider?.fullName || "Provider";

    const initials = provider?.fullName
        ? provider.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-200"
                    onClick={onNavigate}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 lg:static 
                w-64 h-full flex flex-col bg-gradient-to-b from-[#E8683F] to-[#C8501F] flex-shrink-0
                transform transition-transform duration-200 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                {/* Logo Section */}
                <div className="px-3 pt-6 pb-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 w-full shadow-sm">
                        <Image
                            src="/images/SL.png"
                            alt="ServiceLink Logo"
                            width={28}
                            height={28}
                            className="object-contain shrink-0"
                            priority
                        />
                        <div className="flex flex-col justify-center">
                            <p className="font-extrabold text-sm text-[#1e3a8a] leading-none mb-0.5">
                                Service<span className="text-[#e8683f]">Link</span>
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 tracking-wide leading-none">
                                Trusted Local Services
                            </p>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onNavigate}
                        className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
                    {providerNavItems.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            href === "/dashboard/provider"
                                ? pathname === href
                                : pathname.startsWith(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onNavigate} // Closes the mobile drawer upon route change
                                className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                                    ${
                                    isActive
                                        ? "bg-white text-[#1E3A8A] shadow-md shadow-black/10 font-semibold"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                }
                                `}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? "text-[#E8683F]" : "text-white/70"}
                                />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Profile Card */}
                <div className="m-3 mt-4 bg-[#1E3A8A] rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 flex-shrink-0">
                            {provider?.profilePictureUrl ? (
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    <Image
                                        src={provider.profilePictureUrl}
                                        alt="profile"
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1E3A8A] font-bold text-sm shadow">
                                    {initials}
                                    clearance</div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                                {displayName}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <BadgeCheck size={12} className="text-[#E8683F] flex-shrink-0" />
                                <p className="text-white/60 text-xs truncate">
                                    {provider?.isVerified ? "Verified Provider" : "Pending Verification"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        {/*<span className="bg-[#E8683F] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">*/}
                        {/*    MONTHLY PLAN ✓*/}
                        {/*</span>*/}
                        <span className="bg-[#E8683F] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
                            {getPlanBadgeLabelUpper(subscription?.planType)} ✓
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-white/50 hover:text-white/80 transition text-xs"
                        >
                            <LogOut size={13} />
                            <span>Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}