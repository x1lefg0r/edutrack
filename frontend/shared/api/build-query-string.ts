export function buildQueryString<
  T extends Record<string, string | number | boolean | undefined | null>,
>(params?: T): string {
  if (!params) return "";

  const clean = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

  return Object.keys(clean).length
    ? "?" + new URLSearchParams(clean).toString()
    : "";
}
