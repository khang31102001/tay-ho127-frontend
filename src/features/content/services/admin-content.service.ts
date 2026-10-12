import { adminApi } from "@/core/api";

export async function createArticle(data: unknown) {
  return adminApi.post("/articles", data);
}

export async function updateArticle(id: string, data: unknown) {
  return adminApi.put(`/articles/${id}`, data);
}

export async function deleteArticle(id: string) {
  return adminApi.delete(`/articles/${id}`);
}

export async function createPage(data: unknown) {
  return adminApi.post("/pages", data);
}

export async function updatePage(id: string, data: unknown) {
  return adminApi.put(`/pages/${id}`, data);
}

export async function deletePage(id: string) {
  return adminApi.delete(`/pages/${id}`);
}

export async function createBanner(data: unknown) {
  return adminApi.post("/banners", data);
}

export async function updateBanner(id: string, data: unknown) {
  return adminApi.put(`/banners/${id}`, data);
}

export async function deleteBanner(id: string) {
  return adminApi.delete(`/banners/${id}`);
}
