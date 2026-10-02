export { RedirectsExplorer } from "./components/RedirectsExplorer";
export { RedirectEditor } from "./components/RedirectEditor";
export type { ManagedRedirect, RedirectType } from "./types/redirect.types";

/**
 * KHÔNG export findActiveRedirect ở đây dù thuộc feature này — middleware.ts
 * (root) gọi trực tiếp `@/features/redirects/services/redirect.service` để
 * không kéo UI Admin (RedirectsExplorer/RedirectEditor, "use client") vào
 * Edge Middleware bundle. Cùng lý do đã áp dụng cho @/features/seo,
 * @/features/articles, @/features/media, @/features/brand — xem comment tại
 * app/(site)/bai-viet/page.tsx.
 */
