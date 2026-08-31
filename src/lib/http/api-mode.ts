export type ApiMode = "mock" | "real";

/**
 * NEXT_PUBLIC_API_MODE=mock|real — quyết định 1 feature gọi mock adapter nội
 * bộ hay Global HTTP Client (api-client.ts) gọi Backend thật. Mặc định
 * "mock" nếu không set hoặc set giá trị khác "real", để dev/local luôn chạy
 * được ngay cả khi quên set biến môi trường.
 */
export function getApiMode(): ApiMode {
  return process.env.NEXT_PUBLIC_API_MODE === "real" ? "real" : "mock";
}
