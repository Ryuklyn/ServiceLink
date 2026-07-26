"use client";

import { UserCircle, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "@/utils/axios";

interface AdminStepProps {
  onContinue: () => void;
  onBack: () => void;
  workspaceId: string | null;
}

export default function AdminStep({
                                    onContinue,
                                    onBack,
                                    workspaceId,
                                  }: AdminStepProps) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [alreadyCreated, setAlreadyCreated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resume: if an admin already exists for this workspace, don't force a
  // re-submit — the backend rejects duplicate ProUser creation anyway
  // ("Pro user already exists for this workspace").
  useEffect(() => {
    if (!workspaceId) {
      setCheckingExisting(false);
      return;
    }
    api
        .get(`/business/pro-user/workspace/${workspaceId}`)
        .then((res) => {
          setFullName(res.data.fullName ?? "");
          setAlreadyCreated(true);
        })
        .catch(() => {
          // 404 — no admin yet for this workspace, expected on first visit
        })
        .finally(() => setCheckingExisting(false));
  }, [workspaceId]);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (alreadyCreated) {
      // Nothing new to submit — just move forward.
      onContinue();
      return;
    }

    if (!fullName.trim()) return toast.error("Full name is required");
    if (fullName.trim().length < 2)
      return toast.error("Full name must be at least 2 characters");
    if (!password) return toast.error("Password is required");
    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    if (strength < 2)
      return toast.error(
          "Password is too weak. Use uppercase, numbers, or symbols",
      );

    if (!workspaceId) {
      toast.error(
          "Workspace ID not found - please go back and create a workspace",
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/business/pro-user/create", {
        workspaceId,
        fullName: fullName.trim(),
        password,
        confirmPassword,
      });

      toast.success("Admin account created successfully!");
      onContinue();
    } catch (err: any) {
      console.error("Error creating pro user:", err);
      toast.error(
          err?.response?.data?.message ??
          err?.message ??
          "Failed to create admin account",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
        <div className="w-full py-20 text-center text-sm text-gray-400">
          Checking existing setup...
        </div>
    );
  }

  return (
      <div className="w-full">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
            <UserCircle size={22} className="text-[#1e3a8a]" />
          </div>
          <div>
            <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
              Step 3 of 5
            </p>
            <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
              Create your admin account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              You'll be the workspace owner. You can invite teammates later.
            </p>
          </div>
        </div>

        {alreadyCreated ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800">
                Admin account already created for{" "}
                <strong>{fullName || "this workspace"}</strong>. Continue to the
                next step.
              </p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
                    placeholder="Enter full name"
                    disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
                        placeholder="At least 8 characters"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                              <div
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full transition ${
                                      strength >= level ? getStrengthColor() : "bg-gray-200"
                                  }`}
                              />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Strength:{" "}
                          <span className="font-semibold">{getStrengthLabel()}</span>
                        </p>
                      </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                    Confirm password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
                        placeholder="Re-enter password"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                          <EyeOff size={18} />
                      ) : (
                          <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {confirmPassword && (
                      <p
                          className={`text-xs mt-2 ${
                              password === confirmPassword
                                  ? "text-green-600"
                                  : "text-red-600"
                          }`}
                      >
                        {password === confirmPassword
                            ? "✓ Passwords match"
                            : "✗ Passwords don't match"}
                      </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#f0f4fb] border border-[#dce5f5] rounded-lg px-4 py-3">
                <ShieldCheck size={18} className="text-[#1e3a8a] mt-0.5 shrink-0" />
                <p className="text-sm text-[#1e3a8a]">
                  Your password is encrypted at rest. We recommend enabling SSO
                  after setup.
                </p>
              </div>
            </form>
        )}

        <div className="border-t border-gray-200 my-7" />

        <div className="flex items-center justify-between">
          <button
              onClick={onBack}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition disabled:opacity-50"
          >
            <span>←</span> Back
          </button>
          <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-7 py-3 rounded-lg transition"
          >
            {loading ? "Creating..." : "Continue"} <span>→</span>
          </button>
        </div>
      </div>
  );
}