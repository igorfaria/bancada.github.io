export type OhmInput = { v: number | null; i: number | null; r: number | null };

export type OhmResult =
  | { ok: true; voltage: number; current: number; resistance: number; power: number; formula: string }
  | { ok: false; error: string; severity: "muted" | "danger" };

export function solveOhm({ v, i, r }: OhmInput): OhmResult | null {
  const known = [v, i, r].filter((n) => n != null).length;
  if (known === 0) return null;
  if (known < 2) return { ok: false, error: "Falta mais um valor.", severity: "muted" };

  let voltage = v;
  let current = i;
  let resistance = r;
  let formula = "";

  if (voltage != null && current != null && resistance == null) {
    if (current === 0) return { ok: false, error: "Corrente zero não define a resistência.", severity: "danger" };
    resistance = voltage / current;
    formula = "R = V / I";
  } else if (voltage != null && resistance != null && current == null) {
    if (resistance === 0) return { ok: false, error: "Resistência zero.", severity: "danger" };
    current = voltage / resistance;
    formula = "I = V / R";
  } else if (current != null && resistance != null && voltage == null) {
    voltage = current * resistance;
    formula = "V = I × R";
  } else if (voltage != null && current != null && resistance != null) {
    const expect = current * resistance;
    const scale = Math.max(Math.abs(voltage), Math.abs(expect), 1e-12);
    if (Math.abs(expect - voltage) / scale > 0.02) {
      return { ok: false, error: "V, I e R não fecham (mais de 2%).", severity: "danger" };
    }
    formula = "V = I × R";
  }

  if (voltage == null || current == null || resistance == null) {
    return { ok: false, error: "Valor inválido.", severity: "danger" };
  }
  if (![voltage, current, resistance].every(Number.isFinite)) {
    return { ok: false, error: "Valor inválido.", severity: "danger" };
  }
  return { ok: true, voltage, current, resistance, power: voltage * current, formula };
}

export function voltageDivider(vin: number, r1: number, r2: number) {
  if (!(vin >= 0) || !(r1 > 0) || !(r2 > 0) || ![vin, r1, r2].every(Number.isFinite)) {
    return { ok: false as const, error: "Vin, R1 e R2 têm de ser positivos." };
  }
  const total = r1 + r2;
  const current = vin / total;
  const vout = vin * (r2 / total);
  return {
    ok: true as const,
    vout,
    current,
    p1: current * current * r1,
    p2: current * current * r2,
    total,
  };
}

export function rcFilter(r: number, c: number, freq: number | null) {
  if (!(r > 0) || !(c > 0)) return { ok: false as const, error: "R e C têm de ser positivos." };
  const tau = r * c;
  const fc = 1 / (2 * Math.PI * tau);
  if (freq == null) return { ok: true as const, tau, fc, gain: null, db: null };
  if (!(freq > 0)) return { ok: false as const, error: "A frequência tem de ser positiva." };
  const gain = 1 / Math.sqrt(1 + (freq / fc) ** 2);
  return { ok: true as const, tau, fc, gain, db: 20 * Math.log10(gain) };
}

export function lcResonance(l: number, c: number) {
  if (!(l > 0) || !(c > 0)) return { ok: false as const, error: "L e C têm de ser positivos." };
  return { ok: true as const, f: 1 / (2 * Math.PI * Math.sqrt(l * c)) };
}

export function ledResistor(vs: number, vf: number, current: number) {
  if (!(vs > 0) || !(vf > 0) || !(current > 0)) {
    return { ok: false as const, error: "Fonte, Vf e corrente têm de ser positivos." };
  }
  if (vs <= vf) return { ok: false as const, error: "A fonte tem de ser maior que a tensão do LED." };
  const resistance = (vs - vf) / current;
  return {
    ok: true as const,
    resistance,
    pRes: (vs - vf) * current,
    pLed: vf * current,
    current,
  };
}

export function equivalent(values: number[], mode: "series" | "parallel", kind: "R" | "L" | "C") {
  if (values.length < 2) return { ok: false as const, error: "Indica pelo menos dois valores." };
  if (values.some((v) => !(v > 0) || !Number.isFinite(v))) {
    return { ok: false as const, error: "Os valores têm de ser positivos." };
  }
  const adds = kind === "C" ? mode === "parallel" : mode === "series";
  const value = adds ? values.reduce((a, b) => a + b, 0) : 1 / values.reduce((a, b) => a + 1 / b, 0);
  const symbol = kind === "R" ? "R" : kind === "L" ? "L" : "C";
  const formula = adds ? `${symbol}eq = ${symbol}1 + ${symbol}2 + …` : `1/${symbol}eq = 1/${symbol}1 + 1/${symbol}2 + …`;
  return { ok: true as const, value, formula, symbol };
}

const E12 = [100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820];
const E24 = [100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300, 330, 360, 390, 430, 470, 510, 560, 620, 680, 750, 820, 910];

export type BjtPolarity = "npn" | "pnp";

/** Lowest hFE in a note like "hFE 110–800". Ignores Rds(on) text. */
export function parseBeta(raw: string): number | null {
  const text = raw.trim();
  if (!text || /[ωΩ]|ohm|rds/i.test(text)) return null;
  const nums = [...text.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((match) => Number(match[1]!.replace(",", ".")))
    .filter((n) => n > 1 && n < 2000);
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

export type BiasResistor = {
  name: "Rc" | "Re" | "R1" | "R2" | "Rb";
  role: string;
  ohms: number;
  power: number;
};

export type BiasPoint = {
  ok: true;
  resistors: BiasResistor[];
  ib: number;
  ic: number;
  ie: number;
  vb: number;
  ve: number;
  vc: number;
  vce: number;
  pq: number;
  av: number | null;
  notes: string[];
};

export type BiasFail = { ok: false; error: string };

function bad(error: string): BiasFail {
  return { ok: false, error };
}

/**
 * Common-emitter voltage-divider bias.
 * NPN: Re to ground, Rc to Vcc. PNP: Re to Vcc, Rc to ground.
 * Empty veDrop → 10% of Vcc. Empty vce → midpoint of the remaining swing.
 * Stiffness is divider current / Ib (rule of 10).
 */
export function biasDivider(input: {
  polarity: BjtPolarity;
  vcc: number;
  ic: number;
  beta: number;
  vbe: number;
  veDrop: number | null;
  vce: number | null;
  stiffness: number;
}): BiasPoint | BiasFail {
  const { polarity, vcc, ic, beta, vbe } = input;
  if (!(vcc > 0) || !(ic > 0) || !(vbe > 0) || ![vcc, ic, beta, vbe].every(Number.isFinite)) {
    return bad("Fonte, corrente, hFE e Vbe têm de ser positivos.");
  }
  if (!(beta > 1)) return bad("O hFE tem de ser maior que 1.");
  if (vbe >= vcc) return bad("Vbe não cabe na fonte.");
  if (!(input.stiffness > 1) || !Number.isFinite(input.stiffness)) {
    return bad("A rigidez do divisor tem de ser maior que 1.");
  }

  const assumedVe = input.veDrop == null;
  const veDrop = input.veDrop ?? vcc * 0.1;
  if (!(veDrop > 0)) return bad("A queda no emissor tem de ser positiva.");
  if (veDrop + vbe >= vcc * 0.92) {
    return bad("A queda no emissor mais Vbe não deixa margem para o coletor.");
  }

  const ib = ic / beta;
  const ie = ic + ib;
  const re = veDrop / ie;
  const ve = polarity === "npn" ? veDrop : vcc - veDrop;
  const vb = polarity === "npn" ? ve + vbe : ve - vbe;
  if (!(vb > 0) || vb >= vcc) return bad("A tensão de base fica fora da fonte.");

  let i1: number;
  let i2: number;
  if (polarity === "npn") {
    i2 = input.stiffness * ib;
    i1 = i2 + ib;
  } else {
    i2 = input.stiffness * ib;
    i1 = i2 - ib;
    if (!(i1 > 0)) return bad("Sobe a rigidez do divisor: a corrente de base come o divisor.");
  }
  const r2 = vb / i2;
  const r1 = (vcc - vb) / i1;

  const span = polarity === "npn" ? vcc - ve : ve;
  if (!(span > 0.2)) return bad("Não há tensão útil entre coletor e emissor.");
  const assumedVce = input.vce == null;
  const vce = input.vce ?? span / 2;
  if (!(vce > 0) || vce >= span) return bad("Esse Vce não cabe entre a fonte e a queda do emissor.");
  const vc = polarity === "npn" ? ve + vce : ve - vce;
  const rc = polarity === "npn" ? (vcc - vc) / ic : vc / ic;
  if (![r1, r2, rc, re].every((r) => r > 0 && Number.isFinite(r))) {
    return bad("Os resistores não fecham. Revê as tensões.");
  }

  const notes: string[] = [];
  if (assumedVe) notes.push("Queda no emissor assumida a 10% da fonte.");
  if (assumedVce) notes.push("Vce assumido a meio da excursão que resta.");
  if (vce < 1) notes.push("Vce baixo: o transístor fica perto da saturação e o ganho cai.");
  if (veDrop < 0.4) notes.push("Pouca queda no emissor: o ponto de trabalho muda com a temperatura.");
  notes.push("Ganho aproximado sem condensador em paralelo com Re. O sinal inverte.");

  const npn = polarity === "npn";
  return {
    ok: true,
    resistors: [
      { name: "Rc", role: npn ? "coletor → fonte" : "coletor → massa", ohms: rc, power: ic * ic * rc },
      { name: "Re", role: npn ? "emissor → massa" : "emissor → fonte", ohms: re, power: ie * ie * re },
      { name: "R1", role: "divisor, lado da fonte", ohms: r1, power: i1 * i1 * r1 },
      { name: "R2", role: "divisor, lado da massa", ohms: r2, power: i2 * i2 * r2 },
    ],
    ib,
    ic,
    ie,
    vb,
    ve,
    vc,
    vce,
    pq: vce * ic,
    av: -(rc / re),
    notes,
  };
}

/** Saturated switch: one base resistor. NPN low-side, PNP high-side. */
export function biasSwitch(input: {
  polarity: BjtPolarity;
  vcc: number;
  ic: number;
  beta: number;
  vbe: number;
  vdrive: number | null;
  vceSat: number;
}): BiasPoint | BiasFail {
  const { polarity, vcc, ic, beta, vbe, vceSat } = input;
  if (!(vcc > 0) || !(ic > 0) || !(vbe > 0) || !(vceSat >= 0) || ![vcc, ic, beta, vbe, vceSat].every(Number.isFinite)) {
    return bad("Fonte, corrente da carga e Vbe têm de ser positivos.");
  }
  if (!(beta > 1)) return bad("O hFE forçado tem de ser maior que 1.");
  if (vbe + vceSat >= vcc) return bad("Vbe e Vce(sat) não cabem na fonte.");

  const assumedDrive = input.vdrive == null;
  const vdrive = input.vdrive ?? (polarity === "npn" ? vcc : 0);
  if (!Number.isFinite(vdrive) || vdrive < 0 || vdrive > vcc + 1e-6) {
    return bad("A tensão de comando tem de estar entre 0 e a fonte.");
  }
  const across = polarity === "npn" ? vdrive - vbe : vcc - vbe - vdrive;
  if (!(across > 0)) {
    return bad(
      polarity === "npn"
        ? "Para ligar o NPN, o comando tem de ficar acima de Vbe."
        : "Para ligar o PNP, o comando tem de ficar abaixo de Vcc − Vbe.",
    );
  }

  const ib = ic / beta;
  const notes: string[] = [];
  if (assumedDrive) {
    notes.push(polarity === "npn" ? "Comando assumido igual à fonte." : "Comando assumido a 0 V, como um GPIO em baixo.");
  }
  if (beta > 25) {
    notes.push("Para saturar de certeza, força um hFE baixo (cerca de 10). Com o hFE de catálogo pode ficar na região ativa.");
  }
  notes.push(
    polarity === "npn"
      ? "Interruptor em baixo: a carga fica entre a fonte e o coletor."
      : "Interruptor em cima: a carga fica entre o coletor e a massa.",
  );

  return {
    ok: true,
    resistors: [
      {
        name: "Rb",
        role: polarity === "npn" ? "base, a partir do comando" : "base, para o comando em baixo",
        ohms: across / ib,
        power: across * ib,
      },
    ],
    ib,
    ic,
    ie: ic + ib,
    vb: polarity === "npn" ? vbe : vcc - vbe,
    ve: polarity === "npn" ? 0 : vcc,
    vc: polarity === "npn" ? vceSat : vcc - vceSat,
    vce: vceSat,
    pq: vceSat * ic,
    av: null,
    notes,
  };
}

export function nearestSeries(value: number, series: "E12" | "E24"): number {
  const list = series === "E12" ? E12 : E24;
  const exp = Math.floor(Math.log10(value));
  const decade = 10 ** (exp - 2);
  let best = list[0]! * decade;
  let bestErr = Infinity;
  for (const shift of [-1, 0, 1]) {
    const d = decade * 10 ** shift;
    for (const mantissa of list) {
      const candidate = mantissa * d;
      const err = Math.abs(candidate - value) / value;
      if (err < bestErr) {
        best = candidate;
        bestErr = err;
      }
    }
  }
  return best;
}

export type Band = {
  id: string;
  name: string;
  digit: number | null;
  exp: number | null;
  tol: number | null;
};

export const BANDS: Band[] = [
  { id: "black", name: "Preto", digit: 0, exp: 0, tol: null },
  { id: "brown", name: "Castanho", digit: 1, exp: 1, tol: 1 },
  { id: "red", name: "Vermelho", digit: 2, exp: 2, tol: 2 },
  { id: "orange", name: "Laranja", digit: 3, exp: 3, tol: null },
  { id: "yellow", name: "Amarelo", digit: 4, exp: 4, tol: null },
  { id: "green", name: "Verde", digit: 5, exp: 5, tol: 0.5 },
  { id: "blue", name: "Azul", digit: 6, exp: 6, tol: 0.25 },
  { id: "violet", name: "Violeta", digit: 7, exp: 7, tol: 0.1 },
  { id: "gray", name: "Cinzento", digit: 8, exp: 8, tol: 0.05 },
  { id: "white", name: "Branco", digit: 9, exp: 9, tol: null },
  { id: "gold", name: "Dourado", digit: null, exp: -1, tol: 5 },
  { id: "silver", name: "Prateado", digit: null, exp: -2, tol: 10 },
];

export function bandById(id: string): Band | undefined {
  return BANDS.find((b) => b.id === id);
}

export function decodeBands(ids: string[]): { ok: true; ohms: number; tolerance: number | null } | { ok: false; error: string } {
  const bands = ids.map(bandById);
  if (bands.some((b) => !b) || bands.length < 3) return { ok: false, error: "Banda em falta." };
  const tol = bands[bands.length - 1]!;
  const mult = bands[bands.length - 2]!;
  const digits = bands.slice(0, -2);
  if (digits.some((b) => b!.digit == null)) return { ok: false, error: "Essa cor não é um dígito." };
  if (mult.exp == null) return { ok: false, error: "Essa cor não é um multiplicador." };
  const nominal = digits.reduce((acc, b) => acc * 10 + b!.digit!, 0) * 10 ** mult.exp;
  return { ok: true, ohms: nominal, tolerance: tol.tol };
}

export function encodeResistor(
  ohms: number,
  count: 4 | 5,
): { ok: true; digits: string[]; multiplier: string; nominal: number } | { ok: false; error: string } {
  if (!(ohms > 0) || !Number.isFinite(ohms)) return { ok: false, error: "Indica um valor positivo." };
  const sig = count === 4 ? 2 : 3;
  let exp = Math.floor(Math.log10(ohms)) - (sig - 1);
  let mant = Math.round(ohms / 10 ** exp);
  if (mant >= 10 ** sig) {
    mant = Math.round(mant / 10);
    exp += 1;
  }
  if (exp < -2 || exp > 9) return { ok: false, error: "Fora da gama do código de cores." };
  const mult = BANDS.find((b) => b.exp === exp && (exp >= 0 ? b.digit === exp : b.digit == null));
  if (!mult) return { ok: false, error: "Sem multiplicador para este valor." };
  const digits = String(mant)
    .padStart(sig, "0")
    .split("")
    .map((ch) => BANDS.find((b) => b.digit === Number(ch))?.id);
  if (digits.some((d) => !d)) return { ok: false, error: "Não foi possível codificar." };
  return { ok: true, digits: digits as string[], multiplier: mult.id, nominal: mant * 10 ** exp };
}

export function toleranceBand(tol: number): string | null {
  return BANDS.find((b) => b.tol === tol)?.id ?? null;
}
