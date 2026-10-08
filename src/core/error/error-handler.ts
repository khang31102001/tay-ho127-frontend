export function normalizeError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : String(error);
  }

  return error instanceof Error ? error.message : String(error);
}

export function handleError(error: unknown) {
  return normalizeError(error);
}
