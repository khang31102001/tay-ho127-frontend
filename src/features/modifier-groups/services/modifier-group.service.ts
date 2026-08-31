import type { ManagedModifierGroup } from "../types/modifier-group.types";
import { SEED_MODIFIER_GROUPS } from "../mocks/modifier-group.mock";

const STORAGE_KEY = "tayho-admin-modifier-groups";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedModifierGroup[] {
  if (typeof window === "undefined") {
    return SEED_MODIFIER_GROUPS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedModifierGroup[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu nhóm tùy chọn món:", error);
  }

  return SEED_MODIFIER_GROUPS;
}

function writeStore(groups: ManagedModifierGroup[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error("Không thể lưu dữ liệu nhóm tùy chọn món:", error);
  }
}

export async function listModifierGroups(): Promise<ManagedModifierGroup[]> {
  await delay();
  return readStore();
}

export async function getModifierGroupById(id: string): Promise<ManagedModifierGroup | null> {
  await delay();
  return readStore().find((group) => group.id === id) ?? null;
}

/** Dùng bởi Site (ProductDetail) — không delay/log lỗi khác biệt, chỉ là alias rõ nghĩa hơn cho nhiều id cùng lúc. */
export async function listModifierGroupsByIds(ids: string[]): Promise<ManagedModifierGroup[]> {
  await delay();
  const idSet = new Set(ids);
  return readStore().filter((group) => idSet.has(group.id));
}

export type ModifierGroupUpsertInput = Omit<ManagedModifierGroup, "id" | "createdAt" | "updatedAt">;

export async function createModifierGroup(payload: ModifierGroupUpsertInput): Promise<ManagedModifierGroup> {
  await delay();
  const now = new Date().toISOString();
  const newGroup: ManagedModifierGroup = { ...payload, id: `modgroup-${Date.now()}`, createdAt: now, updatedAt: now };

  writeStore([...readStore(), newGroup]);

  return newGroup;
}

export async function updateModifierGroup(
  id: string,
  payload: ModifierGroupUpsertInput,
): Promise<ManagedModifierGroup> {
  await delay();
  const current = readStore().find((group) => group.id === id);
  const updated: ManagedModifierGroup = {
    ...payload,
    id,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore(readStore().map((group) => (group.id === id ? updated : group)));

  return updated;
}

export async function deleteModifierGroup(id: string): Promise<void> {
  await delay();
  writeStore(readStore().filter((group) => group.id !== id));
}
