"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createPermission,
  deletePermission,
  getPermissionById,
  listPermissions,
  updatePermission,
} from "../services/permission.service";
import { flattenPermissionsAsTree, getDepth, type PermissionRow } from "../utils/permission-tree";

/** Khớp giới hạn độ sâu của Backend (Permission.MaxDepth) — chỉ để ẩn lựa chọn hiển nhiên sai, Backend vẫn kiểm tra. */
const MAX_TREE_DEPTH = 5;

export type PermissionFormValue = {
  code: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
  isGroup: boolean;
  sortOrder: number;
};

const EMPTY_FORM: PermissionFormValue = {
  code: "",
  name: "",
  isActive: true,
  parentId: null,
  isGroup: false,
  sortOrder: 0,
};

export function usePermissionEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PermissionFormValue>(EMPTY_FORM);
  const existing = useAsyncData(() => getPermissionById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải quyền.",
  });
  const all = useAsyncData(listPermissions, [], { fallbackError: "Không thể tải danh sách nhóm quyền." });

  useEffect(() => {
    if (existing.data) {
      const { code, name, isActive, parentId, isGroup, sortOrder } = existing.data;
      setForm({ code, name, isActive, parentId, isGroup, sortOrder });
    }
  }, [existing.data]);

  /** Nhóm có thể làm cha, theo thứ tự cây; loại chính nó + con cháu của nó và nhóm đã chạm độ sâu tối đa. */
  const parentOptions = useMemo<PermissionRow[]>(() => {
    const permissions = all.data ?? [];
    const rows = flattenPermissionsAsTree(permissions);
    const ownIndex = id === undefined ? -1 : rows.findIndex((row) => row.id === id);
    const excluded = new Set<string>();
    if (ownIndex >= 0) {
      excluded.add(rows[ownIndex].id);
      for (let index = ownIndex + 1; index < rows.length && rows[index].depth > rows[ownIndex].depth; index += 1) {
        excluded.add(rows[index].id);
      }
    }

    return rows.filter(
      (row) => row.isGroup && !excluded.has(row.id) && getDepth(row.id, permissions) < MAX_TREE_DEPTH,
    );
  }, [all.data, id]);

  function updateField<K extends keyof PermissionFormValue>(field: K, value: PermissionFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updatePermission(id, {
        name: form.name,
        isActive: form.isActive,
        parentId: form.parentId,
        isGroup: form.isGroup,
        sortOrder: form.sortOrder,
      });
    } else {
      await createPermission({
        code: form.code,
        name: form.name,
        parentId: form.parentId,
        isGroup: form.isGroup,
        sortOrder: form.sortOrder,
      });
    }
  }

  async function handleDelete() {
    if (isEditMode) await deletePermission(id);
  }

  function goToExplore() {
    router.push("/admin/permissions");
  }

  return {
    form,
    updateField,
    parentOptions,
    isLoading: existing.isLoading || all.isLoading,
    loadError: existing.error ?? all.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
