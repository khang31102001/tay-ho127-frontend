import { adminApi } from "@/core/api";

export async function getNavigation() {
  return adminApi.get("/navigation");
}

export async function updateNavigation(data: unknown) {
  return adminApi.put("/navigation", data);
}

export async function getMenuItems() {
  return adminApi.get("/menu-items");
}
