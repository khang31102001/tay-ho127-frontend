export function getSessionStored<T>(key: string, fallback?: T): T | undefined {
  if (typeof window === "undefined") return fallback;
  const raw = window.sessionStorage.getItem(key);
  return raw === null ? fallback : (JSON.parse(raw) as T);
}

export function setSessionStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionStored(key: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}
