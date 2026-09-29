import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type {
  AuditLogEntry,
  AuditLogFilter,
  CreateFiscalYearInput,
  CreateSystemSettingInput,
  ManagedFiscalYear,
  ManagedSystemSetting,
  UpdateFiscalYearInput,
  UpdateSystemSettingInput,
} from "../types/platform.types";

const listParams = { params: { pageSize: ADMIN_LIST_PAGE_SIZE } };

// ---- Năm tài chính: /api/v1/fiscal-years (không có API xóa) ----

export async function listFiscalYears(): Promise<ManagedFiscalYear[]> {
  return (await adminApi.get<PaginatedResult<ManagedFiscalYear>>("/fiscal-years", listParams)).items;
}

export function getFiscalYearById(id: string): Promise<ManagedFiscalYear> {
  return adminApi.get<ManagedFiscalYear>(`/fiscal-years/${id}`);
}

/** Backend trả 400 nếu ngày kết thúc không sau ngày bắt đầu. */
export function createFiscalYear(input: CreateFiscalYearInput): Promise<ManagedFiscalYear> {
  return adminApi.post<ManagedFiscalYear, CreateFiscalYearInput>("/fiscal-years", input);
}

export function updateFiscalYear(id: string, input: UpdateFiscalYearInput): Promise<ManagedFiscalYear> {
  return adminApi.put<ManagedFiscalYear, UpdateFiscalYearInput>(`/fiscal-years/${id}`, input);
}

// ---- Cài đặt hệ thống: /api/v1/system-settings ----

export async function listSystemSettings(): Promise<ManagedSystemSetting[]> {
  return (await adminApi.get<PaginatedResult<ManagedSystemSetting>>("/system-settings", listParams)).items;
}

export function getSystemSettingById(id: string): Promise<ManagedSystemSetting> {
  return adminApi.get<ManagedSystemSetting>(`/system-settings/${id}`);
}

export function createSystemSetting(input: CreateSystemSettingInput): Promise<ManagedSystemSetting> {
  return adminApi.post<ManagedSystemSetting, CreateSystemSettingInput>("/system-settings", input);
}

export function updateSystemSetting(id: string, input: UpdateSystemSettingInput): Promise<ManagedSystemSetting> {
  return adminApi.put<ManagedSystemSetting, UpdateSystemSettingInput>(`/system-settings/${id}`, input);
}

export function deleteSystemSetting(id: string): Promise<void> {
  return adminApi.delete<void>(`/system-settings/${id}`);
}

// ---- Nhật ký thay đổi: /api/v1/audit-logs (chỉ đọc, mới nhất trước) ----

export async function listAuditLogs(filter: AuditLogFilter): Promise<AuditLogEntry[]> {
  const page = await adminApi.get<PaginatedResult<AuditLogEntry>>("/audit-logs", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE, ...filter },
  });
  return page.items;
}
