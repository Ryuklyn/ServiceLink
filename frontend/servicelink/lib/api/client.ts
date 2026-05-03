import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ─── Error shape ────────────────────────────────────────────────────────────

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code: string;

  constructor({ status, code, message }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Normalizes any thrown value into a typed ApiError. */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (data?.message as string) ??
      (data?.error as string) ??
      error.message ??
      "Request failed";
    const code = (data?.code as string) ?? "UNKNOWN_ERROR";
    return new ApiError({
      status: error.response?.status ?? 0,
      code,
      message,
    });
  }
  if (error instanceof ApiError) return error;
  return new ApiError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  });
}

// ─── Token storage ───────────────────────────────────────────────────────────

const storage = {
  getToken: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setToken: (t: string) => localStorage.setItem("token", t),
  clearToken: () => localStorage.removeItem("token"),
};

export { storage };

// ─── Axios instances ─────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8080/api";

/** Authenticated client — attaches Bearer token automatically. */
const authClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

/** Public client — never attaches auth headers (OTP, open endpoints). */
const publicClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ─── Auth interceptor (authClient only) ─────────────────────────────────────

authClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(normalizeError(error)),
);

// ─── Response interceptors (both clients) ───────────────────────────────────

function attachResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        storage.clearToken();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
      return Promise.reject(normalizeError(error));
    },
  );
}

attachResponseInterceptor(authClient);
attachResponseInterceptor(publicClient);

export { authClient, publicClient };
export default authClient;
