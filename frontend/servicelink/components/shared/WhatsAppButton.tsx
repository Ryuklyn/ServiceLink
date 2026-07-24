"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Phone as PhoneIcon, X, Loader2 } from "lucide-react";
import api from "@/utils/axios";

interface WhatsAppButtonProps {
    phone: string;                 // provider's WhatsApp number (recipient)
    message: string;
    providerId?: string | number;  // ties the check/click-log to the right provider thread
    variant?: "solid" | "outline" | "icon-only";
    label?: string;
}

// TODO: point this at your actual "edit profile" route.
const PROFILE_ROUTE = "/dashboard/user/settings";

function buildWhatsAppLink(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, "");
    const withCountryCode = digits.startsWith("977") ? digits : `977${digits.replace(/^0/, "")}`;
    return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
    );
}

export default function WhatsAppButton({
                                           phone,
                                           message,
                                           providerId,
                                           variant = "solid",
                                           label = "WhatsApp",
                                       }: WhatsAppButtonProps) {
    const router = useRouter();
    const [isChecking, setIsChecking]         = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);

    const handleClick = async () => {
        if (isChecking) return;
        setIsChecking(true);

        try {
            // Verifies the LOGGED-IN USER (not the provider) has a phone on file
            // before opening the chat.
            const { data } = await api.get<{ phoneNumber?: string | null }>("/auth/me");

            if (!data.phoneNumber || !data.phoneNumber.trim()) {
                setShowPhoneModal(true);
                return;
            }

            console.log("whatsapp_click", { phone, providerId, context: message.slice(0, 40) });

            const href = buildWhatsAppLink(phone, message);
            window.open(href, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("Couldn't verify your profile. Please try again.", { position: "top-right" });
        } finally {
            setIsChecking(false);
        }
    };

    const handleGoToProfile = () => {
        setShowPhoneModal(false);
        router.push(PROFILE_ROUTE);
    };

    const buttonClasses =
        variant === "icon-only"
            ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors disabled:opacity-60"
            : variant === "solid"
                ? "flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors disabled:opacity-60"
                : "flex items-center gap-2 rounded-lg border border-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#25D366] hover:bg-[#25D366]/5 transition-colors disabled:opacity-60";

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isChecking}
                aria-label={variant === "icon-only" ? "WhatsApp" : undefined}
                className={buttonClasses}
            >
                {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <WhatsAppIcon className="h-4 w-4" />
                )}
                {variant !== "icon-only" && label}
            </button>

            {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50">
                                    <PhoneIcon size={15} className="text-[#e8683f]" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">Phone number required</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPhoneModal(false)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="px-5 py-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Add a phone number to your profile so the provider can reach you on WhatsApp.
                            </p>
                        </div>

                        <div className="flex gap-2 px-5 pb-5">
                            <button
                                type="button"
                                onClick={() => setShowPhoneModal(false)}
                                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                I&apos;ll do it later
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToProfile}
                                className="flex-1 rounded-xl bg-[#1e3a8a] py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                            >
                                Go to profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}