export function getStored<T>(key: string, fallback?: T): T | undefined {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return raw === null ? fallback : (JSON.parse(raw) as T);
}

export function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStored(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
