import api from "@/utils/axios";

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
}

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
