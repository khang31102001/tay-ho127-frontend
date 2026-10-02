"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { listOrganizations } from "@/features/organization";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createFiscalYear,
  createSystemSetting,
  deleteSystemSetting,
  getFiscalYearById,
  getSystemSettingById,
  updateFiscalYear,
  updateSystemSetting,
} from "../services/platform.service";

type FiscalYearForm = { organizationId: string; code: string; name: string; startDate: string; endDate: string; isActive: boolean };

export function useFiscalYearEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;
  const [form, setForm] = useState<FiscalYearForm>({ organizationId: "", code: "", name: "", startDate: "", endDate: "", isActive: true });

  const organizations = useAsyncData(listOrganizations, [], { fallbackError: "Không thể tải danh sách tổ chức." });
  const existing = useAsyncData(() => getFiscalYearById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải năm tài chính.",
  });

  useEffect(() => {
    const fiscalYear = existing.data;
    if (fiscalYear) {
      const { organizationId, code, name, startDate, endDate, isActive } = fiscalYear;
      setForm({ organizationId, code, name, startDate, endDate, isActive });
    }
  }, [existing.data]);

  async function handleSave() {
    const { organizationId, code, name, startDate, endDate, isActive } = form;
    if (isEditMode) {
      await updateFiscalYear(id, { name, isActive, startDate, endDate });
    } else {
      await createFiscalYear({ organizationId, code, name, startDate, endDate });
    }
  }

  return {
    form,
    updateField: <K extends keyof FiscalYearForm>(field: K, value: FiscalYearForm[K]) =>
      setForm((previous) => ({ ...previous, [field]: value })),
    organizations: organizations.data ?? [],
    isLoading: organizations.isLoading || existing.isLoading,
    loadError: organizations.error ?? existing.error,
    isEditMode,
    handleSave,
    goToExplore: () => router.push("/admin/system/fiscal-years"),
  };
}

type SystemSettingForm = { code: string; name: string; value: string; organizationId: string; isActive: boolean };

export function useSystemSettingEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;
  const [form, setForm] = useState<SystemSettingForm>({ code: "", name: "", value: "", organizationId: "", isActive: true });

  const organizations = useAsyncData(listOrganizations, [], { fallbackError: "Không thể tải danh sách tổ chức." });
  const existing = useAsyncData(() => getSystemSettingById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải cài đặt.",
  });

  useEffect(() => {
    const setting = existing.data;
    if (setting) {
      setForm({ code: setting.code, name: setting.name, value: setting.value, organizationId: setting.organizationId ?? "", isActive: setting.isActive });
    }
  }, [existing.data]);

  async function handleSave() {
    if (isEditMode) {
      await updateSystemSetting(id, { name: form.name, value: form.value, isActive: form.isActive });
    } else {
      await createSystemSetting({ code: form.code, name: form.name, value: form.value, organizationId: form.organizationId || null });
    }
  }

  async function handleDelete() {
    if (isEditMode) await deleteSystemSetting(id);
  }

  return {
    form,
    updateField: <K extends keyof SystemSettingForm>(field: K, value: SystemSettingForm[K]) =>
      setForm((previous) => ({ ...previous, [field]: value })),
    organizations: organizations.data ?? [],
    isLoading: organizations.isLoading || existing.isLoading,
    loadError: organizations.error ?? existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore: () => router.push("/admin/system/settings"),
  };
}
