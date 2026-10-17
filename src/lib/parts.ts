import { parseEngineering, formatSi } from "@/lib/si";
import type { Category, FieldDef, Part } from "@/lib/types";

export function formatProp(value: string | undefined, field: FieldDef): string {
  if (!value) return "";
  if (field.kind === "si" && field.unit) {
    const n = parseEngineering(value);
    return n == null ? value : formatSi(n, field.unit);
  }
  if (field.kind === "number") {
    const text = value.replace(".", ",");
    return field.unit ? `${text} ${field.unit}` : text;
  }
  if (field.key === "tolerance") return `${value.replace(".", ",")} %`;
  return value;
}

export function isLow(part: Part): boolean {
  return part.qty <= 0 || (part.minQty > 0 && part.qty <= part.minQty);
}

export function partHeadline(part: Part, category: Category | undefined): { kicker: string; title: string; meta: string } {
  const kicker = category?.name ?? "Sem categoria";
  const primary = category?.fields.find((f) => f.kind === "si");
  const primaryText = primary ? formatProp(part.props[primary.key], primary) : "";
  const title = part.name.trim() || primaryText || part.mpn || "Sem identificação";
  const bits: string[] = [];
  if (part.name.trim() && primaryText) bits.push(primaryText);
  if (part.mpn && part.mpn !== title) bits.push(part.mpn);
  for (const field of category?.fields ?? []) {
    if (primary && field.key === primary.key) continue;
    const text = formatProp(part.props[field.key], field);
    if (text) bits.push(text);
  }
  if (part.location) bits.push(part.location);
  return { kicker, title, meta: bits.join(" · ") };
}

function compact(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").replace(",", ".");
}

export function matchesQuery(part: Part, categories: Category[], query: string): boolean {
  const qRaw = query.trim();
  if (!qRaw) return true;
  const q = compact(qRaw);
  const category = categories.find((c) => c.id === part.categoryId);
  const texts = [part.name, part.mpn, part.location, part.notes, category?.name ?? "", category?.short ?? ""];
  for (const field of category?.fields ?? []) {
    const raw = part.props[field.key];
    if (!raw) continue;
    texts.push(raw);
    const shown = formatProp(raw, field);
    if (shown) texts.push(shown);
  }
  const qNum = parseEngineering(qRaw);
  const allDigits = /^\d+$/.test(qRaw);
  if (qNum != null && !allDigits) {
    const numeric = (category?.fields ?? []).some((field) => {
      if (field.kind !== "si") return false;
      const n = parseEngineering(part.props[field.key] || "");
      if (n == null) return false;
      if (qNum === 0) return n === 0;
      return Math.abs(n - qNum) / Math.max(Math.abs(qNum), 1e-18) <= 0.02;
    });
    return numeric || texts.some((text) => compact(text) === q);
  }
  return texts.some((text) => compact(text).includes(q));
}

export type PartMatch = { part: Part; value: number; errPct: number };

export function matchStock(
  parts: Part[],
  categoryId: string,
  fieldKey: string,
  target: number,
  windowPct = 10,
): { close: PartMatch[]; nearest: PartMatch | null } {
  if (!(target > 0)) return { close: [], nearest: null };
  const ranked: PartMatch[] = [];
  for (const part of parts) {
    if (part.categoryId !== categoryId || part.qty <= 0) continue;
    const value = parseEngineering(part.props[fieldKey] || "");
    if (value == null || !(value > 0)) continue;
    ranked.push({ part, value, errPct: (Math.abs(value - target) / target) * 100 });
  }
  ranked.sort((a, b) => a.errPct - b.errPct);
  return {
    close: ranked.filter((row) => row.errPct <= windowPct),
    nearest: ranked[0] ?? null,
  };
}

export function powerOf(part: Part | null): number | null {
  if (!part) return null;
  const n = parseEngineering(part.props.power || "");
  return n != null && n > 0 ? n : null;
}
