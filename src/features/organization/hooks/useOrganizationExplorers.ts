"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedBrand, ManagedDepartment } from "../types/organization.types";
import { listBrands, listDepartments, listOrganizations } from "../services/organization.service";

export function useOrganizationsExplorer() {
  const { data, isLoading, error } = useAsyncData(listOrganizations, [], {
    fallbackError: "Không thể tải danh sách tổ chức.",
  });
  return { organizations: data ?? [], isLoading, loadError: error };
}

export type DepartmentRow = ManagedDepartment & { organizationName: string; parentName: string; depth: number };

export function useDepartmentsExplorer() {
  const { data, isLoading, error } = useAsyncData(() => Promise.all([listDepartments(), listOrganizations()]), [], {
    fallbackError: "Không thể tải danh sách phòng ban.",
  });

  // Hiển thị theo cây: mỗi tổ chức, phòng ban gốc rồi tới phòng ban con (thụt lề theo depth).
  const rows = useMemo<DepartmentRow[]>(() => {
    const [departments = [], organizations = []] = data ?? [];
    const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.name]));
    const byId = new Map(departments.map((department) => [department.id, department]));
    const byName = (a: ManagedDepartment, b: ManagedDepartment) => a.name.localeCompare(b.name);

    function subtree(parent: ManagedDepartment, depth: number): DepartmentRow[] {
      const row: DepartmentRow = {
        ...parent,
        organizationName: organizationNames.get(parent.organizationId) ?? "",
        parentName: parent.parentId ? byId.get(parent.parentId)?.name ?? "" : "",
        depth,
      };
      const children = departments.filter((department) => department.parentId === parent.id).sort(byName);
      return [row, ...children.flatMap((child) => subtree(child, depth + 1))];
    }

    return departments
      .filter((department) => !department.parentId || !byId.has(department.parentId))
      .sort((a, b) => (organizationNames.get(a.organizationId) ?? "").localeCompare(organizationNames.get(b.organizationId) ?? "") || byName(a, b))
      .flatMap((root) => subtree(root, 0));
  }, [data]);

  return { rows, isLoading, loadError: error };
}

export type BrandRow = ManagedBrand & { organizationName: string };

export function useBrandsExplorer() {
  const { data, isLoading, error } = useAsyncData(() => Promise.all([listBrands(), listOrganizations()]), [], {
    fallbackError: "Không thể tải danh sách chi nhánh.",
  });

  const rows = useMemo<BrandRow[]>(() => {
    const [brands = [], organizations = []] = data ?? [];
    const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.name]));
    return brands.map((brand) => ({ ...brand, organizationName: organizationNames.get(brand.organizationId) ?? "" }));
  }, [data]);

  return { rows, isLoading, loadError: error };
}
