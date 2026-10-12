"use client";

import { useState } from "react";

export function usePagination(initialPage: number = 1, pageSize: number = 20) {
  const [page, setPage] = useState(initialPage);

  return {
    page,
    pageSize,
    goToPage: setPage,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
