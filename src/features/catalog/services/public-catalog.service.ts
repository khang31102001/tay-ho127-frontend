import { adminApi } from "@/core/api";
import type { ApiEnvelope } from "@/core/api";

export async function getPublicCatalog() {
  return adminApi.get("/catalog/public");
}

export async function getProducts(pageSize: number = 200) {
  return adminApi.get("/products", { params: { pageSize } });
}

export async function getCategories() {
  return adminApi.get("/categories");
}

export async function getMenus() {
  return adminApi.get("/menus");
}
