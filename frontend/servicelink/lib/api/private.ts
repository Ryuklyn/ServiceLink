/**
 * Private (authenticated) API helpers.
 * Use these for endpoints that require a Bearer token.
 *
 * The authClient already attaches the token via interceptor — do not
 * manually add Authorization headers here.
 */
import { authClient } from "./client";

export const privateApi = {
  get:    authClient.get.bind(authClient),
  post:   authClient.post.bind(authClient),
  put:    authClient.put.bind(authClient),
  delete: authClient.delete.bind(authClient),
};

export default authClient;
