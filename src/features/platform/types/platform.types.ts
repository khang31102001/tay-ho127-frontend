/** Module Platform của Backend: năm tài chính, cài đặt hệ thống, nhật ký thay đổi (audit log). */

export type ManagedFiscalYear = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  isActive: boolean;
  /** Ngày (yyyy-MM-dd), không có giờ. */
  startDate: string;
  endDate: string;
};

export type CreateFiscalYearInput = { organizationId: string; code: string; name: string; startDate: string; endDate: string };
export type UpdateFiscalYearInput = { name: string; isActive: boolean; startDate: string; endDate: string };

export type ManagedSystemSetting = {
  id: string;
  code: string;
  name: string;
  value: string;
  isActive: boolean;
  /** null = cài đặt toàn hệ thống; có giá trị = ghi đè riêng cho 1 tổ chức. */
  organizationId: string | null;
};

export type CreateSystemSettingInput = { code: string; name: string; value: string; organizationId: string | null };
export type UpdateSystemSettingInput = { name: string; value: string; isActive: boolean };

export type AuditLogEntry = {
  id: string;
  actorUserId: string | null;
  /** Created | Updated | Deleted. */
  action: string;
  entityName: string;
  entityId: string;
  changesJson: string | null;
  atUtc: string;
  correlationId: string | null;
};

/** Bộ lọc server-side của GET /audit-logs (ngày theo yyyy-MM-dd). */
export type AuditLogFilter = { entityName?: string; fromDate?: string; toDate?: string };
