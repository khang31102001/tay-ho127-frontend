import { createHttpClient, type HttpClient } from "./http-client.impl";
import { isApiError } from "./api-error.impl";

const ADMIN_BACKEND_BASE_PATH = "/api/admin/backend";
export const ADMIN_LIST_PAGE_SIZE = 200;
const ADMIN_LOGIN_PATH = "/admin/login";

const client = createHttpClient(ADMIN_BACKEND_BASE_PATH);

function redirectToLoginOnUnauthorized<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((error: unknown) => {
    if (isApiError(error) && error.kind === "unauthorized" && typeof window !== "undefined") {
      window.location.assign(ADMIN_LOGIN_PATH);
    }
    throw error;
  });
}

export const adminApi: HttpClient = {
  get: (path, options) => redirectToLoginOnUnauthorized(client.get(path, options)),
  post: (path, body, options) => redirectToLoginOnUnauthorized(client.post(path, body, options)),
  put: (path, body, options) => redirectToLoginOnUnauthorized(client.put(path, body, options)),
  patch: (path, body, options) => redirectToLoginOnUnauthorized(client.patch(path, body, options)),
  delete: (path, options) => redirectToLoginOnUnauthorized(client.delete(path, options)),
};
