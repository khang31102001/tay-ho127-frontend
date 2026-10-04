"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { getPermissionTree, indexLeafCodes, applyLeafSelection } from "@/features/permissions";
import { listPages } from "@/features/pages";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createItem,
  deleteItem,
  getItemById,
  getItemPermissionCodes,
  listItemsByMenuId,
  setItemPermissionCodes,
  updateItem,
} from "../services/navigation.service";
import type { NavigationScope, NavigationTargetType } from "../types/navigation.types";
import { getNavigationPaths, MAX_NAVIGATION_DEPTH } from "../utils/navigation-scope";
import {
  buildNavigationTree,
  collectDescendantIds,
  getItemDepth,
  getSubtreeHeight,
  sortNavigationTree,
} from "../utils/navigation-tree";
import { useNavigationMenu } from "./useNavigationMenu";

export type NavigationItemFormValue = {
  code: string;
  label: string;
  parentId: string | null;
  isGroup: boolean;
  /** Route Admin / route nội bộ / URL ngoài của Website — tùy loại. */
  url: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  targetType: NavigationTargetType;
  targetId: string | null;
  openInNewTab: boolean;
  /** Mã quyền (lá) gate item — chỉ Admin sidebar dùng. */
  permissionCodes: string[];
};

const EMPTY_FORM: NavigationItemFormValue = {
  code: "",
  label: "",
  parentId: null,
  isGroup: false,
  url: "",
  icon: null,
  sortOrder: 1,
  isActive: true,
  targetType: "route",
  targetId: null,
  openInNewTab: false,
  permissionCodes: [],
};

export type ParentOption = { id: string; label: string; depth: number };

type UseNavigationItemEditorParams = {
  scope: NavigationScope;
  menuId?: string;
  itemId?: string;
  /** Có quyền "menus.permissions.manage" — không có thì giữ nguyên quyền gate khi lưu. */
  canManagePermissions: boolean;
};

export function useNavigationItemEditor({ scope, menuId: menuIdParam, itemId, canManagePermissions }: UseNavigationItemEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = itemId !== undefined;
  const isAdminScope = scope === "admin";

  const [form, setForm] = useState<NavigationItemFormValue>(EMPTY_FORM);

  const menu = useNavigationMenu(scope, menuIdParam);
  const menuId = menu.data?.id;
  const paths = getNavigationPaths(scope, menuIdParam);

  const items = useAsyncData(() => listItemsByMenuId(menuId ?? ""), [menuId], {
    enabled: menuId !== undefined,
    fallbackError: "Không thể tải cấu trúc menu.",
  });
  const existing = useAsyncData(
    async () => {
      const item = await getItemById(itemId ?? "");
      const codes = isAdminScope ? await getItemPermissionCodes(itemId ?? "") : [];
      return { item, codes };
    },
    [itemId, isAdminScope],
    { enabled: isEditMode, fallbackError: "Không thể tải mục menu." },
  );
  // Danh sách Page (loại đích "page") — editor không có quyền xem Page vẫn dùng được các loại đích còn lại.
  const pages = useAsyncData(() => listPages().catch(() => []), [], { enabled: !isAdminScope });
  const permissionTree = useAsyncData(getPermissionTree, [], {
    enabled: isAdminScope,
    fallbackError: "Không thể tải danh sách quyền.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { item, codes } = existing.data;
    setForm({
      code: item.code,
      label: item.label,
      parentId: item.parentId,
      isGroup: item.isGroup,
      url: item.url ?? "",
      icon: item.icon,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      targetType: item.site?.targetType ?? "route",
      targetId: item.site?.targetId ?? null,
      openInNewTab: item.site?.openInNewTab ?? false,
      permissionCodes: codes,
    });
  }, [existing.data]);

  const flatItems = useMemo(() => items.data ?? [], [items.data]);

  /** Mục có thể làm cha, theo thứ tự cây có thụt lề: loại chính nó + con cháu và vị trí làm cây vượt độ sâu tối đa. */
  const parentOptions = useMemo<ParentOption[]>(() => {
    const excluded = itemId ? collectDescendantIds(itemId, flatItems) : new Set<string>();
    const ownHeight = itemId ? getSubtreeHeight(itemId, flatItems) : 1;
    const options: ParentOption[] = [];

    function visit(nodes: ReturnType<typeof buildNavigationTree>, depth: number) {
      nodes.forEach((node) => {
        if (!excluded.has(node.id) && getItemDepth(node.id, flatItems) + ownHeight <= MAX_NAVIGATION_DEPTH) {
          options.push({ id: node.id, label: node.label, depth });
        }
        visit(node.children, depth + 1);
      });
    }

    visit(sortNavigationTree(buildNavigationTree(flatItems)), 0);
    return options;
  }, [flatItems, itemId]);

  const { idByCode, codeById } = useMemo(() => indexLeafCodes(permissionTree.data ?? []), [permissionTree.data]);
  const selectedPermissionIds = useMemo(
    () => form.permissionCodes.flatMap((code) => (idByCode.has(code) ? [idByCode.get(code)!] : [])),
    [form.permissionCodes, idByCode],
  );

  function updateField<K extends keyof NavigationItemFormValue>(field: K, value: NavigationItemFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  /** Tick/bỏ tick quyền lá hoặc cả nhóm quyền; mã quyền không còn trong cây (đã tắt) được giữ nguyên. */
  function togglePermissionLeaves(leafIds: string[], checked: boolean) {
    setForm((previous) => {
      const knownCodes = new Set(codeById.values());
      const keptUnknown = previous.permissionCodes.filter((code) => !knownCodes.has(code));
      const currentIds = previous.permissionCodes.flatMap((code) => (idByCode.has(code) ? [idByCode.get(code)!] : []));
      const nextCodes = applyLeafSelection(currentIds, leafIds, checked).flatMap((id) =>
        codeById.has(id) ? [codeById.get(id)!] : [],
      );
      return { ...previous, permissionCodes: [...keptUnknown, ...nextCodes] };
    });
  }

  async function handleSave() {
    if (!menuId) throw new Error("Chưa xác định được menu.");
    if (!form.label.trim()) throw new Error("Nhãn hiển thị (label) không được để trống.");

    const isLink = !form.isGroup;
    if (isLink && isAdminScope && !form.url.trim().startsWith("/")) {
      throw new Error("Route Admin phải bắt đầu bằng '/' (vd. /admin/users).");
    }
    if (isLink && !isAdminScope) {
      if (form.targetType === "page" && !form.targetId) throw new Error("Vui lòng chọn trang CMS (Page).");
      if (form.targetType === "route" && !form.url.trim().startsWith("/")) throw new Error("Route nội bộ phải bắt đầu bằng '/'.");
      if (form.targetType === "external" && !/^https?:\/\//i.test(form.url.trim())) {
        throw new Error("URL ngoài phải bắt đầu bằng http:// hoặc https://.");
      }
    }

    const payload = {
      label: form.label.trim(),
      parentId: form.parentId,
      isGroup: form.isGroup,
      url: !isLink || (!isAdminScope && form.targetType === "page") ? null : form.url.trim(),
      icon: isAdminScope ? form.icon : null,
      sortOrder: form.sortOrder,
      site:
        isLink && !isAdminScope
          ? { targetType: form.targetType, targetId: form.targetType === "page" ? form.targetId : null, openInNewTab: form.openInNewTab }
          : null,
    };

    const saved = isEditMode
      ? await updateItem(itemId, { ...payload, isActive: form.isActive })
      : await createItem({ ...payload, menuId, code: form.code.trim() || null });

    if (isAdminScope && canManagePermissions) {
      await setItemPermissionCodes(saved.id, form.permissionCodes);
    }
  }

  async function handleDelete() {
    if (isEditMode) await deleteItem(itemId);
  }

  function goToTree() {
    router.push(paths.tree);
  }

  return {
    form,
    updateField,
    menu: menu.data,
    pages: pages.data ?? [],
    parentOptions,
    permissionTree: permissionTree.data ?? [],
    selectedPermissionIds,
    togglePermissionLeaves,
    isLoading: menu.isLoading || items.isLoading || existing.isLoading,
    loadError: menu.error ?? items.error ?? existing.error ?? permissionTree.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToTree,
    treePath: paths.tree,
  };
}
