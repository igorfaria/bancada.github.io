import { formatSi, parseEngineering } from "./si.ts";
import type { Part } from "./types.ts";
import type { BjtPolarity } from "./calc.ts";

export type StockUse = {
  part: Part;
  count: number;
  value: number;
};

export type NetworkMode = "single" | "series" | "parallel";
export type NetworkKind = "R" | "C" | "L";

export type NetworkProposal = {
  id: string;
  value: number;
  errPct: number;
  mode: NetworkMode;
  uses: StockUse[];
  parts: number;
  powerOk: boolean | null;
  label: string;
};

type Unit = { part: Part; value: number; qty: number; power: number | null };

const RATINGS = [0.125, 0.25, 0.5, 1, 2, 5];

export function suggestWattage(dissipated: number | undefined): string | undefined {
  if (dissipated == null || !(dissipated > 0) || !Number.isFinite(dissipated)) return undefined;
  const need = dissipated * 2;
  const pick = RATINGS.find((rating) => rating + 1e-12 >= need) ?? RATINGS[RATINGS.length - 1]!;
  return String(pick);
}

function comboValue(values: number[], mode: NetworkMode, kind: NetworkKind): number {
  if (mode === "single") return values[0] ?? 0;
  const adds = kind === "C" ? mode === "parallel" : mode === "series";
  if (adds) return values.reduce((sum, value) => sum + value, 0);
  return 1 / values.reduce((sum, value) => sum + 1 / value, 0);
}

function describe(uses: StockUse[], mode: NetworkMode, unit: string): string {
  const bits = uses.map((use) => `${use.count > 1 ? `${use.count}× ` : ""}${formatSi(use.value, unit)}`);
  if (mode === "single" || bits.length === 1) return bits[0] ?? "";
  return mode === "series" ? `${bits.join(" + ")} em série` : `${bits.join(" ∥ ")} em paralelo`;
}

function shares(values: number[], mode: NetworkMode, dissipated: number): number[] {
  const eq = comboValue(values, mode, "R");
  if (mode === "parallel") {
    const volts2 = dissipated * eq;
    return values.map((value) => volts2 / value);
  }
  const amps2 = dissipated / eq;
  return values.map((value) => amps2 * value);
}

function powerOk(uses: StockUse[], mode: NetworkMode, dissipated: number | undefined): boolean | null {
  if (dissipated == null || !(dissipated >= 0)) return null;
  const flat = uses.flatMap((use) => Array.from({ length: use.count }, () => use));
  const values = flat.map((use) => use.value);
  const each = shares(values, mode === "single" ? "series" : mode, dissipated);
  let unknown = false;
  for (let i = 0; i < flat.length; i++) {
    const rating = flat[i]!.part.props.power ? parseEngineering(flat[i]!.part.props.power) : null;
    const share = each[i] ?? 0;
    if (rating == null || !(rating > 0)) {
      unknown = true;
      continue;
    }
    if (share > rating * 1.02) return false;
  }
  return unknown ? null : true;
}

function unitsOf(parts: Part[], categoryId: string, fieldKey: string): Unit[] {
  const units: Unit[] = [];
  for (const part of parts) {
    if (part.categoryId !== categoryId || part.qty <= 0) continue;
    const value = parseEngineering(part.props[fieldKey] || "");
    if (value == null || !(value > 0)) continue;
    const power = parseEngineering(part.props.power || "");
    units.push({ part, value, qty: part.qty, power: power != null && power > 0 ? power : null });
  }
  return units;
}

function closest(units: Unit[], target: number, limit: number): Unit[] {
  return [...units]
    .sort((a, b) => Math.abs(Math.log(a.value / target)) - Math.abs(Math.log(b.value / target)))
    .slice(0, limit);
}

function usesFrom(units: Unit[], indexes: number[]): StockUse[] | null {
  const counts = new Map<number, number>();
  for (const index of indexes) counts.set(index, (counts.get(index) ?? 0) + 1);
  const uses: StockUse[] = [];
  for (const [index, count] of counts) {
    const unit = units[index];
    if (!unit || unit.qty < count) return null;
    uses.push({ part: unit.part, count, value: unit.value });
  }
  return uses;
}

function proposalId(mode: NetworkMode, uses: StockUse[]): string {
  return `${mode}:${uses
    .map((use) => `${use.part.id}x${use.count}`)
    .sort()
    .join("|")}`;
}

function rankProposal(a: NetworkProposal, b: NetworkProposal): number {
  if ((a.powerOk === false) !== (b.powerOk === false)) return a.powerOk === false ? 1 : -1;
  if (Math.abs(a.errPct - b.errPct) > 0.15) return a.errPct - b.errPct;
  if (a.parts !== b.parts) return a.parts - b.parts;
  return a.errPct - b.errPct;
}

function selectShown(all: NetworkProposal[]): NetworkProposal[] {
  if (all.length === 0) return [];
  const ranked = [...all].sort(rankProposal);
  const bestSingle = ranked.find((item) => item.parts === 1);
  const shown: NetworkProposal[] = [];
  if (bestSingle) shown.push(bestSingle);
  const singleErr = bestSingle?.errPct ?? Number.POSITIVE_INFINITY;
  for (const mode of ["series", "parallel"] as const) {
    const combo = ranked.find((item) => item.mode === mode && item.parts > 1);
    if (combo && combo.errPct + 0.3 < singleErr) shown.push(combo);
  }
  if (bestSingle?.powerOk === false) {
    const safe = ranked.find((item) => item.powerOk !== false && item.errPct < 15 && !shown.includes(item));
    if (safe) shown.push(safe);
  }
  if (shown.length === 0) shown.push(ranked[0]!);
  return shown.slice(0, 3);
}

export function proposeNetworks(
  parts: Part[],
  categoryId: string,
  fieldKey: string,
  target: number,
  kind: NetworkKind,
  options?: { dissipated?: number; unit?: string },
): NetworkProposal[] {
  if (!(target > 0) || !Number.isFinite(target)) return [];
  const units = unitsOf(parts, categoryId, fieldKey);
  if (units.length === 0) return [];
  const unit = options?.unit ?? (kind === "R" ? "Ω" : kind === "C" ? "F" : "H");
  const pairPool = closest(units, target, 16);
  const triplePool = closest(units, target, 8);
  const seen = new Set<string>();
  const all: NetworkProposal[] = [];

  function push(pool: Unit[], indexes: number[], mode: NetworkMode) {
    const uses = usesFrom(pool, indexes);
    if (!uses) return;
    const values = uses.flatMap((use) => Array.from({ length: use.count }, () => use.value));
    const value = comboValue(values, mode, kind);
    if (!(value > 0) || !Number.isFinite(value)) return;
    const id = proposalId(mode, uses);
    if (seen.has(id)) return;
    seen.add(id);
    const partsCount = uses.reduce((sum, use) => sum + use.count, 0);
    all.push({
      id,
      value,
      errPct: (Math.abs(value - target) / target) * 100,
      mode,
      uses,
      parts: partsCount,
      powerOk: kind === "R" ? powerOk(uses, mode, options?.dissipated) : null,
      label: describe(uses, mode, unit),
    });
  }

  for (let i = 0; i < pairPool.length; i++) push(pairPool, [i], "single");
  for (let i = 0; i < pairPool.length; i++) {
    for (let j = i; j < pairPool.length; j++) {
      push(pairPool, [i, j], "series");
      push(pairPool, [i, j], "parallel");
    }
  }
  for (let i = 0; i < triplePool.length; i++) {
    for (let j = i; j < triplePool.length; j++) {
      for (let k = j; k < triplePool.length; k++) {
        push(triplePool, [i, j, k], "series");
        push(triplePool, [i, j, k], "parallel");
      }
    }
  }
  return selectShown(all);
}

export type DividerLeg = {
  value: number;
  mode: NetworkMode;
  uses: StockUse[];
  label: string;
};

export type DividerProposal = {
  id: string;
  r1: DividerLeg;
  r2: DividerLeg;
  vb: number;
  ic: number;
  ib: number;
  stiffness: number;
  icErrPct: number;
  parts: number;
  score: number;
};

type Leg = DividerLeg & { counts: Map<string, number> };

function legFrom(uses: StockUse[], mode: NetworkMode): Leg {
  const counts = new Map<string, number>();
  for (const use of uses) counts.set(use.part.id, (counts.get(use.part.id) ?? 0) + use.count);
  const values = uses.flatMap((use) => Array.from({ length: use.count }, () => use.value));
  return {
    value: comboValue(values, mode, "R"),
    mode,
    uses,
    label: describe(uses, mode, "Ω"),
    counts,
  };
}

function legsFor(units: Unit[], focus: number[]): Leg[] {
  const lo = Math.min(...focus) / 8;
  const hi = Math.max(...focus) * 8;
  const singles: Leg[] = [];
  const combos: Leg[] = [];
  for (let i = 0; i < units.length; i++) {
    const uses = usesFrom(units, [i]);
    if (uses) singles.push(legFrom(uses, "single"));
  }
  for (let i = 0; i < units.length; i++) {
    for (let j = i; j < units.length; j++) {
      for (const mode of ["series", "parallel"] as const) {
        const uses = usesFrom(units, [i, j]);
        if (!uses) continue;
        const leg = legFrom(uses, mode);
        if (leg.value < lo || leg.value > hi) continue;
        combos.push(leg);
      }
    }
  }
  const distance = (value: number) => Math.min(...focus.map((target) => Math.abs(Math.log(value / target))));
  combos.sort((a, b) => distance(a.value) - distance(b.value));
  return [...singles, ...combos.slice(0, 12)];
}

function fits(a: Leg, b: Leg, units: Unit[]): boolean {
  const need = new Map(a.counts);
  for (const [id, count] of b.counts) need.set(id, (need.get(id) ?? 0) + count);
  for (const [id, count] of need) {
    const unit = units.find((item) => item.part.id === id);
    if (!unit || unit.qty < count) return false;
  }
  return true;
}

export function biasPoint(input: {
  polarity: BjtPolarity;
  vcc: number;
  vbe: number;
  beta: number;
  re: number;
  rc: number;
  r1: number;
  r2: number;
}): { vb: number; ve: number; vc: number; vce: number; ic: number; ib: number; stiffness: number } | null {
  const { polarity, vcc, vbe, beta, re, rc, r1, r2 } = input;
  if (![vcc, vbe, beta, re, rc, r1, r2].every((value) => value > 0 && Number.isFinite(value))) return null;
  if (vbe >= vcc || beta <= 1) return null;
  const reBeta = re * (beta + 1);
  const denom = 1 / r1 + 1 / r2 + 1 / reBeta;
  const vb =
    polarity === "npn"
      ? (vcc / r1 + vbe / reBeta) / denom
      : (vcc / r1 + (vcc - vbe) / reBeta) / denom;
  if (!(vb > 0) || vb >= vcc) return null;
  const ve = polarity === "npn" ? vb - vbe : vb + vbe;
  if (!(ve > 0) || ve >= vcc) return null;
  const ie = polarity === "npn" ? ve / re : (vcc - ve) / re;
  if (!(ie > 0)) return null;
  const ib = ie / (beta + 1);
  const ic = ie - ib;
  const vc = polarity === "npn" ? vcc - ic * rc : ic * rc;
  const vce = polarity === "npn" ? vc - ve : ve - vc;
  if (!(ic > 0) || !(vce > 0) || vc <= 0 || vc >= vcc) return null;
  const stiffness = (vb / r2) / ib;
  if (!Number.isFinite(stiffness)) return null;
  return { vb, ve, vc, vce, ic, ib, stiffness };
}

export function proposeDivider(input: {
  parts: Part[];
  polarity: BjtPolarity;
  vcc: number;
  vbe: number;
  beta: number;
  re: number;
  rc: number;
  r1: number;
  r2: number;
  targetIc: number;
  minStiffness: number;
}): DividerProposal[] {
  const { parts, r1, r2, targetIc, minStiffness } = input;
  if (!(r1 > 0) || !(r2 > 0) || !(targetIc > 0)) return [];
  const units = unitsOf(parts, "resistors", "resistance");
  if (units.length === 0) return [];
  const legs = legsFor(units, [r1, r2]);
  const found: DividerProposal[] = [];
  for (const top of legs) {
    for (const bottom of legs) {
      if (!fits(top, bottom, units)) continue;
      const point = biasPoint({ ...input, r1: top.value, r2: bottom.value });
      if (!point) continue;
      const icErrPct = (Math.abs(point.ic - targetIc) / targetIc) * 100;
      const stiffShort = point.stiffness < minStiffness ? (minStiffness - point.stiffness) / minStiffness : 0;
      const partsCount =
        top.uses.reduce((sum, use) => sum + use.count, 0) + bottom.uses.reduce((sum, use) => sum + use.count, 0);
      found.push({
        id: `${top.mode}:${[...top.counts.entries()].sort().join(",")}|${bottom.mode}:${[...bottom.counts.entries()].sort().join(",")}`,
        r1: top,
        r2: bottom,
        vb: point.vb,
        ic: point.ic,
        ib: point.ib,
        stiffness: point.stiffness,
        icErrPct,
        parts: partsCount,
        score: icErrPct + stiffShort * 20,
      });
    }
  }
  found.sort((a, b) => a.score - b.score || a.parts - b.parts);
  const unique: DividerProposal[] = [];
  const seen = new Set<string>();
  for (const item of found) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
    if (unique.length === 3) break;
  }
  if (unique.length === 0) return [];
  if (unique[0]!.icErrPct > 20) return unique.slice(0, 1);
  return unique.filter((item) => item.icErrPct <= 20);
}
