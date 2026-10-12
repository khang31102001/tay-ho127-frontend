export type RedirectType = 301 | 302;

/**
 * Task 25 — tránh mất SEO khi đổi slug Product/Category/Article/Page. KHÔNG
 * FK tới entity nào (Task 24: SEO/Redirect không sở hữu slug) — redirect vẫn
 * phải hoạt động kể cả khi entity gốc đã bị xoá sau đó.
 */
export type ManagedRedirect = {
  id: string;
  /** Path tương đối cũ, bắt đầu bằng "/", vd. "/thuc-don/mon-cu". */
  sourcePath: string;
  /** Path tương đối mới hoặc URL tuyệt đối. */
  destinationUrl: string;
  redirectType: RedirectType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RedirectFormValue = Omit<ManagedRedirect, "id" | "createdAt" | "updatedAt">;
