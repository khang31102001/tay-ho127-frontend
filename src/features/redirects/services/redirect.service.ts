import type { ManagedRedirect } from "../types/redirect.types";
import { SEED_REDIRECTS } from "../mocks/redirect.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý redirect thật. Dữ liệu seed (xem
 * ../mocks/redirect.mock.ts) + đồng bộ 2 chiều với localStorage — cùng pattern
 * mọi feature admin CRUD khác. Khi có backend thật, chỉ cần thay nội dung các
 * hàm dưới đây.
 */
const STORAGE_KEY = "tayho-admin-redirects";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedRedirect[] {
  if (typeof window === "undefined") {
    return SEED_REDIRECTS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedRedirect[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu redirect:", error);
  }

  return SEED_REDIRECTS;
}

function writeStore(redirects: ManagedRedirect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(redirects));
  } catch (error) {
    console.error("Không thể lưu dữ liệu redirect:", error);
  }
}

function normalizeSourcePath(path: string): string {
  const trimmed = path.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function listRedirects(): Promise<ManagedRedirect[]> {
  await delay();
  return readStore();
}

export async function getRedirectById(id: string): Promise<ManagedRedirect | null> {
  await delay();
  return readStore().find((redirect) => redirect.id === id) ?? null;
}

export async function isSourcePathTaken(sourcePath: string, excludeId?: string): Promise<boolean> {
  await delay(150);
  const normalized = normalizeSourcePath(sourcePath);
  return readStore().some((redirect) => redirect.sourcePath === normalized && redirect.id !== excludeId);
}

export async function createRedirect(
  payload: Omit<ManagedRedirect, "id" | "createdAt" | "updatedAt">,
): Promise<ManagedRedirect> {
  await delay();

  const now = new Date().toISOString();
  const newRedirect: ManagedRedirect = {
    ...payload,
    sourcePath: normalizeSourcePath(payload.sourcePath),
    id: `redirect-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...readStore(), newRedirect]);

  return newRedirect;
}

export async function updateRedirect(
  id: string,
  payload: Omit<ManagedRedirect, "id" | "createdAt" | "updatedAt">,
): Promise<ManagedRedirect> {
  await delay();

  const current = readStore();
  const existing = current.find((redirect) => redirect.id === id);
  const now = new Date().toISOString();

  const updated: ManagedRedirect = {
    ...payload,
    sourcePath: normalizeSourcePath(payload.sourcePath),
    id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(current.map((redirect) => (redirect.id === id ? updated : redirect)));

  return updated;
}

export async function deleteRedirect(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((redirect) => redirect.id !== id));
}

/**
 * Dùng bởi middleware.ts — khớp CHÍNH XÁC theo source_path (không hỗ trợ
 * wildcard/regex, tránh over-engineering khi chưa có nhu cầu cụ thể). Không
 * gọi delay() giả lập ở đây vì middleware chạy trên MỌI request, cần nhanh.
 */
export function findActiveRedirect(pathname: string): ManagedRedirect | null {
  return readStore().find((redirect) => redirect.isActive && redirect.sourcePath === pathname) ?? null;
}
