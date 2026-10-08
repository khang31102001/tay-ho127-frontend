import { adminApi } from "@/core/api";

export async function uploadMedia(formData: FormData) {
  return adminApi.post("/media/upload", formData);
}

export async function getMedia(pageSize: number = 50) {
  return adminApi.get("/media", { params: { pageSize } });
}

export async function deleteMedia(id: string) {
  return adminApi.delete(`/media/${id}`);
}
