import { createHttpClient, type HttpClient } from "./api-client";
import { isApiError } from "./api-error";

/**
 * HTTP client của Admin Portal — gọi Backend ASP.NET Core qua BFF Route Handler
 * (app/api/admin/backend/[...path]): path truyền vào là path của Backend sau
 * /api/v1, vd. adminApi.get("/users"). Token nằm trong cookie HttpOnly, BFF tự
 * gắn và tự refresh.
 *
 * Khi BFF trả 401 (phiên hết hạn hẳn, không refresh được) thì đưa về trang
 * đăng nhập — lỗi vẫn được ném tiếp cho nơi gọi tự dọn loading state.
 */
const ADMIN_BACKEND_BASE_PATH = "/api/admin/backend";
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
