const PREFIX: Record<string, number> = {
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  µ: 1e-6,
  μ: 1e-6,
  m: 1e-3,
  k: 1e3,
  K: 1e3,
  M: 1e6,
  G: 1e9,
};

function stripTrailingUnit(input: string): string {
  let s = input;
  s = s.replace(/(ohms|ohm|farads|farad|henries|henry|volts|volt|amperes|ampere|amps|amp|watts|watt|hertz|hz)$/i, "");
  s = s.replace(/[Ωω]$/u, "");
  s = s.replace(/[FHVAWfh]$/, (ch, _i, str: string) => (/[\dpnuµμmkKMG.]$/.test(str.slice(0, -1)) ? "" : ch));
  return s;
}

/** Parse bench notation: 10k, 4k7, 4R7, 100nF, 10µ, 250 mW, 1e-7, 4,7k. */
export function parseEngineering(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (!s || s === "-") return null;
  s = stripTrailingUnit(s);
  if (!s) return null;

  const euro = s.match(/^(\d+)([pnuµμmkKMGrR])(\d+)$/);
  if (euro) {
    const marker = euro[2] ?? "";
    const num = Number(`${euro[1]}.${euro[3]}`);
    if (!Number.isFinite(num)) return null;
    if (marker === "r" || marker === "R") return num;
    const mult = PREFIX[marker];
    return mult == null ? null : num * mult;
  }

  const ohms = s.match(/^(\d+(?:\.\d+)?)[rR]$/);
  if (ohms) {
    const num = Number(ohms[1]);
    return Number.isFinite(num) ? num : null;
  }

  const m = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([pnuµμmkKMG])?$/);
  if (!m) return null;
  const num = Number(m[1]);
  if (!Number.isFinite(num)) return null;
  if (!m[2]) return num;
  const mult = PREFIX[m[2]];
  return mult == null ? null : num * mult;
}

const PREFIXES = ["f", "p", "n", "µ", "m", "", "k", "M", "G", "T"];

export function formatSi(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs === 0) return unit ? `0 ${unit}` : "0";
  const exp = Math.log10(abs);
  const group = Math.floor(exp / 3 + 1e-12);
  if (group < -5 || group > 4) {
    const sci = value.toExponential(2).replace(".", ",");
    return unit ? `${sci} ${unit}` : sci;
  }
  const scale = 10 ** (group * 3);
  const mantissa = Math.round((abs / scale) * 1000) / 1000;
  const text = String(mantissa).replace(".", ",");
  const prefix = PREFIXES[group + 5] ?? "";
  if (!prefix && !unit) return `${sign}${text}`;
  if (!prefix) return `${sign}${text} ${unit}`;
  return unit ? `${sign}${text} ${prefix}${unit}` : `${sign}${text} ${prefix}`;
}

export function formatNum(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const text =
    abs !== 0 && (abs < 0.001 || abs >= 1e7) ? value.toExponential(2) : String(Number(value.toPrecision(digits)));
  return text.replace(".", ",");
}
