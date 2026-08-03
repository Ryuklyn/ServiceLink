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

// ── Admin-context detection ─────────────────────────────────────────────────
function isAdminContext(url?: string): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return true;
  if (window.location.pathname.startsWith("/dashboard/admin")) return true;
  return !!url?.includes("/admin");
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

const adminStorage = {
  getAccess: () => localStorage.getItem("adminAccessToken"),
  getRefresh: () => localStorage.getItem("adminRefreshToken"),
  setAccess: (t: string) => localStorage.setItem("adminAccessToken", t),
  setRefresh: (t: string) => localStorage.setItem("adminRefreshToken", t),
  clearSession: () => {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
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
      // Never override a token the caller explicitly set (e.g. AdminAuthGuard's manual check)
      if (config.headers?.["Authorization"] || config._skipAuth) {
        return config;
      }

      const admin = isAdminContext(config.url);
      const token = admin ? adminStorage.getAccess() : storage.getAccess();

      if (token) {
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

      const admin = isAdminContext(original.url);
      const session = admin ? adminStorage : storage;
      const loginPath = admin ? "/admin/login" : "/login";

      const refreshToken = session.getRefresh();
      if (!refreshToken) {
        session.clearSession();
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newToken) => {
          original._retry = true;
          original.headers["Authorization"] = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // NOTE: admin refresh endpoint may differ from regular refresh endpoint —
        // adjust the URL below if your backend exposes a separate admin refresh route.
        const { data } = await axios.post<{
          token: string;
          refreshToken?: string;
        }>(
            `${api.defaults.baseURL?.replace("/api", "")}/api/auth/refresh-token`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
        );

        session.setAccess(data.token);
        if (data.refreshToken) session.setRefresh(data.refreshToken);

        flushQueue(data.token);

        original.headers["Authorization"] = `Bearer ${data.token}`;
        return api(original);
      } catch (refreshError) {
        const normalized = normalizeError(refreshError);
        session.clearSession();
        rejectQueue(normalized);
        if (typeof window !== "undefined") window.location.href = loginPath;
        return Promise.reject(normalized);
      } finally {
        isRefreshing = false;
      }
    },
);

export default api;