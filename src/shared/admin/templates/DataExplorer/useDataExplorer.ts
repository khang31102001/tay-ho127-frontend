"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeText } from "@/core/utils/normalize-text";

import type {
  DataExplorerColumn,
  DataExplorerLoadPage,
  DataExplorerSort,
} from "./data-explorer.types";

/** Số dòng mỗi lượt tải thêm (cả hiển thị dần phía client lẫn mỗi request server). */
export const DATA_EXPLORER_BATCH_SIZE = 10;

/** Chờ người dùng ngừng gõ rồi mới gọi server — tránh 1 request cho mỗi ký tự. */
const SERVER_SEARCH_DEBOUNCE_MS = 350;

type SortPrimitive = string | number | boolean | null | undefined;

type UseDataExplorerParams<T> = {
  columns: DataExplorerColumn<T>[];
  getRowId: (row: T) => string | number;
  /** Chế độ client: toàn bộ dữ liệu đã tải sẵn — template tìm kiếm/sắp xếp/hiển thị dần 10 dòng. */
  rows?: T[];
  /** Domain tự quyết định phần nào của bản ghi tìm được (chế độ client). */
  getSearchableText?: (row: T) => string;
  /** Chế độ server: mỗi lượt gọi 1 trang 10 bản ghi. Có prop này thì `rows` bị bỏ qua. */
  loadPage?: DataExplorerLoadPage<T>;
  /** Giá trị tìm kiếm ban đầu — dùng khi màn khác deep-link vào Explorer kèm từ khóa. */
  initialSearchTerm?: string;
};

type ServerPhase = "loading" | "idle" | "loading-more" | "error" | "error-more";

type ServerState<T> = {
  items: T[];
  totalItems: number | null;
  hasMore: boolean;
  phase: ServerPhase;
  error: string | null;
};

function readSortValue<T>(column: DataExplorerColumn<T>, row: T): SortPrimitive {
  if (column.sortValue) return column.sortValue(row);
  const value = (row as Record<string, unknown>)[column.key];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : undefined;
}

function compareSortValues(left: SortPrimitive, right: SortPrimitive): number {
  // Ô trống luôn nằm cuối, bất kể chiều sắp xếp — được xử lý ở nơi gọi.
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "vi", { numeric: true, sensitivity: "base" });
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Nguồn dữ liệu + trạng thái cho DataExplorer. Hai chế độ cùng một đầu ra để bảng không cần biết dữ liệu đến từ đâu:
 * - `rows` (client): dữ liệu đã tải sẵn; tìm kiếm bỏ dấu, sắp xếp theo cột, hiển thị dần từng 10 dòng khi cuộn.
 * - `loadPage` (server): infinite scroll 10 bản ghi/request; đổi từ khóa/bộ lọc thì hủy request cũ (AbortController)
 *   và tải lại từ trang 1; chặn request trùng khi đang tải; không nối trùng bản ghi (theo getRowId).
 */
export function useDataExplorer<T>({
  columns,
  getRowId,
  rows,
  getSearchableText,
  loadPage,
  initialSearchTerm = "",
}: UseDataExplorerParams<T>) {
  const isServerMode = Boolean(loadPage);

  const [searchTerm, setSearchTermState] = useState(initialSearchTerm);
  const [appliedSearch, setAppliedSearch] = useState(initialSearchTerm.trim());
  const [sort, setSort] = useState<DataExplorerSort | null>(null);
  const [visibleCount, setVisibleCount] = useState(DATA_EXPLORER_BATCH_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(() => new Set());

  // ---- Tìm kiếm ----

  // Server: debounce; client: lọc ngay khi gõ (giữ hành vi cũ).
  useEffect(() => {
    if (!isServerMode) return;
    const timer = setTimeout(() => setAppliedSearch(searchTerm.trim()), SERVER_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isServerMode, searchTerm]);

  function setSearchTerm(value: string) {
    setSearchTermState(value);
    setVisibleCount(DATA_EXPLORER_BATCH_SIZE);
    if (!isServerMode) setAppliedSearch(value.trim());
  }

  /** Enter / nút kính lúp: tìm ngay, không chờ debounce. */
  function submitSearch() {
    setAppliedSearch(searchTerm.trim());
  }

  // ---- Chế độ client ----

  const clientRows = useMemo(() => {
    if (isServerMode) return [];

    const source = rows ?? [];
    const normalizedSearchTerm = normalizeText(appliedSearch);
    const filtered =
      normalizedSearchTerm && getSearchableText
        ? source.filter((row) => normalizeText(getSearchableText(row)).includes(normalizedSearchTerm))
        : source;

    const sortColumn = sort ? columns.find((column) => column.key === sort.key) : undefined;
    if (!sort || !sortColumn) return filtered;

    const directionFactor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((left, right) => {
      const leftValue = readSortValue(sortColumn, left);
      const rightValue = readSortValue(sortColumn, right);
      const isLeftEmpty = leftValue === null || leftValue === undefined || leftValue === "";
      const isRightEmpty = rightValue === null || rightValue === undefined || rightValue === "";
      if (isLeftEmpty || isRightEmpty) return Number(isLeftEmpty) - Number(isRightEmpty);
      return compareSortValues(leftValue, rightValue) * directionFactor;
    });
  }, [isServerMode, rows, appliedSearch, getSearchableText, sort, columns]);

  // ---- Chế độ server ----

  const [serverState, setServerState] = useState<ServerState<T>>({
    items: [],
    totalItems: null,
    hasMore: false,
    phase: "loading",
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);
  const nextPageRef = useRef(1);
  // getRowId thường là arrow function inline — giữ qua ref để không làm fetchPage đổi identity mỗi lần render.
  const getRowIdRef = useRef(getRowId);
  getRowIdRef.current = getRowId;

  const fetchPage = useCallback(
    async (isReset: boolean) => {
      if (!loadPage) return;
      if (!isReset && isFetchingRef.current) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      isFetchingRef.current = true;

      const page = isReset ? 1 : nextPageRef.current;
      setServerState((previous) =>
        isReset
          ? { items: [], totalItems: null, hasMore: false, phase: "loading", error: null }
          : { ...previous, phase: "loading-more", error: null },
      );

      try {
        const result = await loadPage(
          { page, pageSize: DATA_EXPLORER_BATCH_SIZE, search: appliedSearch },
          controller.signal,
        );
        if (controller.signal.aborted) return;

        nextPageRef.current = page + 1;
        const totalItems = result.totalItems ?? null;
        const hasMore =
          result.hasMore ??
          (result.items.length >= DATA_EXPLORER_BATCH_SIZE &&
            (totalItems === null || page * DATA_EXPLORER_BATCH_SIZE < totalItems));

        setServerState((previous) => {
          const baseItems = isReset ? [] : previous.items;
          const seenIds = new Set(baseItems.map((item) => getRowIdRef.current(item)));
          const freshItems = result.items.filter((item) => {
            const id = getRowIdRef.current(item);
            if (seenIds.has(id)) return false;
            seenIds.add(id);
            return true;
          });
          return { items: [...baseItems, ...freshItems], totalItems, hasMore, phase: "idle", error: null };
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setServerState((previous) => ({
          ...previous,
          phase: isReset ? "error" : "error-more",
          error: errorMessage(error, "Không thể tải dữ liệu."),
        }));
      } finally {
        if (controllerRef.current === controller) isFetchingRef.current = false;
      }
    },
    [loadPage, appliedSearch],
  );

  useEffect(() => {
    if (!loadPage) return;
    setSelectedIds(new Set());
    fetchPage(true);
    return () => controllerRef.current?.abort();
  }, [loadPage, fetchPage]);

  // ---- Đầu ra chung ----

  const visibleRows = isServerMode ? serverState.items : clientRows.slice(0, visibleCount);
  const totalItems = isServerMode ? serverState.totalItems : clientRows.length;
  const hasMore = isServerMode ? serverState.hasMore : visibleCount < clientRows.length;
  const isInitialLoading = isServerMode && serverState.phase === "loading";
  const isLoadingMore = isServerMode && serverState.phase === "loading-more";
  const initialError = isServerMode && serverState.phase === "error" ? serverState.error : null;
  const loadMoreError = isServerMode && serverState.phase === "error-more" ? serverState.error : null;

  const loadMore = useCallback(() => {
    if (!isServerMode) {
      setVisibleCount((count) => count + DATA_EXPLORER_BATCH_SIZE);
      return;
    }
    if (serverState.phase !== "idle" || !serverState.hasMore) return;
    fetchPage(false);
  }, [isServerMode, serverState.phase, serverState.hasMore, fetchPage]);

  const retry = useCallback(() => {
    fetchPage(serverState.phase === "error");
  }, [fetchPage, serverState.phase]);

  /** Tải lại từ trang 1 (vd. sau khi xóa 1 dòng ở chế độ server). */
  const reload = useCallback(() => fetchPage(true), [fetchPage]);

  function toggleSort(key: string) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
    setVisibleCount(DATA_EXPLORER_BATCH_SIZE);
  }

  /** Server mode chưa sắp xếp được (Backend chưa nhận sortBy cho các danh sách này). */
  function isColumnSortable(column: DataExplorerColumn<T>): boolean {
    if (isServerMode || column.sortable === false) return false;
    const sample = clientRows.find((row) => readSortValue(column, row) !== undefined);
    return sample !== undefined;
  }

  // ---- Chọn dòng ----

  const visibleIds = visibleRows.map((row) => getRowId(row));
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const isAllVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const isSomeVisibleSelected = selectedVisibleCount > 0 && !isAllVisibleSelected;

  // Chỉ giữ lựa chọn của dòng còn tồn tại (dòng vừa bị xóa / không còn trong dữ liệu).
  const sourceRows = isServerMode ? serverState.items : rows ?? [];
  const selectedRows = sourceRows.filter((row) => selectedIds.has(getRowId(row)));

  function toggleRowSelection(row: T) {
    const id = getRowId(row);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isAllVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return {
    isServerMode,
    searchTerm,
    setSearchTerm,
    submitSearch,
    appliedSearch,
    visibleRows,
    totalItems,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    initialError,
    loadMoreError,
    loadMore,
    retry,
    reload,
    sort,
    toggleSort,
    isColumnSortable,
    selectedIds,
    selectedRows,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    toggleRowSelection,
    toggleVisibleSelection,
    clearSelection,
  };
}
