import { adminApi } from "@/core/api";

export async function createProduct(data: unknown) {
  return adminApi.post("/products", data);
}

export async function updateProduct(id: string, data: unknown) {
  return adminApi.put(`/products/${id}`, data);
}

export async function deleteProduct(id: string) {
  return adminApi.delete(`/products/${id}`);
}

export async function createCategory(data: unknown) {
  return adminApi.post("/categories", data);
}

export async function updateCategory(id: string, data: unknown) {
  return adminApi.put(`/categories/${id}`, data);
}

export async function deleteCategory(id: string) {
  return adminApi.delete(`/categories/${id}`);
}

export async function createMenu(data: unknown) {
  return adminApi.post("/menus", data);
}

export async function updateMenu(id: string, data: unknown) {
  return adminApi.put(`/menus/${id}`, data);
}

export async function deleteMenu(id: string) {
  return adminApi.delete(`/menus/${id}`);
}
