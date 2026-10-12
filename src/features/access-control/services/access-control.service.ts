import { adminApi } from "@/core/api";

export async function getUsers() {
  return adminApi.get("/users");
}

export async function createUser(data: unknown) {
  return adminApi.post("/users", data);
}

export async function updateUser(id: string, data: unknown) {
  return adminApi.put(`/users/${id}`, data);
}

export async function deleteUser(id: string) {
  return adminApi.delete(`/users/${id}`);
}

export async function getRoles() {
  return adminApi.get("/roles");
}

export async function createRole(data: unknown) {
  return adminApi.post("/roles", data);
}

export async function updateRole(id: string, data: unknown) {
  return adminApi.put(`/roles/${id}`, data);
}

export async function deleteRole(id: string) {
  return adminApi.delete(`/roles/${id}`);
}

export async function getPermissions() {
  return adminApi.get("/permissions");
}
