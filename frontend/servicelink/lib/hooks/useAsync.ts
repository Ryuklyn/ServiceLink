import { useState, useCallback } from "react";
import { ApiError } from "@/lib/api/client";

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; code?: string };

export function useAsync<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(
    async (...args: A) => {
      setState({ status: "loading" });
      try {
        const data = await fn(...args);
        setState({ status: "success", data });
        return data;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Something went wrong";
        const code = err instanceof ApiError ? err.code : undefined;
        setState({ status: "error", error: message, code });
        throw err;
      }
    },
    [fn],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === "loading",
    isError: state.status === "error",
    isSuccess: state.status === "success",
  };
}
