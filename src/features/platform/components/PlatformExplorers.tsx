"use client";

import { DataExplorer, type DataExplorerColumn } from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/shared/admin/templates/StatusBadge";
import { adminButtonClassName, adminControlClassName } from "@/shared/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";

import type { AuditLogEntry, ManagedSystemSetting } from "../types/platform.types";
import {
  type FiscalYearRow,
  useAuditLogsExplorer,
  useFiscalYearsExplorer,
  useSystemSettingsExplorer,
} from "../hooks/usePlatformExplorers";

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString("vi-VN");

const fiscalYearColumns: DataExplorerColumn<FiscalYearRow>[] = [
  { key: "name", header: "Năm tài chính" },
  { key: "code", header: "Mã", className: "font-mono text-[13px]" },
  { key: "organizationName", header: "Tổ chức" },
  { key: "period", header: "Thời gian", render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` },
  { key: "isActive", header: "Trạng thái", render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} /> },
];

export function FiscalYearsExplorer() {
  const { rows, isLoading, loadError } = useFiscalYearsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<FiscalYearRow>
      title="Năm tài chính"
      columns={fiscalYearColumns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code} ${row.organizationName}`}
      searchPlaceholder="Tìm năm tài chính..."
      createHref={hasPermission("fiscal-years.create") ? "/admin/system/fiscal-years/new" : undefined}
      createLabel="Thêm năm tài chính"
      editHref={(row) => `/admin/system/fiscal-years/${row.id}`}
      loadError={loadError}
      emptyState="Chưa có năm tài chính nào."
    />
  );
}

const systemSettingColumns: DataExplorerColumn<ManagedSystemSetting>[] = [
  { key: "code", header: "Mã", className: "font-mono text-[13px]" },
  { key: "name", header: "Tên" },
  { key: "value", header: "Giá trị", render: (row) => <span className="line-clamp-2 break-all">{row.value}</span> },
  { key: "scope", header: "Phạm vi", render: (row) => (row.organizationId ? "Riêng tổ chức" : "Toàn hệ thống") },
  { key: "isActive", header: "Trạng thái", render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} /> },
];

export function SystemSettingsExplorer() {
  const { settings, isLoading, loadError, handleDelete } = useSystemSettingsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedSystemSetting>
      title="Cài đặt hệ thống"
      columns={systemSettingColumns}
      rows={settings}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.code} ${row.name} ${row.value}`}
      searchPlaceholder="Tìm theo mã, tên, giá trị..."
      createHref={hasPermission("system-settings.create") ? "/admin/system/settings/new" : undefined}
      createLabel="Thêm cài đặt"
      editHref={(row) => `/admin/system/settings/${row.id}`}
      onDelete={hasPermission("system-settings.delete") ? handleDelete : undefined}
      loadError={loadError}
      emptyState="Chưa có cài đặt nào."
    />
  );
}

const ACTION_LABELS: Record<string, string> = { Created: "Tạo mới", Updated: "Cập nhật", Deleted: "Xóa" };

const auditLogColumns: DataExplorerColumn<AuditLogEntry>[] = [
  { key: "atUtc", header: "Thời điểm", render: (row) => new Date(row.atUtc).toLocaleString("vi-VN") },
  { key: "action", header: "Hành động", render: (row) => ACTION_LABELS[row.action] ?? row.action },
  { key: "entityName", header: "Đối tượng" },
  { key: "entityId", header: "Mã bản ghi", className: "font-mono text-[11px]" },
  {
    key: "changesJson",
    header: "Thay đổi",
    render: (row) =>
      row.changesJson ? (
        <span className="line-clamp-2 break-all font-mono text-[11px]" title={row.changesJson}>
          {row.changesJson}
        </span>
      ) : (
        "—"
      ),
  },
  { key: "actorUserId", header: "Người thực hiện", className: "font-mono text-[11px]", render: (row) => row.actorUserId ?? "Hệ thống" },
];

export function AuditLogsExplorer() {
  const { loadPage, draftFilter, updateDraftFilter, applyFilter } = useAuditLogsExplorer();

  const advancedFilters = (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilter();
      }}
    >
      <input
        type="text"
        placeholder="Đối tượng (vd. Organization)"
        aria-label="Đối tượng"
        value={draftFilter.entityName ?? ""}
        onChange={(event) => updateDraftFilter("entityName", event.target.value)}
        className={`${adminControlClassName} w-52`}
      />
      <input
        type="date"
        aria-label="Từ ngày"
        value={draftFilter.fromDate ?? ""}
        onChange={(event) => updateDraftFilter("fromDate", event.target.value)}
        className={`${adminControlClassName} w-40`}
      />
      <input
        type="date"
        aria-label="Đến ngày"
        value={draftFilter.toDate ?? ""}
        onChange={(event) => updateDraftFilter("toDate", event.target.value)}
        className={`${adminControlClassName} w-40`}
      />
      <button type="submit" className={adminButtonClassName.primary}>
        Lọc
      </button>
    </form>
  );

  return (
    <DataExplorer<AuditLogEntry>
      title="Nhật ký thay đổi"
      columns={auditLogColumns}
      loadPage={loadPage}
      getRowId={(row) => row.id}
      searchPlaceholder="Tìm theo hành động, đối tượng..."
      advancedFilters={advancedFilters}
      emptyState="Không có thay đổi nào khớp bộ lọc."
      totalLabel="thay đổi"
    />
  );
}
