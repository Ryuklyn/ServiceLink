"use client";

import { useState } from "react";
import { X, Lock, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/api/authApi";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/hooks/useLogout";

interface Props {
    onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
    const router = useRouter();
    const { data: user } = useAppSelector((state) => state.user);
    const logout = useLogout();

    const isOAuthUser = user?.provider !== "LOCAL"; // no password to re-verify

    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit =
        confirmText === "DELETE" && (isOAuthUser || password.length > 0);

    const handleDelete = async () => {
        if (!canSubmit || !user?.id) return;

        try {
            setLoading(true);
            await deleteAccount(user.id, {
                currentPassword: isOAuthUser ? undefined : password,
                confirmationText: confirmText,
            });

            toast.success("Your account has been deleted.");
            // Clear tokens locally and send them off — session is already
            // dead server-side (refreshTokenService.revokeAllForUser).
            await logout();
            router.replace("/login");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-500" size={22} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-5">
                    This action is permanent. All your bookings, saved providers, and account data will be
                    erased and cannot be recovered.
                </p>

                {!isOAuthUser && (
                    <>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Current Password
                        </label>
                        <div className="relative mb-4">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-red-400 outline-none"
                            />
                        </div>
                    </>
                )}

                <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Type <span className="font-bold">DELETE</span> to confirm
                </label>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full py-3 px-3 border border-gray-200 rounded-xl text-slate-800 mb-5 focus:ring-2 focus:ring-red-400 outline-none"
                />

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!canSubmit || loading}
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}