// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// ── Extend config to support custom flags ──────────────────────────────────
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
  }
}

// ── Normalized error type ──────────────────────────────────────────────────
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

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, string> | undefined;
    return new ApiError({
      status: error.response?.status ?? 0,
      code: data?.code ?? "UNKNOWN_ERROR",
      message:
        data?.error ?? data?.message ?? error.message ?? "Request failed",
    });
  }
  if (error instanceof ApiError) return error;
  return new ApiError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  });
}

// ── Token helpers ──────────────────────────────────────────────────────────
const storage = {
  getAccess: () => localStorage.getItem("accessToken"),
  getRefresh: () => localStorage.getItem("refreshToken"),
  setAccess: (t: string) => localStorage.setItem("accessToken", t),
  setRefresh: (t: string) => localStorage.setItem("refreshToken", t),
  clearSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

// ── Axios instance ─────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = storage.getAccess();
    if (token && !config._skipAuth) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(normalizeError(error)),
);

// ── Refresh queue ──────────────────────────────────────────────────────────
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: ApiError) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

function flushQueue(token: string): void {
  queue.forEach(({ resolve }) => resolve(token));
  queue = [];
}

function rejectQueue(err: ApiError): void {
  queue.forEach(({ reject }) => reject(err));
  queue = [];
}

// ── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError): Promise<AxiosResponse> => {
    const original = error.config as InternalAxiosRequestConfig;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(normalizeError(error));
    }

    const refreshToken = storage.getRefresh();
    if (!refreshToken) {
      storage.clearSession();
      return Promise.reject(normalizeError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken?: string;
      }>(
        `${api.defaults.baseURL?.replace("/api", "")}/api/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      storage.setAccess(data.accessToken);
      if (data.refreshToken) storage.setRefresh(data.refreshToken);

      api.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;
      flushQueue(data.accessToken);

      original.headers["Authorization"] = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      const normalized = normalizeError(refreshError);
      storage.clearSession();
      rejectQueue(normalized);
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(normalized);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
