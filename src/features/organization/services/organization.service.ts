import { adminApi } from "@/core/api";

export async function getOrganizations() {
  return adminApi.get("/organizations");
}

export async function getOrganizationById(id: string) {
  return adminApi.get(`/organizations/${id}`);
}

export async function updateOrganization(id: string, data: unknown) {
  return adminApi.put(`/organizations/${id}`, data);
}

export async function getBrandProfile() {
  return adminApi.get("/brand-profile");
}

export async function updateBrandProfile(data: unknown) {
  return adminApi.put("/brand-profile", data);
}
