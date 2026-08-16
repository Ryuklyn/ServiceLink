"use client";

import { useState } from "react";
import { X, Lock, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/axios";
import { useAppSelector } from "@/store/hooks";

interface Props {
    onClose: () => void;
    onDisabled: () => void;
}

export default function DisableTwoFactorModal({ onClose, onDisabled }: Props) {
    const { data: user } = useAppSelector((state) => state.user);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDisable = async () => {
        if (!password) {
            toast.error("Enter your current password");
            return;
        }
        try {
            setLoading(true);
            await api.post(`/users/${user?.id}/2fa/disable`, {
                currentPassword: password,
            });
            toast.success("Two-Factor Authentication disabled");
            onDisabled();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to disable 2FA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>

                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-500" size={22} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Disable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-5">
                    Your account will be less secure without a second verification step at login. Re-enter your password to confirm.
                </p>

                <div className="relative mb-5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-red-400 outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDisable}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Disabling..." : "Disable 2FA"}
                    </button>
                </div>
            </div>
        </div>
    );
}