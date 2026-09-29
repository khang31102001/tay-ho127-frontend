"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

type AsyncDataState<T> = {
  data: T | undefined;
  isLoading: boolean;
  /** Message lỗi hiển thị được (đã chuẩn hóa ở api-client), null khi thành công. */
  error: string | null;
  /** Tải lại (vd. sau khi xóa 1 dòng) — trả về khi đã tải xong. */
  reload: () => Promise<void>;
};

/**
 * Trạng thái loading/error/data cho 1 lời gọi service bất đồng bộ — dùng chung
 * cho các màn Explorer/Editor của Admin thay vì mỗi hook tự lặp lại cùng một
 * khối useState + try/catch + cờ hủy.
 *
 * - `load` chạy lại khi `deps` đổi; kết quả của lần gọi cũ bị bỏ qua (tránh
 *   ghi đè bởi response đến trễ).
 * - `enabled = false` => không gọi, isLoading = false (vd. Editor ở chế độ tạo mới).
 */
export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: DependencyList,
  { enabled = true, fallbackError = "Không thể tải dữ liệu." }: { enabled?: boolean; fallbackError?: string } = {},
): AsyncDataState<T> {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableLoad = useCallback(load, deps);

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await stableLoad();
      if (requestId === requestIdRef.current) setData(result);
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setError(loadError instanceof Error ? loadError.message : fallbackError);
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [stableLoad, fallbackError]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    run();

    return () => {
      // Hủy kết quả của lần gọi đang chạy khi deps đổi hoặc unmount.
      requestIdRef.current++;
    };
  }, [enabled, run]);

  return { data, isLoading, error, reload: run };
}
