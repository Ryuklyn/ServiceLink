"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { changePassword, logout } from "@/lib/api/authApi";
import { useAppSelector } from "@/store/hooks";

export default function ChangePasswordPage() {
    const router = useRouter();
    const { data: user } = useAppSelector((state) => state.user);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [logoutOtherDevices, setLogoutOtherDevices] = useState(false);
    const [loading, setLoading] = useState(false);

    const getStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = getStrength(newPassword);
    const strengthLabel = ["Weak", "Weak", "Medium", "Strong", "Very Strong"];

    const getBarColor = (level: number) => {
        if (strength >= level) {
            if (strength === 1) return "bg-red-500";
            if (strength === 2 || strength === 3) return "bg-[#e8683f]";
            if (strength === 4) return "bg-green-500";
        }
        return "bg-gray-200";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error("Enter your current password");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (strength < 2) {
            toast.error("New password is too weak");
            return;
        }
        if (!user?.id) {
            toast.error("Session expired. Please log in again.");
            return;
        }

        try {
            setLoading(true);

            await changePassword(user.id, {
                currentPassword,
                newPassword,
                confirmPassword,
                logoutOtherDevices,
            });

            if (logoutOtherDevices) {
                // Checked = sign out everywhere, including this device.
                // Backend already revoked every session; now clear local tokens
                // and send the user back to login.
                toast.success("Password updated. You've been signed out everywhere.");
                await logout();
                router.replace("/login");
            } else {
                toast.success("Password updated successfully");
                router.push("/dashboard/user/settings");
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to update password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <Link
                href="/dashboard/user/settings"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
                <ArrowLeft size={14} /> Back to Settings
            </Link>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Change Password
            </h2>
            <p className="text-gray-500 mb-6">
                Update your master security passphrase.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* CURRENT PASSWORD */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Current Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-10 pr-10 py-3 text-slate-800 placeholder-slate-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* NEW PASSWORD */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-10 py-3 text-slate-800 placeholder-slate-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {newPassword && (
                        <>
                            <p className="text-sm mt-2 text-gray-500">
                                Strength:{" "}
                                <b
                                    className={
                                        strength === 1
                                            ? "text-red-500"
                                            : strength === 2
                                                ? "text-[#e8683f]"
                                                : strength === 3
                                                    ? "text-[#1e3a8a]"
                                                    : strength === 4
                                                        ? "text-green-500"
                                                        : "text-gray-500"
                                    }
                                >
                                    {strengthLabel[strength]}
                                </b>
                            </p>
                            <div className="flex gap-1 mt-1.5">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${getBarColor(level)}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-10 pr-10 py-3 text-slate-800 placeholder-slate-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* OTHER DEVICES */}
                <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={logoutOtherDevices}
                        onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                        className="rounded text-[#1e3a8a] mt-0.5"
                    />
                    <span>
                        Sign out everywhere after this change
                        <span className="block text-xs text-gray-400">
                            Including this device — you'll need to log in again.
                        </span>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-[#17306f] transition-colors disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                    {loading ? "Updating..." : "Update Password"}
                    <CheckCircle size={16} />
                </button>
            </form>
        </div>
    );
}