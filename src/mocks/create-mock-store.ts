export type MockStoreConfig<T> = {
  /** localStorage key riêng cho từng domain, vd. "tayho-admin-products". */
  storageKey: string;
  /** Dữ liệu seed ban đầu — dùng khi chưa có gì trong localStorage, hoặc khi chạy ở server (SSR). */
  seed: T[];
  /** Độ trễ giả lập network, mặc định 300ms. */
  delayMs?: number;
};

export type MockStore<T> = {
  /** Giả lập độ trễ network — gọi ở đầu mỗi hàm service (await store.delay()). */
  delay: () => Promise<void>;
  read: () => T[];
  write: (items: T[]) => void;
};

const DEFAULT_DELAY_MS = 300;

/**
 * MOCK CONTRACT — gom lại đúng pattern (localStorage + seed fallback khi
 * chạy server-side + delay giả lập) đang được lặp lại thủ công gần như y hệt
 * ở mọi feature service hiện tại (vd. features/payment-methods/services/
 * payment-method.service.ts). Factory này CHỈ gói phần hạ tầng lưu trữ —
 * KHÔNG phải BaseService<T>/GenericRepository<T>: mỗi feature vẫn tự viết
 * list/get/create/update/delete và business rule của domain mình.
 *
 * Các feature hiện tại không bắt buộc phải đổi sang dùng factory này — đây
 * là lựa chọn cho feature mới, hoặc migrate dần khi thuận tiện, không phải
 * thay đổi bắt buộc ngay.
 */
export function createMockStore<T>({ storageKey, seed, delayMs = DEFAULT_DELAY_MS }: MockStoreConfig<T>): MockStore<T> {
  function read(): T[] {
    if (typeof window === "undefined") {
      return seed;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      window.localStorage.setItem(storageKey, JSON.stringify(seed));
      return seed;
    }

    return JSON.parse(raw) as T[];
  }

  function write(items: T[]): void {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return { read, write, delay };
}
