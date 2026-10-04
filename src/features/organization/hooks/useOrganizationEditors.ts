"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createBrand,
  createDepartment,
  createOrganization,
  getBrandById,
  getDepartmentById,
  getOrganizationById,
  listDepartments,
  listOrganizations,
  updateBrand,
  updateDepartment,
  updateOrganization,
} from "../services/organization.service";
import type { BranchContact } from "../types/organization.types";

type CodeNameStatusForm = { code: string; name: string; isActive: boolean };

export function useOrganizationEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;
  const [form, setForm] = useState<CodeNameStatusForm>({ code: "", name: "", isActive: true });

  const existing = useAsyncData(() => getOrganizationById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải tổ chức.",
  });

  useEffect(() => {
    if (existing.data) setForm({ code: existing.data.code, name: existing.data.name, isActive: existing.data.isActive });
  }, [existing.data]);

  async function handleSave() {
    if (isEditMode) {
      await updateOrganization(id, { name: form.name, isActive: form.isActive });
    } else {
      await createOrganization({ code: form.code, name: form.name });
    }
  }

  return {
    form,
    updateField: <K extends keyof CodeNameStatusForm>(field: K, value: CodeNameStatusForm[K]) =>
      setForm((previous) => ({ ...previous, [field]: value })),
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    goToExplore: () => router.push("/admin/organization/organizations"),
  };
}

type DepartmentForm = CodeNameStatusForm & { organizationId: string; parentId: string };

export function useDepartmentEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;
  const [form, setForm] = useState<DepartmentForm>({ code: "", name: "", isActive: true, organizationId: "", parentId: "" });

  const options = useAsyncData(() => Promise.all([listOrganizations(), listDepartments()]), [], {
    fallbackError: "Không thể tải tổ chức / phòng ban.",
  });
  const existing = useAsyncData(() => getDepartmentById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải phòng ban.",
  });

  useEffect(() => {
    const department = existing.data;
    if (department) {
      setForm({
        code: department.code,
        name: department.name,
        isActive: department.isActive,
        organizationId: department.organizationId,
        parentId: department.parentId ?? "",
      });
    }
  }, [existing.data]);

  const [organizations = [], departments = []] = options.data ?? [];
  // Phòng ban cha phải cùng tổ chức; Backend chặn thêm trường hợp tạo vòng lặp (trả 400).
  const parentOptions = departments.filter((department) => department.organizationId === form.organizationId && department.id !== id);

  function updateField<K extends keyof DepartmentForm>(field: K, value: DepartmentForm[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      // Đổi tổ chức thì bỏ chọn phòng ban cha của tổ chức cũ.
      ...(field === "organizationId" ? { parentId: "" } : {}),
    }));
  }

  async function handleSave() {
    const parentId = form.parentId || null;
    if (isEditMode) {
      await updateDepartment(id, { name: form.name, isActive: form.isActive, parentId });
    } else {
      await createDepartment({ organizationId: form.organizationId, code: form.code, name: form.name, parentId });
    }
  }

  return {
    form,
    updateField,
    organizations,
    parentOptions,
    isLoading: options.isLoading || existing.isLoading,
    loadError: options.error ?? existing.error,
    isEditMode,
    handleSave,
    goToExplore: () => router.push("/admin/organization/departments"),
  };
}

const EMPTY_CONTACT: BranchContact = {
  phone: null,
  hotline: null,
  email: null,
  addressLine: null,
  ward: null,
  district: null,
  province: null,
  openTime: null,
  closeTime: null,
  businessHoursNote: null,
};

type BrandForm = CodeNameStatusForm & { organizationId: string; isPrimary: boolean; contact: BranchContact };

export function useBrandEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;
  const [form, setForm] = useState<BrandForm>({
    code: "",
    name: "",
    isActive: true,
    organizationId: "",
    isPrimary: false,
    contact: EMPTY_CONTACT,
  });

  const organizations = useAsyncData(listOrganizations, [], { fallbackError: "Không thể tải danh sách tổ chức." });
  const existing = useAsyncData(() => getBrandById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải chi nhánh.",
  });

  useEffect(() => {
    const brand = existing.data;
    if (brand) {
      setForm({
        code: brand.code,
        name: brand.name,
        isActive: brand.isActive,
        organizationId: brand.organizationId,
        isPrimary: brand.isPrimary,
        contact: brand.contact,
      });
    }
  }, [existing.data]);

  async function handleSave() {
    if (isEditMode) {
      await updateBrand(id, { name: form.name, isActive: form.isActive, contact: form.contact, isPrimary: form.isPrimary });
    } else {
      await createBrand({ organizationId: form.organizationId, code: form.code, name: form.name });
    }
  }

  return {
    form,
    updateField: <K extends keyof BrandForm>(field: K, value: BrandForm[K]) =>
      setForm((previous) => ({ ...previous, [field]: value })),
    organizations: organizations.data ?? [],
    isLoading: organizations.isLoading || existing.isLoading,
    loadError: organizations.error ?? existing.error,
    isEditMode,
    handleSave,
    goToExplore: () => router.push("/admin/organization/brands"),
  };
}
