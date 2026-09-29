"use client";

import { useMemo, useState } from "react";

import { listOrganizations } from "@/features/organization";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { AuditLogFilter, ManagedFiscalYear, ManagedSystemSetting } from "../types/platform.types";
import { deleteSystemSetting, listAuditLogs, listFiscalYears, listSystemSettings } from "../services/platform.service";

export type FiscalYearRow = ManagedFiscalYear & { organizationName: string };

export function useFiscalYearsExplorer() {
  const { data, isLoading, error } = useAsyncData(() => Promise.all([listFiscalYears(), listOrganizations()]), [], {
    fallbackError: "Không thể tải danh sách năm tài chính.",
  });

  const rows = useMemo<FiscalYearRow[]>(() => {
    const [fiscalYears = [], organizations = []] = data ?? [];
    const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.name]));
    return fiscalYears.map((fiscalYear) => ({ ...fiscalYear, organizationName: organizationNames.get(fiscalYear.organizationId) ?? "" }));
  }, [data]);

  return { rows, isLoading, loadError: error };
}

export function useSystemSettingsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listSystemSettings, [], {
    fallbackError: "Không thể tải cài đặt hệ thống.",
  });

  async function handleDelete(setting: ManagedSystemSetting) {
    await deleteSystemSetting(setting.id);
    await reload();
  }

  return { settings: data ?? [], isLoading, loadError: error, handleDelete };
}

/** Bộ lọc áp dụng khi bấm "Lọc" (gọi lại Backend) — gõ trong ô tìm kiếm chỉ lọc tại chỗ trên kết quả đã tải. */
export function useAuditLogsExplorer() {
  const [draftFilter, setDraftFilter] = useState<AuditLogFilter>({});
  const [appliedFilter, setAppliedFilter] = useState<AuditLogFilter>({});

  const { data, isLoading, error } = useAsyncData(() => listAuditLogs(appliedFilter), [appliedFilter], {
    fallbackError: "Không thể tải nhật ký thay đổi.",
  });

  return {
    entries: data ?? [],
    isLoading,
    loadError: error,
    draftFilter,
    updateDraftFilter: (field: keyof AuditLogFilter, value: string) =>
      setDraftFilter((previous) => ({ ...previous, [field]: value || undefined })),
    applyFilter: () => setAppliedFilter(draftFilter),
  };
}
