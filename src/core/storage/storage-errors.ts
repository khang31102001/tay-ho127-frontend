export function isStorageAvailable(storage: Storage): boolean {
  try {
    const key = "__storage_test__";
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export type StorageError = Error & { code?: string };
