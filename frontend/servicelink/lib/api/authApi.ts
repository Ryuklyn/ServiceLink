import api from "@/utils/axios";

// ── Auth Response Types ─────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  refreshToken: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  requiresProfileImage: boolean;
}

export interface MeResponse {
  id: number;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  verified: boolean;
  provider: string;
  createdAt: string;
}

export interface OtpSendResponse {
  message: string;
  deliveryMethod: string;
  whatsappLink?: string;
}

// ── Login / Logout / Me ─────────────────────────────────────────────────────

export async function login(
    email: string,
    password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      { _skipAuth: true },
  );

  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
  }
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export async function resetPassword(
    email: string,
    newPassword: string,
): Promise<void> {
  await api.post("/auth/reset-password", { email, newPassword });
}

// ── Profile Update (Settings page) ──────────────────────────────────────────

export async function updateMyProfile(fullName: string): Promise<MeResponse> {
  const { data } = await api.put<MeResponse>("/auth/me", { fullName });
  return data;
}

export async function updateMyPhoto(file: File): Promise<MeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post<MeResponse>("/auth/me/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── Phone OTP (Settings page — add & verify phone for current user) ────────

export async function sendPhoneOtp(phone: string): Promise<OtpSendResponse> {
  const { data } = await api.post<OtpSendResponse>("/auth/send-phone-otp", {
    phone,
  });
  return data;
}

export async function verifyPhoneOtpForMe(
    phone: string,
    otp: string,
): Promise<MeResponse> {
  const { data } = await api.post<MeResponse>("/auth/me/verify-phone-otp", {
    phone,
    otp,
  });
  return data;
}