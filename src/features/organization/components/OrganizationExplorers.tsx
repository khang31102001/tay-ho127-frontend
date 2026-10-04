"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import type { ManagedOrganization } from "../types/organization.types";
import {
  type BrandRow,
  type DepartmentRow,
  useBrandsExplorer,
  useDepartmentsExplorer,
  useOrganizationsExplorer,
} from "../hooks/useOrganizationExplorers";

const statusColumn = {
  key: "isActive",
  header: "Trạng thái",
  render: (row: { isActive: boolean }) => <StatusBadge status={statusFromIsActive(row.isActive)} />,
};
const codeColumn = { key: "code", header: "Mã", className: "font-mono text-[13px]" };

const organizationColumns: DataExplorerColumn<ManagedOrganization>[] = [
  { key: "name", header: "Tên tổ chức" },
  codeColumn,
  statusColumn,
];

export function OrganizationsExplorer() {
  const { organizations, isLoading, loadError } = useOrganizationsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedOrganization>
      title="Tổ chức"
      columns={organizationColumns}
      rows={organizations}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm tổ chức..."
      createHref={hasPermission("organizations.create") ? "/admin/organization/organizations/new" : undefined}
      createLabel="Thêm tổ chức"
      editHref={(row) => `/admin/organization/organizations/${row.id}`}
      emptyState={loadError ?? "Chưa có tổ chức nào."}
    />
  );
}

const departmentColumns: DataExplorerColumn<DepartmentRow>[] = [
  {
    key: "name",
    header: "Phòng ban",
    render: (row) => (
      <span style={{ paddingLeft: `${row.depth * 20}px` }}>
        {row.depth > 0 && "↳ "}
        {row.name}
      </span>
    ),
  },
  codeColumn,
  { key: "organizationName", header: "Tổ chức" },
  statusColumn,
];

export function DepartmentsExplorer() {
  const { rows, isLoading, loadError } = useDepartmentsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<DepartmentRow>
      title="Phòng ban"
      columns={departmentColumns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code} ${row.organizationName} ${row.parentName}`}
      searchPlaceholder="Tìm phòng ban..."
      createHref={hasPermission("departments.create") ? "/admin/organization/departments/new" : undefined}
      createLabel="Thêm phòng ban"
      editHref={(row) => `/admin/organization/departments/${row.id}`}
      emptyState={loadError ?? "Chưa có phòng ban nào."}
    />
  );
}

const brandColumns: DataExplorerColumn<BrandRow>[] = [
  { key: "name", header: "Chi nhánh" },
  codeColumn,
  { key: "organizationName", header: "Tổ chức" },
  { key: "addressLine", header: "Địa chỉ", render: (row) => row.contact.addressLine ?? "—" },
  { key: "phone", header: "Điện thoại", render: (row) => row.contact.phone ?? "—" },
  {
    key: "isPrimary",
    header: "Hiển thị trên website",
    render: (row) => (row.isPrimary ? "Chi nhánh chính" : "—"),
  },
  statusColumn,
];

export function BrandsExplorer() {
  const { rows, isLoading, loadError } = useBrandsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<BrandRow>
      title="Chi nhánh"
      columns={brandColumns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code} ${row.organizationName}`}
      searchPlaceholder="Tìm chi nhánh..."
      createHref={hasPermission("brands.create") ? "/admin/organization/brands/new" : undefined}
      createLabel="Thêm chi nhánh"
      editHref={(row) => `/admin/organization/brands/${row.id}`}
      emptyState={loadError ?? "Chưa có chi nhánh nào."}
    />
  );
}
