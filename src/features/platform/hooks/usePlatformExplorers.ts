"use client";

import { useCallback, useMemo, useState } from "react";

import { listOrganizations } from "@/features/organization";
import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

import type { AuditLogEntry, AuditLogFilter, ManagedFiscalYear, ManagedSystemSetting } from "../types/platform.types";
import { deleteSystemSetting, listAuditLogsPage, listFiscalYears, listSystemSettings } from "../services/platform.service";

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

/**
 * Tải theo trang từ Backend (10 dòng/lượt). Bộ lọc nâng cao áp dụng khi bấm "Lọc"; ô tìm kiếm được Backend
 * tìm theo hành động/đối tượng.
 */
export function useAuditLogsExplorer() {
  const [draftFilter, setDraftFilter] = useState<AuditLogFilter>({});
  const [appliedFilter, setAppliedFilter] = useState<AuditLogFilter>({});

  const loadPage = useCallback<DataExplorerLoadPage<AuditLogEntry>>(
    async (query, signal) => {
      const page = await listAuditLogsPage({ ...query, ...appliedFilter }, signal);
      return { items: page.items, totalItems: page.totalItems };
    },
    [appliedFilter],
  );

  return {
    loadPage,
    draftFilter,
    updateDraftFilter: (field: keyof AuditLogFilter, value: string) =>
      setDraftFilter((previous) => ({ ...previous, [field]: value || undefined })),
    applyFilter: () => setAppliedFilter(draftFilter),
  };
}
