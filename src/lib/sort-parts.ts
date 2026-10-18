import { parseEngineering } from "./si.ts";
import type { Category, Part } from "./types.ts";

export type SortDir = "asc" | "desc";

/** Location labels like 1k, 2k2 or Gaveta 10k sort by the engineering value. */
export function locationRank(location: string): number | null {
  const trimmed = location.trim();
  if (!trimmed) return null;
  const whole = parseEngineering(trimmed);
  if (whole != null && whole > 0) return whole;
  const tokens = trimmed.split(/[\s·,|/]+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i]!;
    if (!/\d/.test(token)) continue;
    const value = parseEngineering(token);
    if (value != null && value > 0) return value;
  }
  return null;
}

/** Ascending compare. Numeric labels (1k, 2k, 1M) before plain names. */
export function compareLocationLabels(a: string, b: string): number {
  const left = locationRank(a);
  const right = locationRank(b);
  if (left != null && right != null) {
    if (left !== right) return left - right;
    return a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" });
  }
  if (left != null) return -1;
  if (right != null) return 1;
  return a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" });
}

export function primarySi(part: Part, categories: Category[]): number | null {
  const category = categories.find((item) => item.id === part.categoryId);
  const field = category?.fields.find((item) => item.kind === "si");
  if (!field) return null;
  const value = parseEngineering(part.props[field.key] || "");
  return value != null && value > 0 ? value : null;
}

/** Unknown values stay at the end in both directions. */
export function compareByValue(a: Part, b: Part, categories: Category[], dir: SortDir): number {
  const sign = dir === "asc" ? 1 : -1;
  const left = primarySi(a, categories);
  const right = primarySi(b, categories);
  if (left != null && right != null && left !== right) return (left - right) * sign;
  if (left != null && right == null) return -1;
  if (left == null && right != null) return 1;
  const nameA = a.name.trim() || a.mpn || a.location;
  const nameB = b.name.trim() || b.mpn || b.location;
  return nameA.localeCompare(nameB, "pt", { numeric: true, sensitivity: "base" });
}
