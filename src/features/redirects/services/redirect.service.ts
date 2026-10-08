import { adminApi } from "@/core/api";

export async function getRedirects() {
  return adminApi.get("/redirects");
}

export async function createRedirect(data: unknown) {
  return adminApi.post("/redirects", data);
}

export async function updateRedirect(id: string, data: unknown) {
  return adminApi.put(`/redirects/${id}`, data);
}

export async function deleteRedirect(id: string) {
  return adminApi.delete(`/redirects/${id}`);
}
