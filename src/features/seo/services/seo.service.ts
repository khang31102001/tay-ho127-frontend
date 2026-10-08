import { adminApi } from "@/core/api";

export async function getSEOConfig(resourceId: string) {
  return adminApi.get(`/seo/${resourceId}`);
}

export async function updateSEOConfig(resourceId: string, data: unknown) {
  return adminApi.put(`/seo/${resourceId}`, data);
}
