import { adminApi } from "@/core/api";

export async function getArticles() {
  return adminApi.get("/articles");
}

export async function getPages() {
  return adminApi.get("/pages");
}

export async function getArticleCategories() {
  return adminApi.get("/article-categories");
}

export async function getBanners() {
  return adminApi.get("/banners");
}
