import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";

// ─── Extend config to support custom flags ─────────────────────────────────
declare module "axios" {
    interface AxiosRequestConfig {
        _skipAuth?: boolean;
        _retry?: boolean;
    }
    interface InternalAxiosRequestConfig {
        _skipAuth?: boolean;
        _retry?: boolean;
    }
}

// ─── Error shape ────────────────────────────────────────────────────────────

export interface ApiErrorShape {
    status: number;
    code: string;
    message: string;
    expired?: boolean;
}

export class ApiError extends Error implements ApiErrorShape {
    status: number;
    code: string;
    expired?: boolean;

    constructor({ status, code, message, expired }: ApiErrorShape) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.expired = expired;
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
            expired: data?.expired as boolean | undefined,
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
    getToken: (): string | null => {
        if (typeof window === "undefined") return null;
        // Checks 'token', then falls back to 'adminAccessToken' or 'accessToken'
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("adminAccessToken") ||
            localStorage.getItem("accessToken")
        );
    },
    setToken: (t: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("token", t);
            localStorage.setItem("accessToken", t);
        }
    },
    clearToken: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("adminAccessToken");
            localStorage.removeItem("adminRefreshToken");
        }
    },
};

const adminStorage = {
    getAccess: (): string | null =>
        typeof window !== "undefined"
            ? localStorage.getItem("adminAccessToken") || localStorage.getItem("token")
            : null,
    setAccess: (t: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("adminAccessToken", t);
            localStorage.setItem("token", t);
        }
    },
    setRefresh: (t: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("adminRefreshToken", t);
        }
    },
};

export { storage, adminStorage };

// ─── Axios instances ─────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "http://localhost:8080/api";

/** Authenticated client — attaches Bearer token automatically. */
const authClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
});

/** Public client — never attaches auth headers (OTP, open endpoints). */
const publicClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15_000,
});

/** Status client */
const statusClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
});

statusClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = storage.getToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["X-Provider-Token"] = token;
        }
        return config;
    },
    (error) => Promise.reject(normalizeError(error)),
);

statusClient.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => Promise.reject(normalizeError(error)),
);

// ─── Auth interceptor (authClient only) ─────────────────────────────────────

authClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = storage.getToken();
        if (token && !config._skipAuth) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(normalizeError(error)),
);

publicClient.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => Promise.reject(normalizeError(error)),
);

// ─── Response interceptors (authClient) ───────────────────────────────────

function attachResponseInterceptor(instance: AxiosInstance) {
    instance.interceptors.response.use(
        (res) => res,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                const isAdminPath =
                    typeof window !== "undefined" &&
                    (window.location.pathname.includes("/admin") ||
                        window.location.pathname.includes("/dashboard/admin"));

                storage.clearToken();

                if (typeof window !== "undefined") {
                    window.location.href = isAdminPath ? "/login/admin" : "/login";
                }
            }
            return Promise.reject(normalizeError(error));
        },
    );
}

attachResponseInterceptor(authClient);

export { authClient, publicClient, statusClient };
export default authClient;