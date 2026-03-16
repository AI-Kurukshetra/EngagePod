export function createTestId(...parts: Array<string | number | undefined>) {
  return parts
    .filter((part) => part !== undefined)
    .map((part) => String(part).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .filter(Boolean)
    .join("__");
}
