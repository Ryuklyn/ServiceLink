import { publicClient, authClient } from "./client";

/**
 * Use for endpoints that don't require authentication (OTP, login, register).
 * Never attaches a Bearer token.
 */
export const publicApi = {
  post: publicClient.post.bind(publicClient),
  get:  publicClient.get.bind(publicClient),
};

/**
 * Use for endpoints that require authentication.
 * Automatically attaches the stored Bearer token.
 */
export const privateApi = {
  post:   authClient.post.bind(authClient),
  get:    authClient.get.bind(authClient),
  put:    authClient.put.bind(authClient),
  delete: authClient.delete.bind(authClient),
};
