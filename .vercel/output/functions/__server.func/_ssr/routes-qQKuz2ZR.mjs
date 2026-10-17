import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Minus, c as Calculator, i as Plus, l as Boxes, o as Layers, r as Search, s as Download, t as Upload } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-qQKuz2ZR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function solveOhm({ v, i, r }) {
	const known = [
		v,
		i,
		r
	].filter((n) => n != null).length;
	if (known === 0) return null;
	if (known < 2) return {
		ok: false,
		error: "Falta mais um valor.",
		severity: "muted"
	};
	let voltage = v;
	let current = i;
	let resistance = r;
	let formula = "";
	if (voltage != null && current != null && resistance == null) {
		if (current === 0) return {
			ok: false,
			error: "Corrente zero não define a resistência.",
			severity: "danger"
		};
		resistance = voltage / current;
		formula = "R = V / I";
	} else if (voltage != null && resistance != null && current == null) {
		if (resistance === 0) return {
			ok: false,
			error: "Resistência zero.",
			severity: "danger"
		};
		current = voltage / resistance;
		formula = "I = V / R";
	} else if (current != null && resistance != null && voltage == null) {
		voltage = current * resistance;
		formula = "V = I × R";
	} else if (voltage != null && current != null && resistance != null) {
		const expect = current * resistance;
		const scale = Math.max(Math.abs(voltage), Math.abs(expect), 1e-12);
		if (Math.abs(expect - voltage) / scale > .02) return {
			ok: false,
			error: "V, I e R não fecham (mais de 2%).",
			severity: "danger"
		};
		formula = "V = I × R";
	}
	if (voltage == null || current == null || resistance == null) return {
		ok: false,
		error: "Valor inválido.",
		severity: "danger"
	};
	if (![
		voltage,
		current,
		resistance
	].every(Number.isFinite)) return {
		ok: false,
		error: "Valor inválido.",
		severity: "danger"
	};
	return {
		ok: true,
		voltage,
		current,
		resistance,
		power: voltage * current,
		formula
	};
}
function voltageDivider(vin, r1, r2) {
	if (!(vin >= 0) || !(r1 > 0) || !(r2 > 0) || ![
		vin,
		r1,
		r2
	].every(Number.isFinite)) return {
		ok: false,
		error: "Vin, R1 e R2 têm de ser positivos."
	};
	const total = r1 + r2;
	const current = vin / total;
	return {
		ok: true,
		vout: vin * (r2 / total),
		current,
		p1: current * current * r1,
		p2: current * current * r2,
		total
	};
}
function rcFilter(r, c, freq) {
	if (!(r > 0) || !(c > 0)) return {
		ok: false,
		error: "R e C têm de ser positivos."
	};
	const tau = r * c;
	const fc = 1 / (2 * Math.PI * tau);
	if (freq == null) return {
		ok: true,
		tau,
		fc,
		gain: null,
		db: null
	};
	if (!(freq > 0)) return {
		ok: false,
		error: "A frequência tem de ser positiva."
	};
	const gain = 1 / Math.sqrt(1 + (freq / fc) ** 2);
	return {
		ok: true,
		tau,
		fc,
		gain,
		db: 20 * Math.log10(gain)
	};
}
function lcResonance(l, c) {
	if (!(l > 0) || !(c > 0)) return {
		ok: false,
		error: "L e C têm de ser positivos."
	};
	return {
		ok: true,
		f: 1 / (2 * Math.PI * Math.sqrt(l * c))
	};
}
function ledResistor(vs, vf, current) {
	if (!(vs > 0) || !(vf > 0) || !(current > 0)) return {
		ok: false,
		error: "Fonte, Vf e corrente têm de ser positivos."
	};
	if (vs <= vf) return {
		ok: false,
		error: "A fonte tem de ser maior que a tensão do LED."
	};
	return {
		ok: true,
		resistance: (vs - vf) / current,
		pRes: (vs - vf) * current,
		pLed: vf * current,
		current
	};
}
function equivalent(values, mode, kind) {
	if (values.length < 2) return {
		ok: false,
		error: "Indica pelo menos dois valores."
	};
	if (values.some((v) => !(v > 0) || !Number.isFinite(v))) return {
		ok: false,
		error: "Os valores têm de ser positivos."
	};
	const adds = kind === "C" ? mode === "parallel" : mode === "series";
	const value = adds ? values.reduce((a, b) => a + b, 0) : 1 / values.reduce((a, b) => a + 1 / b, 0);
	const symbol = kind === "R" ? "R" : kind === "L" ? "L" : "C";
	return {
		ok: true,
		value,
		formula: adds ? `${symbol}eq = ${symbol}1 + ${symbol}2 + …` : `1/${symbol}eq = 1/${symbol}1 + 1/${symbol}2 + …`,
		symbol
	};
}
var E12 = [
	100,
	120,
	150,
	180,
	220,
	270,
	330,
	390,
	470,
	560,
	680,
	820
];
var E24 = [
	100,
	110,
	120,
	130,
	150,
	160,
	180,
	200,
	220,
	240,
	270,
	300,
	330,
	360,
	390,
	430,
	470,
	510,
	560,
	620,
	680,
	750,
	820,
	910
];
/** Lowest hFE in a note like "hFE 110–800". Ignores Rds(on) text. */
function parseBeta(raw) {
	const text = raw.trim();
	if (!text || /[ωΩ]|ohm|rds/i.test(text)) return null;
	const nums = [...text.matchAll(/(\d+(?:[.,]\d+)?)/g)].map((match) => Number(match[1].replace(",", "."))).filter((n) => n > 1 && n < 2e3);
	if (nums.length === 0) return null;
	return Math.min(...nums);
}
function bad(error) {
	return {
		ok: false,
		error
	};
}
/**
* Common-emitter voltage-divider bias.
* NPN: Re to ground, Rc to Vcc. PNP: Re to Vcc, Rc to ground.
* Empty veDrop → 10% of Vcc. Empty vce → midpoint of the remaining swing.
* Stiffness is divider current / Ib (rule of 10).
*/
function biasDivider(input) {
	const { polarity, vcc, ic, beta, vbe } = input;
	if (!(vcc > 0) || !(ic > 0) || !(vbe > 0) || ![
		vcc,
		ic,
		beta,
		vbe
	].every(Number.isFinite)) return bad("Fonte, corrente, hFE e Vbe têm de ser positivos.");
	if (!(beta > 1)) return bad("O hFE tem de ser maior que 1.");
	if (vbe >= vcc) return bad("Vbe não cabe na fonte.");
	if (!(input.stiffness > 1) || !Number.isFinite(input.stiffness)) return bad("A rigidez do divisor tem de ser maior que 1.");
	const assumedVe = input.veDrop == null;
	const veDrop = input.veDrop ?? vcc * .1;
	if (!(veDrop > 0)) return bad("A queda no emissor tem de ser positiva.");
	if (veDrop + vbe >= vcc * .92) return bad("A queda no emissor mais Vbe não deixa margem para o coletor.");
	const ib = ic / beta;
	const ie = ic + ib;
	const re = veDrop / ie;
	const ve = polarity === "npn" ? veDrop : vcc - veDrop;
	const vb = polarity === "npn" ? ve + vbe : ve - vbe;
	if (!(vb > 0) || vb >= vcc) return bad("A tensão de base fica fora da fonte.");
	let i1;
	let i2;
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
	if (!(span > .2)) return bad("Não há tensão útil entre coletor e emissor.");
	const assumedVce = input.vce == null;
	const vce = input.vce ?? span / 2;
	if (!(vce > 0) || vce >= span) return bad("Esse Vce não cabe entre a fonte e a queda do emissor.");
	const vc = polarity === "npn" ? ve + vce : ve - vce;
	const rc = polarity === "npn" ? (vcc - vc) / ic : vc / ic;
	if (![
		r1,
		r2,
		rc,
		re
	].every((r) => r > 0 && Number.isFinite(r))) return bad("Os resistores não fecham. Revê as tensões.");
	const notes = [];
	if (assumedVe) notes.push("Queda no emissor assumida a 10% da fonte.");
	if (assumedVce) notes.push("Vce assumido a meio da excursão que resta.");
	if (vce < 1) notes.push("Vce baixo: o transístor fica perto da saturação e o ganho cai.");
	if (veDrop < .4) notes.push("Pouca queda no emissor: o ponto de trabalho muda com a temperatura.");
	notes.push("Ganho aproximado sem condensador em paralelo com Re. O sinal inverte.");
	const npn = polarity === "npn";
	return {
		ok: true,
		resistors: [
			{
				name: "Rc",
				role: npn ? "coletor → fonte" : "coletor → massa",
				ohms: rc,
				power: ic * ic * rc
			},
			{
				name: "Re",
				role: npn ? "emissor → massa" : "emissor → fonte",
				ohms: re,
				power: ie * ie * re
			},
			{
				name: "R1",
				role: "divisor, lado da fonte",
				ohms: r1,
				power: i1 * i1 * r1
			},
			{
				name: "R2",
				role: "divisor, lado da massa",
				ohms: r2,
				power: i2 * i2 * r2
			}
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
		notes
	};
}
/** Saturated switch: one base resistor. NPN low-side, PNP high-side. */
function biasSwitch(input) {
	const { polarity, vcc, ic, beta, vbe, vceSat } = input;
	if (!(vcc > 0) || !(ic > 0) || !(vbe > 0) || !(vceSat >= 0) || ![
		vcc,
		ic,
		beta,
		vbe,
		vceSat
	].every(Number.isFinite)) return bad("Fonte, corrente da carga e Vbe têm de ser positivos.");
	if (!(beta > 1)) return bad("O hFE forçado tem de ser maior que 1.");
	if (vbe + vceSat >= vcc) return bad("Vbe e Vce(sat) não cabem na fonte.");
	const assumedDrive = input.vdrive == null;
	const vdrive = input.vdrive ?? (polarity === "npn" ? vcc : 0);
	if (!Number.isFinite(vdrive) || vdrive < 0 || vdrive > vcc + 1e-6) return bad("A tensão de comando tem de estar entre 0 e a fonte.");
	const across = polarity === "npn" ? vdrive - vbe : vcc - vbe - vdrive;
	if (!(across > 0)) return bad(polarity === "npn" ? "Para ligar o NPN, o comando tem de ficar acima de Vbe." : "Para ligar o PNP, o comando tem de ficar abaixo de Vcc − Vbe.");
	const ib = ic / beta;
	const notes = [];
	if (assumedDrive) notes.push(polarity === "npn" ? "Comando assumido igual à fonte." : "Comando assumido a 0 V, como um GPIO em baixo.");
	if (beta > 25) notes.push("Para saturar de certeza, força um hFE baixo (cerca de 10). Com o hFE de catálogo pode ficar na região ativa.");
	notes.push(polarity === "npn" ? "Interruptor em baixo: a carga fica entre a fonte e o coletor." : "Interruptor em cima: a carga fica entre o coletor e a massa.");
	return {
		ok: true,
		resistors: [{
			name: "Rb",
			role: polarity === "npn" ? "base, a partir do comando" : "base, para o comando em baixo",
			ohms: across / ib,
			power: across * ib
		}],
		ib,
		ic,
		ie: ic + ib,
		vb: polarity === "npn" ? vbe : vcc - vbe,
		ve: polarity === "npn" ? 0 : vcc,
		vc: polarity === "npn" ? vceSat : vcc - vceSat,
		vce: vceSat,
		pq: vceSat * ic,
		av: null,
		notes
	};
}
function nearestSeries(value, series) {
	const list = series === "E12" ? E12 : E24;
	const decade = 10 ** (Math.floor(Math.log10(value)) - 2);
	let best = list[0] * decade;
	let bestErr = Infinity;
	for (const shift of [
		-1,
		0,
		1
	]) {
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
var BANDS = [
	{
		id: "black",
		name: "Preto",
		digit: 0,
		exp: 0,
		tol: null
	},
	{
		id: "brown",
		name: "Castanho",
		digit: 1,
		exp: 1,
		tol: 1
	},
	{
		id: "red",
		name: "Vermelho",
		digit: 2,
		exp: 2,
		tol: 2
	},
	{
		id: "orange",
		name: "Laranja",
		digit: 3,
		exp: 3,
		tol: null
	},
	{
		id: "yellow",
		name: "Amarelo",
		digit: 4,
		exp: 4,
		tol: null
	},
	{
		id: "green",
		name: "Verde",
		digit: 5,
		exp: 5,
		tol: .5
	},
	{
		id: "blue",
		name: "Azul",
		digit: 6,
		exp: 6,
		tol: .25
	},
	{
		id: "violet",
		name: "Violeta",
		digit: 7,
		exp: 7,
		tol: .1
	},
	{
		id: "gray",
		name: "Cinzento",
		digit: 8,
		exp: 8,
		tol: .05
	},
	{
		id: "white",
		name: "Branco",
		digit: 9,
		exp: 9,
		tol: null
	},
	{
		id: "gold",
		name: "Dourado",
		digit: null,
		exp: -1,
		tol: 5
	},
	{
		id: "silver",
		name: "Prateado",
		digit: null,
		exp: -2,
		tol: 10
	}
];
function bandById(id) {
	return BANDS.find((b) => b.id === id);
}
function decodeBands(ids) {
	const bands = ids.map(bandById);
	if (bands.some((b) => !b) || bands.length < 3) return {
		ok: false,
		error: "Banda em falta."
	};
	const tol = bands[bands.length - 1];
	const mult = bands[bands.length - 2];
	const digits = bands.slice(0, -2);
	if (digits.some((b) => b.digit == null)) return {
		ok: false,
		error: "Essa cor não é um dígito."
	};
	if (mult.exp == null) return {
		ok: false,
		error: "Essa cor não é um multiplicador."
	};
	return {
		ok: true,
		ohms: digits.reduce((acc, b) => acc * 10 + b.digit, 0) * 10 ** mult.exp,
		tolerance: tol.tol
	};
}
function encodeResistor(ohms, count) {
	if (!(ohms > 0) || !Number.isFinite(ohms)) return {
		ok: false,
		error: "Indica um valor positivo."
	};
	const sig = count === 4 ? 2 : 3;
	let exp = Math.floor(Math.log10(ohms)) - (sig - 1);
	let mant = Math.round(ohms / 10 ** exp);
	if (mant >= 10 ** sig) {
		mant = Math.round(mant / 10);
		exp += 1;
	}
	if (exp < -2 || exp > 9) return {
		ok: false,
		error: "Fora da gama do código de cores."
	};
	const mult = BANDS.find((b) => b.exp === exp && (exp >= 0 ? b.digit === exp : b.digit == null));
	if (!mult) return {
		ok: false,
		error: "Sem multiplicador para este valor."
	};
	const digits = String(mant).padStart(sig, "0").split("").map((ch) => BANDS.find((b) => b.digit === Number(ch))?.id);
	if (digits.some((d) => !d)) return {
		ok: false,
		error: "Não foi possível codificar."
	};
	return {
		ok: true,
		digits,
		multiplier: mult.id,
		nominal: mant * 10 ** exp
	};
}
function toleranceBand(tol) {
	return BANDS.find((b) => b.tol === tol)?.id ?? null;
}
var PREFIX = {
	p: 1e-12,
	n: 1e-9,
	u: 1e-6,
	µ: 1e-6,
	μ: 1e-6,
	m: .001,
	k: 1e3,
	K: 1e3,
	M: 1e6,
	G: 1e9
};
function stripTrailingUnit(input) {
	let s = input;
	s = s.replace(/(ohms|ohm|farads|farad|henries|henry|volts|volt|amperes|ampere|amps|amp|watts|watt|hertz|hz)$/i, "");
	s = s.replace(/[Ωω]$/u, "");
	s = s.replace(/[FHVAWfh]$/, (ch, _i, str) => /[\dpnuµμmkKMG.]$/.test(str.slice(0, -1)) ? "" : ch);
	return s;
}
/** Parse bench notation: 10k, 4k7, 4R7, 100nF, 10µ, 250 mW, 1e-7, 4,7k. */
function parseEngineering(raw) {
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
var PREFIXES = [
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T"
];
function formatSi(value, unit) {
	if (!Number.isFinite(value)) return "—";
	const sign = value < 0 ? "-" : "";
	const abs = Math.abs(value);
	if (abs === 0) return unit ? `0 ${unit}` : "0";
	const group = Math.floor(Math.log10(abs) / 3 + 1e-12);
	if (group < -5 || group > 4) {
		const sci = value.toExponential(2).replace(".", ",");
		return unit ? `${sci} ${unit}` : sci;
	}
	const scale = 10 ** (group * 3);
	const mantissa = Math.round(abs / scale * 1e3) / 1e3;
	const text = String(mantissa).replace(".", ",");
	const prefix = PREFIXES[group + 5] ?? "";
	if (!prefix && !unit) return `${sign}${text}`;
	if (!prefix) return `${sign}${text} ${unit}`;
	return unit ? `${sign}${text} ${prefix}${unit}` : `${sign}${text} ${prefix}`;
}
function formatNum(value, digits = 4) {
	if (!Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	return (abs !== 0 && (abs < .001 || abs >= 1e7) ? value.toExponential(2) : String(Number(value.toPrecision(digits)))).replace(".", ",");
}
function formatProp(value, field) {
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
function isLow(part) {
	return part.qty <= 0 || part.minQty > 0 && part.qty <= part.minQty;
}
function partHeadline(part, category) {
	const kicker = category?.name ?? "Sem categoria";
	const primary = category?.fields.find((f) => f.kind === "si");
	const primaryText = primary ? formatProp(part.props[primary.key], primary) : "";
	const title = part.name.trim() || primaryText || part.mpn || "Sem identificação";
	const bits = [];
	if (part.name.trim() && primaryText) bits.push(primaryText);
	if (part.mpn && part.mpn !== title) bits.push(part.mpn);
	for (const field of category?.fields ?? []) {
		if (primary && field.key === primary.key) continue;
		const text = formatProp(part.props[field.key], field);
		if (text) bits.push(text);
	}
	if (part.location) bits.push(part.location);
	return {
		kicker,
		title,
		meta: bits.join(" · ")
	};
}
function compact(value) {
	return value.toLowerCase().replace(/\s+/g, "").replace(",", ".");
}
function matchesQuery(part, categories, query) {
	const qRaw = query.trim();
	if (!qRaw) return true;
	const q = compact(qRaw);
	const category = categories.find((c) => c.id === part.categoryId);
	const texts = [
		part.name,
		part.mpn,
		part.location,
		part.notes,
		category?.name ?? "",
		category?.short ?? ""
	];
	for (const field of category?.fields ?? []) {
		const raw = part.props[field.key];
		if (!raw) continue;
		texts.push(raw);
		const shown = formatProp(raw, field);
		if (shown) texts.push(shown);
	}
	const qNum = parseEngineering(qRaw);
	const allDigits = /^\d+$/.test(qRaw);
	if (qNum != null && !allDigits) return (category?.fields ?? []).some((field) => {
		if (field.kind !== "si") return false;
		const n = parseEngineering(part.props[field.key] || "");
		if (n == null) return false;
		if (qNum === 0) return n === 0;
		return Math.abs(n - qNum) / Math.max(Math.abs(qNum), 1e-18) <= .02;
	}) || texts.some((text) => compact(text) === q);
	return texts.some((text) => compact(text).includes(q));
}
function matchStock(parts, categoryId, fieldKey, target, windowPct = 10) {
	if (!(target > 0)) return {
		close: [],
		nearest: null
	};
	const ranked = [];
	for (const part of parts) {
		if (part.categoryId !== categoryId || part.qty <= 0) continue;
		const value = parseEngineering(part.props[fieldKey] || "");
		if (value == null || !(value > 0)) continue;
		ranked.push({
			part,
			value,
			errPct: Math.abs(value - target) / target * 100
		});
	}
	ranked.sort((a, b) => a.errPct - b.errPct);
	return {
		close: ranked.filter((row) => row.errPct <= windowPct),
		nearest: ranked[0] ?? null
	};
}
function powerOf(part) {
	if (!part) return null;
	const n = parseEngineering(part.props.power || "");
	return n != null && n > 0 ? n : null;
}
var TOL = {
	key: "tolerance",
	label: "Tolerância",
	kind: "select",
	options: [
		"0.1",
		"0.5",
		"1",
		"2",
		"5",
		"10",
		"20"
	]
};
var builtinCategories = () => [
	{
		id: "resistors",
		name: "Resistores",
		short: "R",
		builtin: true,
		fields: [
			{
				key: "resistance",
				label: "Resistência",
				kind: "si",
				unit: "Ω",
				placeholder: "10k ou 4k7"
			},
			TOL,
			{
				key: "power",
				label: "Potência",
				kind: "si",
				unit: "W",
				placeholder: "0,25"
			},
			{
				key: "tech",
				label: "Tecnologia",
				kind: "select",
				options: [
					"Filme de carbono",
					"Filme metálico",
					"Óxido metálico",
					"Wirewound",
					"Rede"
				]
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"Axial",
					"0201",
					"0402",
					"0603",
					"0805",
					"1206",
					"1210",
					"2010",
					"2512"
				]
			}
		]
	},
	{
		id: "capacitors",
		name: "Capacitores",
		short: "C",
		builtin: true,
		fields: [
			{
				key: "capacitance",
				label: "Capacidade",
				kind: "si",
				unit: "F",
				placeholder: "100n"
			},
			{
				key: "voltage",
				label: "Tensão",
				kind: "si",
				unit: "V",
				placeholder: "50"
			},
			TOL,
			{
				key: "dielectric",
				label: "Dielétrico",
				kind: "select",
				options: [
					"C0G/NP0",
					"X7R",
					"Y5V",
					"Eletrolítico",
					"Tântalo",
					"Filme",
					"Poliéster",
					"Polipropileno"
				]
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"Radial",
					"Axial",
					"0402",
					"0603",
					"0805",
					"1206",
					"Snap-in"
				]
			},
			{
				key: "polarized",
				label: "Polarizado",
				kind: "select",
				options: ["Não", "Sim"]
			}
		]
	},
	{
		id: "inductors",
		name: "Indutores",
		short: "L",
		builtin: true,
		fields: [
			{
				key: "inductance",
				label: "Indutância",
				kind: "si",
				unit: "H",
				placeholder: "10µ"
			},
			{
				key: "current",
				label: "Corrente",
				kind: "si",
				unit: "A",
				placeholder: "1"
			},
			{
				key: "dcr",
				label: "DCR",
				kind: "si",
				unit: "Ω",
				placeholder: "0,1"
			},
			{
				key: "type",
				label: "Tipo",
				kind: "select",
				options: [
					"Potência",
					"RF",
					"Choque",
					"Ferrite"
				]
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"Radial",
					"Axial",
					"0603",
					"0805",
					"1210",
					"Toroidal"
				]
			}
		]
	},
	{
		id: "diodes",
		name: "Díodos",
		short: "D",
		builtin: true,
		fields: [
			{
				key: "kind",
				label: "Tipo",
				kind: "select",
				options: [
					"Sinal",
					"Retificador",
					"Schottky",
					"Zener",
					"LED",
					"TVS"
				]
			},
			{
				key: "model",
				label: "Modelo",
				kind: "text",
				placeholder: "1N4148"
			},
			{
				key: "vf",
				label: "Vf / Vz",
				kind: "si",
				unit: "V",
				placeholder: "0,7"
			},
			{
				key: "current",
				label: "Corrente",
				kind: "si",
				unit: "A",
				placeholder: "20m"
			},
			{
				key: "power",
				label: "Potência",
				kind: "si",
				unit: "W",
				placeholder: "0,5"
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"DO-35",
					"DO-41",
					"SOD-123",
					"SOD-323",
					"SMA",
					"SMB",
					"LED 3 mm",
					"LED 5 mm",
					"LED SMD"
				]
			},
			{
				key: "color",
				label: "Cor",
				kind: "text",
				placeholder: "só para LED"
			}
		]
	},
	{
		id: "transistors",
		name: "Transistores",
		short: "T",
		builtin: true,
		fields: [
			{
				key: "kind",
				label: "Tipo",
				kind: "select",
				options: [
					"NPN",
					"PNP",
					"MOSFET-N",
					"MOSFET-P",
					"JFET-N",
					"JFET-P"
				]
			},
			{
				key: "model",
				label: "Modelo",
				kind: "text",
				placeholder: "BC547"
			},
			{
				key: "voltage",
				label: "Vceo / Vds",
				kind: "si",
				unit: "V",
				placeholder: "45"
			},
			{
				key: "current",
				label: "Ic / Id",
				kind: "si",
				unit: "A",
				placeholder: "100m"
			},
			{
				key: "param",
				label: "hFE ou Rds(on)",
				kind: "text",
				placeholder: "200 ou 17 mΩ"
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"TO-92",
					"SOT-23",
					"SOT-223",
					"TO-220",
					"TO-252",
					"TO-263"
				]
			}
		]
	},
	{
		id: "relays",
		name: "Relés",
		short: "K",
		builtin: true,
		fields: [
			{
				key: "kind",
				label: "Tipo",
				kind: "select",
				options: [
					"Eletromecânico",
					"Estado sólido",
					"Reed"
				]
			},
			{
				key: "model",
				label: "Modelo",
				kind: "text",
				placeholder: "SRD-05VDC-SL-C"
			},
			{
				key: "coilVoltage",
				label: "Bobina",
				kind: "si",
				unit: "V",
				placeholder: "5"
			},
			{
				key: "coilCurrent",
				label: "Corrente da bobina",
				kind: "si",
				unit: "A",
				placeholder: "70m"
			},
			{
				key: "config",
				label: "Contactos",
				kind: "select",
				options: [
					"SPST-NO",
					"SPST-NC",
					"SPDT",
					"DPST",
					"DPDT",
					"4PDT"
				]
			},
			{
				key: "contactVoltage",
				label: "Tensão dos contactos",
				kind: "si",
				unit: "V",
				placeholder: "250"
			},
			{
				key: "contactCurrent",
				label: "Corrente dos contactos",
				kind: "si",
				unit: "A",
				placeholder: "10"
			}
		]
	},
	{
		id: "fuses",
		name: "Fusíveis",
		short: "F",
		builtin: true,
		fields: [
			{
				key: "current",
				label: "Corrente",
				kind: "si",
				unit: "A",
				placeholder: "1"
			},
			{
				key: "voltage",
				label: "Tensão",
				kind: "si",
				unit: "V",
				placeholder: "250"
			},
			{
				key: "speed",
				label: "Velocidade",
				kind: "select",
				options: [
					"Rápido",
					"Lento",
					"Resettable"
				]
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"5×20 mm",
					"6,3×32 mm",
					"SMD 1206",
					"Blade",
					"PTC"
				]
			}
		]
	},
	{
		id: "crystals",
		name: "Cristais",
		short: "X",
		builtin: true,
		fields: [
			{
				key: "frequency",
				label: "Frequência",
				kind: "si",
				unit: "Hz",
				placeholder: "16M"
			},
			{
				key: "load",
				label: "Carga",
				kind: "number",
				unit: "pF",
				placeholder: "18"
			},
			{
				key: "package",
				label: "Encapsulamento",
				kind: "select",
				options: [
					"HC-49",
					"SMD 3225",
					"SMD 5032",
					"Cilíndrico"
				]
			}
		]
	},
	{
		id: "pots",
		name: "Potenciómetros",
		short: "P",
		builtin: true,
		fields: [
			{
				key: "resistance",
				label: "Resistência",
				kind: "si",
				unit: "Ω",
				placeholder: "10k"
			},
			{
				key: "taper",
				label: "Curva",
				kind: "select",
				options: ["Linear", "Logarítmico"]
			},
			{
				key: "power",
				label: "Potência",
				kind: "si",
				unit: "W",
				placeholder: "0,1"
			},
			{
				key: "kind",
				label: "Forma",
				kind: "select",
				options: [
					"Trimmer",
					"Rotativo",
					"Deslizante",
					"Multivoltas"
				]
			}
		]
	}
];
var n = (value) => String(value);
function part(id, categoryId, qty, location, props, extra) {
	return {
		id,
		categoryId,
		name: extra?.name ?? "",
		mpn: extra?.mpn ?? "",
		qty,
		minQty: extra?.minQty ?? 0,
		location,
		notes: extra?.notes ?? "",
		props,
		updatedAt: 0
	};
}
function demoParts() {
	return [
		part("demo-r-220", "resistors", 40, "Gaveta A1", {
			resistance: n(220),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-330", "resistors", 30, "Gaveta A1", {
			resistance: n(330),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-1k", "resistors", 50, "Gaveta A2", {
			resistance: n(1e3),
			tolerance: "1",
			power: n(.25),
			tech: "Filme metálico",
			package: "Axial"
		}),
		part("demo-r-2k2", "resistors", 25, "Gaveta A2", {
			resistance: n(2200),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-4k7", "resistors", 40, "Gaveta A2", {
			resistance: n(4700),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-10k", "resistors", 80, "Gaveta A3", {
			resistance: n(1e4),
			tolerance: "1",
			power: n(.25),
			tech: "Filme metálico",
			package: "Axial"
		}, { notes: "Pull-up habitual" }),
		part("demo-r-10k-smd", "resistors", 100, "Gaveta A3", {
			resistance: n(1e4),
			tolerance: "5",
			power: n(.125),
			tech: "Filme metálico",
			package: "0805"
		}),
		part("demo-r-47k", "resistors", 20, "Gaveta A4", {
			resistance: n(47e3),
			tolerance: "1",
			power: n(.25),
			tech: "Filme metálico",
			package: "Axial"
		}),
		part("demo-r-100k", "resistors", 35, "Gaveta A4", {
			resistance: n(1e5),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-1m", "resistors", 12, "Gaveta A4", {
			resistance: n(1e6),
			tolerance: "5",
			power: n(.25),
			tech: "Filme de carbono",
			package: "Axial"
		}),
		part("demo-r-10", "resistors", 6, "Gaveta A5", {
			resistance: n(10),
			tolerance: "5",
			power: n(1),
			tech: "Wirewound",
			package: "Axial"
		}),
		part("demo-c-22p", "capacitors", 20, "Gaveta B1", {
			capacitance: n(22e-12),
			voltage: n(50),
			tolerance: "5",
			dielectric: "C0G/NP0",
			package: "0805",
			polarized: "Não"
		}),
		part("demo-c-100n", "capacitors", 120, "Gaveta B1", {
			capacitance: n(1e-7),
			voltage: n(50),
			tolerance: "10",
			dielectric: "X7R",
			package: "0805",
			polarized: "Não"
		}, { notes: "Desacoplamento" }),
		part("demo-c-1u", "capacitors", 30, "Gaveta B2", {
			capacitance: n(1e-6),
			voltage: n(25),
			tolerance: "10",
			dielectric: "X7R",
			package: "0805",
			polarized: "Não"
		}),
		part("demo-c-10u", "capacitors", 18, "Gaveta B2", {
			capacitance: n(1e-5),
			voltage: n(25),
			tolerance: "20",
			dielectric: "Eletrolítico",
			package: "Radial",
			polarized: "Sim"
		}),
		part("demo-c-100u", "capacitors", 14, "Gaveta B3", {
			capacitance: n(1e-4),
			voltage: n(16),
			tolerance: "20",
			dielectric: "Eletrolítico",
			package: "Radial",
			polarized: "Sim"
		}),
		part("demo-c-470u", "capacitors", 6, "Gaveta B3", {
			capacitance: n(47e-5),
			voltage: n(25),
			tolerance: "20",
			dielectric: "Eletrolítico",
			package: "Radial",
			polarized: "Sim"
		}),
		part("demo-l-10u", "inductors", 8, "Gaveta C1", {
			inductance: n(1e-5),
			current: n(1),
			dcr: n(.08),
			type: "Potência",
			package: "1210"
		}),
		part("demo-l-100u", "inductors", 6, "Gaveta C1", {
			inductance: n(1e-4),
			current: n(.2),
			dcr: n(1.2),
			type: "RF",
			package: "Radial"
		}),
		part("demo-l-1m", "inductors", 4, "Gaveta C1", {
			inductance: n(.001),
			current: n(.1),
			dcr: n(8),
			type: "Choque",
			package: "Radial"
		}, { minQty: 5 }),
		part("demo-d-4148", "diodes", 40, "Caixa D1", {
			kind: "Sinal",
			model: "1N4148",
			vf: n(.7),
			current: n(.2),
			power: n(.5),
			package: "DO-35",
			color: ""
		}, { mpn: "1N4148" }),
		part("demo-d-4007", "diodes", 25, "Caixa D1", {
			kind: "Retificador",
			model: "1N4007",
			vf: n(1),
			current: n(1),
			power: n(3),
			package: "DO-41",
			color: ""
		}, { mpn: "1N4007" }),
		part("demo-d-5819", "diodes", 10, "Caixa D2", {
			kind: "Schottky",
			model: "1N5819",
			vf: n(.4),
			current: n(1),
			power: n(1),
			package: "DO-41",
			color: ""
		}, { mpn: "1N5819" }),
		part("demo-d-zener", "diodes", 8, "Caixa D2", {
			kind: "Zener",
			model: "1N4733",
			vf: n(5.1),
			current: n(.05),
			power: n(.5),
			package: "DO-41",
			color: ""
		}, { mpn: "1N4733A" }),
		part("demo-d-led-r", "diodes", 25, "Caixa D3", {
			kind: "LED",
			model: "",
			vf: n(2),
			current: n(.02),
			power: n(.06),
			package: "LED 5 mm",
			color: "Vermelho"
		}),
		part("demo-d-led-w", "diodes", 8, "Caixa D3", {
			kind: "LED",
			model: "",
			vf: n(3.2),
			current: n(.02),
			power: n(.08),
			package: "LED 5 mm",
			color: "Branco"
		}, { minQty: 10 }),
		part("demo-q-bc547", "transistors", 20, "Caixa E1", {
			kind: "NPN",
			model: "BC547",
			voltage: n(45),
			current: n(.1),
			param: "hFE 110–800",
			package: "TO-92"
		}, {
			mpn: "BC547B",
			notes: "Uso geral. Em muitos sítios substitui o 2N3904."
		}),
		part("demo-q-bc557", "transistors", 12, "Caixa E1", {
			kind: "PNP",
			model: "BC557",
			voltage: n(45),
			current: n(.1),
			param: "hFE 110–800",
			package: "TO-92"
		}, { mpn: "BC557B" }),
		part("demo-q-2n7000", "transistors", 15, "Caixa E2", {
			kind: "MOSFET-N",
			model: "2N7000",
			voltage: n(60),
			current: n(.2),
			param: "Rds(on) 5 Ω",
			package: "TO-92"
		}, { mpn: "2N7000" }),
		part("demo-q-irfz", "transistors", 2, "Caixa E2", {
			kind: "MOSFET-N",
			model: "IRFZ44N",
			voltage: n(55),
			current: n(49),
			param: "Rds(on) 17,5 mΩ",
			package: "TO-220"
		}, {
			mpn: "IRFZ44N",
			minQty: 4
		}),
		part("demo-k-srd", "relays", 3, "Caixa F1", {
			kind: "Eletromecânico",
			model: "SRD-05VDC-SL-C",
			coilVoltage: n(5),
			coilCurrent: n(.07),
			config: "SPDT",
			contactVoltage: n(250),
			contactCurrent: n(10)
		}, { mpn: "SRD-05VDC-SL-C" }),
		part("demo-k-g5v", "relays", 4, "Caixa F1", {
			kind: "Eletromecânico",
			model: "G5V-2",
			coilVoltage: n(12),
			coilCurrent: n(.03),
			config: "DPDT",
			contactVoltage: n(125),
			contactCurrent: n(2)
		}, { mpn: "G5V-2-12VDC" }),
		part("demo-f-1a", "fuses", 10, "Caixa F2", {
			current: n(1),
			voltage: n(250),
			speed: "Rápido",
			package: "5×20 mm"
		}),
		part("demo-f-500m", "fuses", 4, "Caixa F2", {
			current: n(.5),
			voltage: n(250),
			speed: "Lento",
			package: "5×20 mm"
		}, { minQty: 6 }),
		part("demo-x-16m", "crystals", 5, "Caixa G1", {
			frequency: n(16e6),
			load: "18",
			package: "HC-49"
		}),
		part("demo-x-32k", "crystals", 6, "Caixa G1", {
			frequency: n(32768),
			load: "12.5",
			package: "Cilíndrico"
		}),
		part("demo-p-10k", "pots", 8, "Caixa H1", {
			resistance: n(1e4),
			taper: "Linear",
			power: n(.1),
			kind: "Trimmer"
		}),
		part("demo-p-100k", "pots", 3, "Caixa H1", {
			resistance: n(1e5),
			taper: "Logarítmico",
			power: n(.2),
			kind: "Rotativo"
		})
	];
}
function slugKey(label, used) {
	const base = label.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "campo";
	let key = base;
	let i = 2;
	while (used.has(key)) {
		key = `${base}_${i}`;
		i += 1;
	}
	used.add(key);
	return key;
}
function withBuiltins(categories) {
	const ids = new Set(categories.map((c) => c.id));
	const missing = builtinCategories().filter((c) => !ids.has(c.id));
	return [...categories, ...missing];
}
function isField(value) {
	if (!value || typeof value !== "object") return false;
	const field = value;
	return typeof field.key === "string" && typeof field.label === "string" && typeof field.kind === "string";
}
function isCategory(value) {
	if (!value || typeof value !== "object") return false;
	const category = value;
	return typeof category.id === "string" && typeof category.name === "string" && Array.isArray(category.fields) && category.fields.every(isField);
}
function isPart(value) {
	if (!value || typeof value !== "object") return false;
	const part = value;
	return typeof part.id === "string" && typeof part.categoryId === "string" && !!part.props && typeof part.props === "object";
}
function normalizePart(part) {
	const props = {};
	for (const [key, value] of Object.entries(part.props ?? {})) if (typeof value === "string" || typeof value === "number") props[key] = String(value);
	return {
		id: part.id,
		categoryId: part.categoryId,
		name: typeof part.name === "string" ? part.name : "",
		mpn: typeof part.mpn === "string" ? part.mpn : "",
		qty: Number.isFinite(Number(part.qty)) ? Math.max(0, Math.round(Number(part.qty))) : 0,
		minQty: Number.isFinite(Number(part.minQty)) ? Math.max(0, Math.round(Number(part.minQty))) : 0,
		location: typeof part.location === "string" ? part.location : "",
		notes: typeof part.notes === "string" ? part.notes : "",
		props,
		updatedAt: Number(part.updatedAt) || Date.now()
	};
}
function normalizeCategory(category) {
	const builtin = builtinCategories().find((item) => item.id === category.id);
	return {
		id: category.id,
		name: category.name.trim() || builtin?.name || "Categoria",
		short: (category.short || builtin?.short || category.name.slice(0, 1) || "?").slice(0, 2),
		builtin: builtin ? true : Boolean(category.builtin),
		fields: category.fields.length > 0 ? category.fields : builtin?.fields ?? []
	};
}
var memoryStorage = {
	getItem: () => null,
	setItem: () => void 0,
	removeItem: () => void 0
};
var useBench = create()(persist((set, get) => ({
	categories: builtinCategories(),
	parts: demoParts(),
	addPart: (part) => set((state) => ({ parts: [normalizePart(part), ...state.parts] })),
	updatePart: (part) => set((state) => ({ parts: state.parts.map((item) => item.id === part.id ? normalizePart({
		...part,
		updatedAt: Date.now()
	}) : item) })),
	removePart: (id) => set((state) => ({ parts: state.parts.filter((item) => item.id !== id) })),
	adjustQty: (id, delta) => set((state) => ({ parts: state.parts.map((item) => item.id === id ? {
		...item,
		qty: Math.max(0, item.qty + delta),
		updatedAt: Date.now()
	} : item) })),
	addCategory: (category) => set((state) => ({ categories: [...state.categories, normalizeCategory(category)] })),
	updateCategory: (id, patch) => set((state) => ({ categories: state.categories.map((category) => category.id === id ? normalizeCategory({
		...category,
		...patch,
		id
	}) : category) })),
	removeCategory: (id) => {
		const category = get().categories.find((item) => item.id === id);
		if (!category) return {
			ok: false,
			error: "Categoria inexistente."
		};
		if (category.builtin) return {
			ok: false,
			error: "As categorias de origem ficam."
		};
		if (get().parts.some((part) => part.categoryId === id)) return {
			ok: false,
			error: "Ainda há peças nesta categoria."
		};
		set((state) => ({ categories: state.categories.filter((item) => item.id !== id) }));
		return { ok: true };
	},
	importData: (data) => {
		if (!data || typeof data !== "object") return {
			ok: false,
			error: "Ficheiro inválido."
		};
		const record = data;
		if (!Array.isArray(record.categories) || !Array.isArray(record.parts)) return {
			ok: false,
			error: "O ficheiro não tem categorias e peças."
		};
		const categories = withBuiltins(record.categories.filter(isCategory).map(normalizeCategory));
		const parts = record.parts.filter(isPart).map(normalizePart);
		if (categories.length === 0) return {
			ok: false,
			error: "Nenhuma categoria válida."
		};
		set({
			categories,
			parts
		});
		return {
			ok: true,
			count: parts.length
		};
	},
	resetDemo: () => set({
		categories: builtinCategories(),
		parts: demoParts()
	})
}), {
	name: "bancada",
	skipHydration: true,
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage : localStorage),
	partialize: (state) => ({
		categories: state.categories,
		parts: state.parts
	}),
	merge: (persisted, current) => {
		const saved = persisted;
		if (!saved?.categories || !saved.parts) return current;
		return {
			...current,
			categories: withBuiltins(saved.categories.map(normalizeCategory)),
			parts: saved.parts.map(normalizePart)
		};
	}
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonStyles = cva("press inline-flex items-center justify-center gap-2 font-medium transition-[background-color,opacity,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "border border-line-strong bg-surface text-ink hover:bg-elevated",
			ghost: "bg-transparent text-ink hover:bg-surface",
			danger: "bg-danger-bg text-danger hover:opacity-90"
		},
		size: {
			md: "h-11 rounded-sm px-4 text-sm",
			sm: "h-11 rounded-sm px-3 text-sm",
			icon: "size-11 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonStyles({
			variant,
			size
		}), className),
		...props
	});
}
var fieldClass = "h-11 w-full rounded-sm border border-line-strong bg-elevated px-3 text-base text-ink placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(fieldClass, className),
		...props
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(fieldClass, "min-h-24 py-2 leading-normal", className),
		...props
	});
}
function Select({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(fieldClass, "appearance-none", className),
		...props
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
function Badge({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex h-6 items-center rounded-full bg-danger-bg px-2 text-xs font-medium text-danger",
		children
	});
}
function Drawer({ title, description, onClose, children, footer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "overlay-in fixed inset-0 z-50 bg-ink/30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "drawer-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface outline-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-start justify-between gap-3 border-b border-line px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-lg font-medium tracking-tight",
						children: title
					}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "mt-1 text-sm text-muted",
						children: description
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "sr-only",
						children: "Painel"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Fechar",
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "text-lg leading-none",
							children: "×"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto px-4 py-4",
					children
				}),
				footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "safe-bottom flex gap-2 border-t border-line px-4 py-4",
					children: footer
				}) : null
			]
		})] })
	});
}
var TOOLS = [
	{
		id: "ohm",
		name: "Lei de Ohm",
		blurb: "Tensão, corrente, resistência e potência"
	},
	{
		id: "divider",
		name: "Divisor",
		blurb: "Duas resistências entre a fonte e a massa"
	},
	{
		id: "rc",
		name: "Filtro RC",
		blurb: "Frequência de corte e constante de tempo"
	},
	{
		id: "lc",
		name: "Ressonância LC",
		blurb: "Frequência de um circuito LC"
	},
	{
		id: "led",
		name: "LED",
		blurb: "Resistência série e o que há na gaveta"
	},
	{
		id: "bjt",
		name: "Transistor",
		blurb: "Polarização e resistor de base, NPN ou PNP"
	},
	{
		id: "net",
		name: "Série / paralelo",
		blurb: "Equivalente de R, C ou L"
	},
	{
		id: "bands",
		name: "Código de cores",
		blurb: "Ler ou gerar as bandas"
	}
];
function CalcView() {
	const [tool, setTool] = (0, import_react.useState)("ohm");
	const current = TOOLS.find((item) => item.id === tool) ?? TOOLS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible",
				children: TOOLS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTool(item.id),
					className: cn("press h-11 shrink-0 rounded-full border px-4 text-sm font-medium", tool === item.id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-ink"),
					children: item.name
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [current.blurb, ". Podes escrever 4k7, 100n ou 10µ, ou escolher uma peça."]
			}),
			tool === "ohm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OhmPanel, {}) : null,
			tool === "divider" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerPanel, {}) : null,
			tool === "rc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RcPanel, {}) : null,
			tool === "lc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcPanel, {}) : null,
			tool === "led" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedPanel, {}) : null,
			tool === "bjt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransistorPanel, {}) : null,
			tool === "net" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetPanel, {}) : null,
			tool === "bands" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BandsPanel, {}) : null
		]
	});
}
function StockSelect({ categoryId, fieldKey, onPick }) {
	const parts = useBench((state) => state.parts);
	const field = useBench((state) => state.categories).find((item) => item.id === categoryId)?.fields.find((item) => item.key === fieldKey);
	const options = parts.filter((part) => part.categoryId === categoryId && part.qty > 0 && parseEngineering(part.props[fieldKey] || "") != null).sort((a, b) => (parseEngineering(a.props[fieldKey] || "") ?? 0) - (parseEngineering(b.props[fieldKey] || "") ?? 0));
	if (!field || options.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		"aria-label": `Escolher ${field.label} do stock`,
		value: "",
		onChange: (event) => {
			const part = options.find((item) => item.id === event.target.value);
			if (part) onPick(part);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			children: "Do stock"
		}), options.map((part) => {
			const value = formatProp(part.props[fieldKey], field);
			const extra = part.props.package || part.props.tech || part.props.kind || part.mpn || part.name;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
				value: part.id,
				children: [
					value,
					extra ? ` · ${extra}` : "",
					" · ",
					part.qty,
					" un.",
					part.location ? ` · ${part.location}` : ""
				]
			}, part.id);
		})]
	});
}
function ValueField({ label, value, onChange, placeholder, stock }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			placeholder,
			inputMode: "decimal",
			onChange: (event) => onChange(event.target.value, null)
		}), stock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockSelect, {
			categoryId: stock.categoryId,
			fieldKey: stock.fieldKey,
			onPick: (part) => onChange(formatProp(part.props[stock.fieldKey], {
				key: stock.fieldKey,
				label,
				kind: "si",
				unit: unitFrom(stock)
			}), part)
		}) : null]
	});
}
function unitFrom(stock) {
	if (stock.fieldKey === "capacitance") return "F";
	if (stock.fieldKey === "inductance") return "H";
	if (stock.fieldKey === "voltage" || stock.fieldKey === "vf" || stock.fieldKey === "coilVoltage") return "V";
	if (stock.fieldKey === "current") return "A";
	if (stock.fieldKey === "frequency") return "Hz";
	return "Ω";
}
function Metric({ label, value, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-bg px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "num mt-1 text-2xl",
				children: value
			}),
			detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: detail
			}) : null
		]
	});
}
function PowerNote({ dissipated, part }) {
	const rating = powerOf(part);
	if (rating == null) return null;
	const over = dissipated > rating;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: cn("text-sm", over ? "text-danger" : "text-muted"),
		children: [
			formatSi(dissipated, "W"),
			" na peça de ",
			formatSi(rating, "W"),
			over ? " — a potência não chega." : "."
		]
	});
}
function StockHits({ categoryId, fieldKey, target, unit, dissipated }) {
	const parts = useBench((state) => state.parts);
	const category = useBench((state) => state.categories).find((item) => item.id === categoryId);
	const { close, nearest } = matchStock(parts, categoryId, fieldKey, target);
	const rows = close.length > 0 ? close.slice(0, 4) : nearest ? [nearest] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: close.length > 0 ? "No stock, dentro de 10%" : "A mais próxima no stock"
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Ainda não há peças desta categoria com quantidade."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: rows.map((row) => {
				const rating = powerOf(row.part);
				const over = dissipated != null && rating != null && dissipated > rating;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-line bg-bg px-3 py-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num",
							children: formatSi(row.value, unit)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" ",
								"· ",
								formatNum(row.errPct, 2),
								"% · ",
								row.part.qty,
								" un.",
								row.part.location ? ` · ${row.part.location}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-muted",
							children: partHeadline(row.part, category).meta
						}),
						over ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-danger",
							children: "A potência desta peça não chega."
						}) : null
					]
				}, row.part.id);
			})
		})]
	});
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-panel",
		children
	});
}
function OhmPanel() {
	const [v, setV] = (0, import_react.useState)("");
	const [i, setI] = (0, import_react.useState)("");
	const [r, setR] = (0, import_react.useState)("");
	const [rPart, setRPart] = (0, import_react.useState)(null);
	const result = solveOhm({
		v: parseEngineering(v),
		i: parseEngineering(i),
		r: parseEngineering(r)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Tensão",
				value: v,
				placeholder: "5",
				onChange: (value) => setV(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Corrente",
				value: i,
				placeholder: "20m",
				onChange: (value) => setI(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Resistência",
				value: r,
				placeholder: "10k",
				stock: {
					categoryId: "resistors",
					fieldKey: "resistance"
				},
				onChange: (value, part) => {
					setR(value);
					setRPart(part);
				}
			})
		]
	}), result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "V = I × R. Preenche dois e o terceiro aparece."
	}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: result.formula
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Tensão",
					value: formatSi(result.voltage, "V")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Corrente",
					value: formatSi(result.current, "A")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Resistência",
					value: formatSi(result.resistance, "Ω")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Potência",
					value: formatSi(result.power, "W")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerNote, {
			dissipated: result.power,
			part: rPart
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockHits, {
			categoryId: "resistors",
			fieldKey: "resistance",
			target: result.resistance,
			unit: "Ω",
			dissipated: result.power
		})
	] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-sm", result.severity === "danger" ? "text-danger" : "text-muted"),
		children: result.error
	})] });
}
function DividerPanel() {
	const [vin, setVin] = (0, import_react.useState)("");
	const [r1, setR1] = (0, import_react.useState)("");
	const [r2, setR2] = (0, import_react.useState)("");
	const [p1, setP1] = (0, import_react.useState)(null);
	const [p2, setP2] = (0, import_react.useState)(null);
	const V = parseEngineering(vin);
	const R1 = parseEngineering(r1);
	const R2 = parseEngineering(r2);
	const result = V != null && R1 != null && R2 != null ? voltageDivider(V, R1, R2) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "R1 fica entre a entrada e a saída. R2 fica entre a saída e a massa."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "Vin",
					value: vin,
					placeholder: "12",
					onChange: (value) => setVin(value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "R1",
					value: r1,
					placeholder: "10k",
					stock: {
						categoryId: "resistors",
						fieldKey: "resistance"
					},
					onChange: (value, part) => {
						setR1(value);
						setP1(part);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "R2",
					value: r2,
					placeholder: "10k",
					stock: {
						categoryId: "resistors",
						fieldKey: "resistance"
					},
					onChange: (value, part) => {
						setR2(value);
						setP2(part);
					}
				})
			]
		}),
		result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Vout = Vin × R2 / (R1 + R2)"
		}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Vout",
						value: formatSi(result.vout, "V"),
						detail: formatNum(result.vout / V * 100, 3) + " % de Vin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Corrente",
						value: formatSi(result.current, "A")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Potência em R1",
						value: formatSi(result.p1, "W")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Potência em R2",
						value: formatSi(result.p2, "W")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerNote, {
				dissipated: result.p1,
				part: p1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerNote, {
				dissipated: result.p2,
				part: p2
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: result.error
		})
	] });
}
function RcPanel() {
	const [r, setR] = (0, import_react.useState)("");
	const [c, setC] = (0, import_react.useState)("");
	const [f, setF] = (0, import_react.useState)("");
	const R = parseEngineering(r);
	const C = parseEngineering(c);
	const F = f.trim() ? parseEngineering(f) : null;
	const result = R != null && C != null ? rcFilter(R, C, F) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Resistência",
				value: r,
				placeholder: "10k",
				stock: {
					categoryId: "resistors",
					fieldKey: "resistance"
				},
				onChange: (value) => setR(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Capacidade",
				value: c,
				placeholder: "100n",
				stock: {
					categoryId: "capacitors",
					fieldKey: "capacitance"
				},
				onChange: (value) => setC(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Frequência do sinal",
				value: f,
				placeholder: "opcional, 1k",
				onChange: (value) => setF(value)
			})
		]
	}), result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "fc = 1 / (2πRC)"
	}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Corte",
				value: formatSi(result.fc, "Hz")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Tau",
				value: formatSi(result.tau, "s")
			}),
			result.gain != null && result.db != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Ganho",
				value: formatNum(result.gain, 3),
				detail: `${formatNum(result.db, 3)} dB`
			}) : null
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: result.error
	})] });
}
function LcPanel() {
	const [l, setL] = (0, import_react.useState)("");
	const [c, setC] = (0, import_react.useState)("");
	const L = parseEngineering(l);
	const C = parseEngineering(c);
	const result = L != null && C != null ? lcResonance(L, C) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
			label: "Indutância",
			value: l,
			placeholder: "10µ",
			stock: {
				categoryId: "inductors",
				fieldKey: "inductance"
			},
			onChange: (value) => setL(value)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
			label: "Capacidade",
			value: c,
			placeholder: "100n",
			stock: {
				categoryId: "capacitors",
				fieldKey: "capacitance"
			},
			onChange: (value) => setC(value)
		})]
	}), result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "f = 1 / (2π√LC)"
	}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
		label: "Ressonância",
		value: formatSi(result.f, "Hz")
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: result.error
	})] });
}
function LedPanel() {
	const [vs, setVs] = (0, import_react.useState)("5");
	const [vf, setVf] = (0, import_react.useState)("");
	const [i, setI] = (0, import_react.useState)("20m");
	const Vs = parseEngineering(vs);
	const Vf = parseEngineering(vf);
	const I = parseEngineering(i);
	const result = Vs != null && Vf != null && I != null ? ledResistor(Vs, Vf, I) : null;
	const e12 = result?.ok ? nearestSeries(result.resistance, "E12") : null;
	const e24 = result?.ok ? nearestSeries(result.resistance, "E24") : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Fonte",
				value: vs,
				placeholder: "5",
				onChange: (value) => setVs(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Vf do LED",
				value: vf,
				placeholder: "2",
				stock: {
					categoryId: "diodes",
					fieldKey: "vf"
				},
				onChange: (value) => setVf(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
				label: "Corrente",
				value: i,
				placeholder: "20m",
				onChange: (value) => setI(value)
			})
		]
	}), result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "R = (Vfonte − Vf) / I"
	}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Resistência",
				value: formatSi(result.resistance, "Ω")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "No resistor",
				value: formatSi(result.pRes, "W")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "No LED",
				value: formatSi(result.pLed, "W")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "E12 / E24",
				value: e12 != null && e24 != null ? `${formatSi(e12, "Ω")}` : "—",
				detail: e24 != null ? `E24 ${formatSi(e24, "Ω")}` : void 0
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockHits, {
		categoryId: "resistors",
		fieldKey: "resistance",
		target: e12 ?? result.resistance,
		unit: "Ω",
		dissipated: result.pRes
	})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: result.error
	})] });
}
function optionalNumber(raw) {
	if (!raw.trim()) return null;
	const value = parseEngineering(raw);
	return value == null ? "bad" : value;
}
function TransistorPanel() {
	const parts = useBench((state) => state.parts);
	const [polarity, setPolarity] = (0, import_react.useState)("npn");
	const [mode, setMode] = (0, import_react.useState)("bias");
	const [vcc, setVcc] = (0, import_react.useState)("12");
	const [icBias, setIcBias] = (0, import_react.useState)("2m");
	const [icSwitch, setIcSwitch] = (0, import_react.useState)("100m");
	const [betaBias, setBetaBias] = (0, import_react.useState)("100");
	const [betaSwitch, setBetaSwitch] = (0, import_react.useState)("10");
	const [vbe, setVbe] = (0, import_react.useState)("0,7");
	const [ve, setVe] = (0, import_react.useState)("");
	const [vce, setVce] = (0, import_react.useState)("");
	const [stiff, setStiff] = (0, import_react.useState)("10");
	const [drive, setDrive] = (0, import_react.useState)("");
	const [vsat, setVsat] = (0, import_react.useState)("0,2");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const stockBjts = parts.filter((part) => part.categoryId === "transistors" && part.qty > 0 && /^(NPN|PNP)$/i.test(part.props.kind || "")).sort((a, b) => (a.props.model || a.name).localeCompare(b.props.model || b.name, "pt"));
	function applyPart(part) {
		setPicked(part);
		const kind = (part.props.kind || "").toUpperCase();
		if (kind === "PNP") setPolarity("pnp");
		if (kind === "NPN") setPolarity("npn");
		const hfe = parseBeta(part.props.param || "");
		if (hfe != null && mode === "bias") setBetaBias(String(hfe).replace(".", ","));
	}
	const ic = mode === "bias" ? icBias : icSwitch;
	const beta = mode === "bias" ? betaBias : betaSwitch;
	const Vcc = parseEngineering(vcc);
	const Ic = parseEngineering(ic);
	const Beta = parseEngineering(beta);
	const Vbe = parseEngineering(vbe);
	const Ve = optionalNumber(ve);
	const Vce = optionalNumber(vce);
	const K = parseEngineering(stiff);
	const Drive = optionalNumber(drive);
	const Vsat = parseEngineering(vsat);
	const typed = [
		Ve,
		Vce,
		Drive
	].some((value) => value === "bad");
	let result = null;
	if (!typed && Vcc != null && Ic != null && Beta != null && Vbe != null && Ve !== "bad" && Vce !== "bad" && Drive !== "bad") result = mode === "bias" ? biasDivider({
		polarity,
		vcc: Vcc,
		ic: Ic,
		beta: Beta,
		vbe: Vbe,
		veDrop: Ve,
		vce: Vce,
		stiffness: K ?? NaN
	}) : Vsat == null ? {
		ok: false,
		error: "Indica o Vce de saturação."
	} : biasSwitch({
		polarity,
		vcc: Vcc,
		ic: Ic,
		beta: Beta,
		vbe: Vbe,
		vdrive: Drive,
		vceSat: Vsat
	});
	const vMax = picked ? parseEngineering(picked.props.voltage || "") : null;
	const iMax = picked ? parseEngineering(picked.props.current || "") : null;
	const catalogBeta = picked ? parseBeta(picked.props.param || "") : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [["bias", "Polarização"], ["switch", "Interruptor"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setMode(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated"),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [["npn", "NPN"], ["pnp", "PNP"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPolarity(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", polarity === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated"),
				children: label
			}, id))
		}),
		stockBjts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Do stock",
			hint: picked ? picked.props.model || picked.name : "NPN e PNP com quantidade",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				"aria-label": "Escolher transístor do stock",
				value: picked?.id ?? "",
				onChange: (event) => {
					const part = stockBjts.find((item) => item.id === event.target.value);
					if (part) applyPart(part);
					else setPicked(null);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "Escolher modelo"
				}), stockBjts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: part.id,
					children: [
						part.props.kind,
						" ",
						part.props.model || part.name,
						part.props.param ? ` · ${part.props.param}` : "",
						" · ",
						part.qty,
						" un."
					]
				}, part.id))]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BiasSchematic, {
			polarity,
			mode
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "Fonte",
					value: vcc,
					placeholder: "12",
					onChange: (value) => setVcc(value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: mode === "bias" ? "Ic em repouso" : "Corrente da carga",
					value: ic,
					placeholder: "2m",
					onChange: (value) => mode === "bias" ? setIcBias(value) : setIcSwitch(value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: mode === "bias" ? "hFE mínimo" : "hFE forçado",
					value: beta,
					placeholder: mode === "bias" ? "100" : "10",
					onChange: (value) => mode === "bias" ? setBetaBias(value) : setBetaSwitch(value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "Vbe",
					value: vbe,
					placeholder: "0,7",
					onChange: (value) => setVbe(value)
				}),
				mode === "bias" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
						label: "Queda no Re",
						value: ve,
						placeholder: "10% da fonte",
						onChange: (value) => setVe(value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
						label: "Vce",
						value: vce,
						placeholder: "meio da excursão",
						onChange: (value) => setVce(value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
						label: "Rigidez do divisor",
						value: stiff,
						placeholder: "10",
						onChange: (value) => setStiff(value)
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: polarity === "npn" ? "Comando ligado" : "Comando em baixo",
					value: drive,
					placeholder: polarity === "npn" ? "igual à fonte" : "0",
					onChange: (value) => setDrive(value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: "Vce sat",
					value: vsat,
					placeholder: "0,2",
					onChange: (value) => setVsat(value)
				})] })
			]
		}),
		typed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: "Há um valor que não consigo ler. Experimenta 1,2 ou 4k7."
		}) : result == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: mode === "bias" ? "Divisor na base, Re a estabilizar o emissor. R1 fica do lado da fonte, R2 do lado da massa." : "Um único resistor de base leva o transístor à saturação."
		}) : result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: result.resistors.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResistorCard, { item }, item.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Ib",
						value: formatSi(result.ib, "A")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "No transístor",
						value: formatSi(result.pq, "W"),
						detail: `Vce ${formatSi(result.vce, "V")}`
					}),
					result.av != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Ganho |Rc/Re|",
						value: `${formatNum(Math.abs(result.av), 2)}×`,
						detail: "sem bypass no emissor"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Ie",
						value: formatSi(result.ie, "A")
					})
				]
			}),
			mode === "bias" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Vb ",
					formatSi(result.vb, "V"),
					" · Ve ",
					formatSi(result.ve, "V"),
					" · Vc ",
					formatSi(result.vc, "V")
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-1",
				children: [
					result.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: note
					}, note)),
					vMax != null && Vcc != null && Vcc > vMax ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-danger",
						children: [
							"A fonte passa o Vceo desta peça (",
							formatSi(vMax, "V"),
							")."
						]
					}) : null,
					iMax != null && Ic != null && Ic > iMax ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-danger",
						children: [
							"A corrente passa o Ic máximo desta peça (",
							formatSi(iMax, "A"),
							")."
						]
					}) : null,
					mode === "switch" && catalogBeta != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-muted",
						children: [
							"hFE de catálogo desta peça: ",
							formatNum(catalogBeta, 0),
							". No interruptor o valor forçado é o que conta."
						]
					}) : null
				]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: result.error
		})
	] });
}
function ResistorCard({ item }) {
	const e12 = nearestSeries(item.ohms, "E12");
	const e24 = nearestSeries(item.ohms, "E24");
	const hot = item.power > .25;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-bg px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					item.name,
					" · ",
					item.role
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "num mt-1 text-2xl",
				children: formatSi(item.ohms, "Ω")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"E12 ",
					formatSi(e12, "Ω"),
					" · E24 ",
					formatSi(e24, "Ω"),
					" · ",
					formatSi(item.power, "W")
				]
			}),
			hot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-danger",
				children: item.power > .5 ? "Precisa de 1 W ou mais." : "Acima de ¼ W: usa ½ W."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NearestResistor, {
				target: e12,
				power: item.power
			})
		]
	});
}
function NearestResistor({ target, power }) {
	const parts = useBench((state) => state.parts);
	const category = useBench((state) => state.categories).find((item) => item.id === "resistors");
	const { close, nearest } = matchStock(parts, "resistors", "resistance", target);
	const row = close[0] ?? nearest;
	if (!row || row.errPct > 25) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm text-muted",
		children: "Nada no stock a menos de 25%."
	});
	const rating = powerOf(row.part);
	const over = rating != null && power > rating;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: cn("mt-2 text-sm", over ? "text-danger" : "text-muted"),
		children: [
			"Stock ",
			formatSi(row.value, "Ω"),
			" · ",
			formatNum(row.errPct, 1),
			"% · ",
			partHeadline(row.part, category).meta,
			over ? " — a potência não chega." : ""
		]
	});
}
function BiasSchematic({ polarity, mode }) {
	const npn = polarity === "npn";
	const label = mode === "switch" ? npn ? "NPN como interruptor, carga em cima" : "PNP como interruptor, carga em baixo" : npn ? "NPN com divisor e Re" : "PNP com divisor e Re";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 200",
		className: "h-auto w-full font-sans text-ink",
		role: "img",
		"aria-label": label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: label }), mode === "bias" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BiasDrawing, { npn }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchDrawing, { npn })]
	});
}
function wire(d) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d,
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.5",
		strokeLinejoin: "round",
		strokeLinecap: "round"
	});
}
function resistorBox(x, y, w, h) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x,
		y,
		width: w,
		height: h,
		rx: "2",
		className: "fill-surface",
		stroke: "currentColor",
		strokeWidth: "1.5"
	});
}
function BiasDrawing({ npn }) {
	const label = npn ? "NPN" : "PNP";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "8",
			y: "16",
			className: "fill-accent text-[12px] font-medium",
			children: "Vcc"
		}),
		wire("M24 20 H300"),
		wire("M36 184 H300"),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "8",
			y: "188",
			className: "fill-current text-[11px]",
			children: "massa"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "168",
			cy: "102",
			r: "36",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 78 V126",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "250",
			y: "106",
			className: "fill-accent text-[12px] font-medium",
			children: label
		}),
		wire("M64 20 V34"),
		resistorBox(52, 34, 24, 32),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "28",
			y: "54",
			className: "fill-current text-[12px]",
			children: "R1"
		}),
		wire("M64 66 V102"),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "64",
			cy: "102",
			r: "2.5",
			className: "fill-ink"
		}),
		wire("M64 102 H150"),
		wire("M64 102 V118"),
		resistorBox(52, 118, 24, 32),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "28",
			y: "138",
			className: "fill-current text-[12px]",
			children: "R2"
		}),
		wire("M64 150 V184"),
		npn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			wire("M214 20 V36"),
			resistorBox(202, 36, 24, 30),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "232",
				y: "56",
				className: "fill-current text-[12px]",
				children: "Rc"
			}),
			wire("M214 66 V70"),
			wire("M150 90 L214 70"),
			wire("M150 114 L214 154"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "214,154 198,146 206,140",
				className: "fill-ink"
			}),
			wire("M214 154 V160"),
			resistorBox(202, 160, 24, 24),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "232",
				y: "176",
				className: "fill-current text-[12px]",
				children: "Re"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			wire("M214 20 V32"),
			resistorBox(202, 32, 24, 28),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "232",
				y: "50",
				className: "fill-current text-[12px]",
				children: "Re"
			}),
			wire("M214 60 V66"),
			wire("M150 90 L214 66"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "158,88 174,80 166,74",
				className: "fill-ink"
			}),
			wire("M150 114 L214 150"),
			wire("M214 150 V158"),
			resistorBox(202, 158, 24, 26),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "232",
				y: "176",
				className: "fill-current text-[12px]",
				children: "Rc"
			})
		] })
	] });
}
function SwitchDrawing({ npn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "8",
			y: "16",
			className: "fill-accent text-[12px] font-medium",
			children: "Vcc"
		}),
		wire("M24 20 H260"),
		wire("M36 184 H260"),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "8",
			y: "188",
			className: "fill-current text-[11px]",
			children: "massa"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "168",
			cy: "104",
			r: "36",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 80 V128",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "214",
			y: "108",
			className: "fill-accent text-[12px] font-medium",
			children: npn ? "NPN" : "PNP"
		}),
		wire("M24 104 H52"),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "8",
			y: "98",
			className: "fill-current text-[11px]",
			children: "cmd"
		}),
		resistorBox(52, 92, 42, 24),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "64",
			y: "108",
			className: "fill-current text-[12px]",
			children: "Rb"
		}),
		wire("M94 104 H150"),
		npn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			wire("M214 20 V34"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "186",
				y: "34",
				width: "56",
				height: "26",
				rx: "2",
				fill: "none",
				stroke: "currentColor",
				strokeDasharray: "3 3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "198",
				y: "51",
				className: "fill-current text-[11px]",
				children: "carga"
			}),
			wire("M214 60 V72"),
			wire("M150 90 L214 72"),
			wire("M150 116 L214 158"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "214,158 198,150 206,144",
				className: "fill-ink"
			}),
			wire("M214 158 V184")
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			wire("M214 20 V48"),
			wire("M150 92 L214 48"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "158,88 174,78 166,72",
				className: "fill-ink"
			}),
			wire("M150 116 L214 146"),
			wire("M214 146 V154"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "186",
				y: "154",
				width: "56",
				height: "22",
				rx: "2",
				fill: "none",
				stroke: "currentColor",
				strokeDasharray: "3 3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "198",
				y: "169",
				className: "fill-current text-[11px]",
				children: "carga"
			}),
			wire("M214 176 V184")
		] })
	] });
}
function NetPanel() {
	const [kind, setKind] = (0, import_react.useState)("R");
	const [mode, setMode] = (0, import_react.useState)("series");
	const [rows, setRows] = (0, import_react.useState)([{
		id: "a",
		text: ""
	}, {
		id: "b",
		text: ""
	}]);
	const stock = kind === "R" ? {
		categoryId: "resistors",
		fieldKey: "resistance"
	} : kind === "C" ? {
		categoryId: "capacitors",
		fieldKey: "capacitance"
	} : {
		categoryId: "inductors",
		fieldKey: "inductance"
	};
	const unit = kind === "R" ? "Ω" : kind === "C" ? "F" : "H";
	const result = equivalent(rows.map((row) => parseEngineering(row.text)).filter((value) => value != null), mode, kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [
				["R", "Resistências"],
				["C", "Capacitores"],
				["L", "Indutores"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setKind(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", kind === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated", id === "L" ? "col-span-2" : ""),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [["series", "Série"], ["parallel", "Paralelo"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setMode(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated"),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-3",
			children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-[1fr_auto]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValueField, {
					label: index === 0 ? "Valores" : "",
					value: row.text,
					placeholder: kind === "C" ? "100n" : kind === "L" ? "10µ" : "10k",
					stock,
					onChange: (value) => setRows((current) => current.map((item) => item.id === row.id ? {
						...item,
						text: value
					} : item))
				}), rows.length > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "sm:mt-7",
					onClick: () => setRows((current) => current.filter((item) => item.id !== row.id)),
					children: "Tirar"
				}) : null]
			}, row.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			onClick: () => setRows((current) => [...current, {
				id: crypto.randomUUID(),
				text: ""
			}]),
			children: "Adicionar valor"
		}),
		result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: result.formula
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
			label: "Equivalente",
			value: formatSi(result.value, unit)
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: result.error
		})
	] });
}
function ResistorGraphic({ ids }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-6 bg-ink" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "resistor-body flex h-12 w-52 items-center justify-evenly rounded-full",
				children: ids.map((id, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("band", `band-${id}`) }, `${id}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-6 bg-ink" })
		]
	});
}
function BandsPanel() {
	const [mode, setMode] = (0, import_react.useState)("read");
	const [count, setCount] = (0, import_react.useState)(4);
	const [digits, setDigits] = (0, import_react.useState)([
		"brown",
		"black",
		"red"
	]);
	const [mult, setMult] = (0, import_react.useState)("red");
	const [tol, setTol] = (0, import_react.useState)("gold");
	const [text, setText] = (0, import_react.useState)("1k");
	const [tolValue, setTolValue] = (0, import_react.useState)("5");
	const readIds = (0, import_react.useMemo)(() => {
		return [
			...count === 4 ? digits.slice(0, 2) : digits.slice(0, 3),
			mult,
			tol
		];
	}, [
		count,
		digits,
		mult,
		tol
	]);
	const encoded = (0, import_react.useMemo)(() => {
		const ohms = parseEngineering(text);
		if (ohms == null) return null;
		const result = encodeResistor(ohms, count);
		if (!result.ok) return result;
		const tolId = toleranceBand(Number(tolValue));
		return {
			...result,
			tolId
		};
	}, [
		text,
		count,
		tolValue
	]);
	const writeIds = encoded && "digits" in encoded ? [
		...encoded.digits,
		encoded.multiplier,
		...encoded.tolId ? [encoded.tolId] : []
	] : null;
	const shown = mode === "read" ? readIds : writeIds ?? [];
	const decoded = mode === "read" ? decodeBands(readIds) : null;
	const writeOhms = encoded && "nominal" in encoded ? encoded.nominal : null;
	const target = mode === "read" ? decoded?.ok ? decoded.ohms : null : writeOhms;
	function setDigit(index, id) {
		setDigits((current) => {
			const next = current.slice();
			next[index] = id;
			return next;
		});
	}
	const digitBands = BANDS.filter((band) => band.digit != null);
	const multBands = BANDS.filter((band) => band.exp != null);
	const tolBands = BANDS.filter((band) => band.tol != null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [["read", "Ler"], ["write", "Codificar"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setMode(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated"),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [[4, "4 bandas"], [5, "5 bandas"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setCount(id),
				className: cn("press h-11 rounded-sm border text-sm font-medium", count === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated"),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResistorGraphic, { ids: shown }),
		mode === "write" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Valor",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: text,
					placeholder: "4k7",
					inputMode: "decimal",
					onChange: (event) => setText(event.target.value)
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Tolerância",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					value: tolValue,
					onChange: (event) => setTolValue(event.target.value),
					children: [
						"0.1",
						"0.25",
						"0.5",
						"1",
						"2",
						"5",
						"10",
						"20"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value,
						children: [value.replace(".", ","), " %"]
					}, value))
				})
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: [
				Array.from({ length: count === 4 ? 2 : 3 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `Dígito ${index + 1}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: digits[index] ?? "black",
						onChange: (event) => setDigit(index, event.target.value),
						children: digitBands.map((band) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: band.id,
							children: band.name
						}, band.id))
					})
				}, index)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Multiplicador",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: mult,
						onChange: (event) => setMult(event.target.value),
						children: multBands.map((band) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: band.id,
							children: band.name
						}, band.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tolerância",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: tol,
						onChange: (event) => setTol(event.target.value),
						children: tolBands.map((band) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: band.id,
							children: [band.name, band.tol != null ? ` · ${String(band.tol).replace(".", ",")} %` : ""]
						}, band.id))
					})
				})
			]
		}),
		mode === "write" && encoded && "error" in encoded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: encoded.error
		}) : null,
		mode === "write" && encoded == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Escreve um valor, por exemplo 4k7."
		}) : null,
		mode === "write" && writeOhms != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Resistência",
				value: formatSi(writeOhms, "Ω"),
				detail: `± ${tolValue.replace(".", ",")} %`
			}),
			tolValue === "20" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "20% muitas vezes não leva banda de tolerância."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: shown.map((id) => bandById(id)?.name ?? id).join(" · ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockHits, {
				categoryId: "resistors",
				fieldKey: "resistance",
				target: writeOhms,
				unit: "Ω"
			})
		] }) : null,
		mode === "read" && decoded?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Resistência",
				value: formatSi(decoded.ohms, "Ω"),
				detail: decoded.tolerance != null ? `± ${String(decoded.tolerance).replace(".", ",")} %` : "Sem banda de tolerância"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: shown.map((id) => bandById(id)?.name ?? id).join(" · ")
			}),
			target != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockHits, {
				categoryId: "resistors",
				fieldKey: "resistance",
				target,
				unit: "Ω"
			}) : null
		] }) : null,
		mode === "read" && decoded && !decoded.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: decoded.error
		}) : null
	] });
}
var UNITS = [
	"Ω",
	"F",
	"H",
	"V",
	"A",
	"W",
	"Hz",
	"%"
];
function emptyField() {
	return {
		key: "",
		label: "",
		kind: "si",
		unit: "Ω",
		options: ""
	};
}
function CategoryView({ onOpenCategory }) {
	const categories = useBench((state) => state.categories);
	const parts = useBench((state) => state.parts);
	const removeCategory = useBench((state) => state.removeCategory);
	const resetDemo = useBench((state) => state.resetDemo);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted",
					children: "Cada categoria traz os campos que interessam nessa peça. As de origem ficam; podes criar outras."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setEditing("new"),
					children: "Nova categoria"
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: categories.map((category) => {
					const count = parts.filter((part) => part.categoryId === category.id).length;
					const units = parts.filter((part) => part.categoryId === category.id).reduce((sum, part) => sum + part.qty, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line bg-surface p-4 shadow-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-sm border border-line bg-elevated font-mono text-sm text-muted",
								children: category.short
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-base font-medium",
										children: category.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num",
												children: count
											}),
											" referências · ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num",
												children: units
											}),
											" unidades"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm break-words text-muted",
										children: category.fields.map((field) => field.label).join(" · ")
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => onOpenCategory(category.id),
								children: "Ver peças"
							}), !category.builtin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setEditing(category),
								children: "Editar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: () => {
									const result = removeCategory(category.id);
									setMessage(result.ok ? "" : result.error);
								},
								children: "Eliminar"
							})] }) : null]
						})]
					}, category.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setConfirmReset(true),
					children: "Repor exemplo"
				})
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryDrawer, {
				initial: editing === "new" ? null : editing,
				onClose: () => setEditing(null)
			}) : null,
			confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
				title: "Repor o exemplo",
				description: "Substitui categorias e peças guardadas neste browser.",
				onClose: () => setConfirmReset(false),
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "ml-auto",
					onClick: () => setConfirmReset(false),
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					onClick: () => {
						resetDemo();
						setConfirmReset(false);
						setMessage("");
					},
					children: "Repor"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Exporta uma cópia antes se quiseres ficar com o inventário atual."
				})
			}) : null
		]
	});
}
function CategoryDrawer({ initial, onClose }) {
	const addCategory = useBench((state) => state.addCategory);
	const updateCategory = useBench((state) => state.updateCategory);
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [fields, setFields] = (0, import_react.useState)(initial ? initial.fields.map((field) => ({
		key: field.key,
		label: field.label,
		kind: field.kind,
		unit: field.unit ?? "Ω",
		options: field.options?.join(", ") ?? ""
	})) : [emptyField()]);
	const [error, setError] = (0, import_react.useState)("");
	function save() {
		const trimmed = name.trim();
		if (!trimmed) {
			setError("A categoria precisa de um nome.");
			return;
		}
		const used = new Set(fields.map((field) => field.key).filter(Boolean));
		const nextFields = [];
		for (const field of fields) {
			const label = field.label.trim();
			if (!label) continue;
			const key = field.key || slugKey(label, used);
			if (!field.key) used.add(key);
			const def = {
				key,
				label,
				kind: field.kind
			};
			if (field.kind === "si" || field.kind === "number") def.unit = field.unit || void 0;
			if (field.kind === "select") {
				def.options = field.options.split(",").map((option) => option.trim()).filter(Boolean);
				if (!def.options.length) {
					setError(`A lista «${label}» precisa de opções separadas por vírgulas.`);
					return;
				}
			}
			nextFields.push(def);
		}
		if (nextFields.length === 0) {
			setError("Acrescenta pelo menos um campo.");
			return;
		}
		if (initial) updateCategory(initial.id, {
			name: trimmed,
			short: trimmed.slice(0, 1).toUpperCase(),
			fields: nextFields
		});
		else addCategory({
			id: `c_${crypto.randomUUID().slice(0, 8)}`,
			name: trimmed,
			short: trimmed.slice(0, 1).toUpperCase(),
			builtin: false,
			fields: nextFields
		});
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
		title: initial ? "Editar categoria" : "Nova categoria",
		description: "Texto, número, grandeza ou uma lista.",
		onClose,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			className: "ml-auto",
			onClick: onClose,
			children: "Cancelar"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: save,
			children: "Guardar"
		})] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nome",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						placeholder: "Conectores",
						onChange: (event) => setName(event.target.value)
					})
				}),
				fields.map((field, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 rounded-lg border border-line bg-bg p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Campo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: field.label,
								placeholder: "Passo",
								onChange: (event) => setFields((current) => current.map((item, i) => i === index ? {
									...item,
									label: event.target.value
								} : item))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tipo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: field.kind,
									onChange: (event) => setFields((current) => current.map((item, i) => i === index ? {
										...item,
										kind: event.target.value
									} : item)),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "si",
											children: "Grandeza"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "number",
											children: "Número"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "text",
											children: "Texto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "select",
											children: "Lista"
										})
									]
								})
							}), field.kind === "si" || field.kind === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Unidade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: field.unit,
									onChange: (event) => setFields((current) => current.map((item, i) => i === index ? {
										...item,
										unit: event.target.value
									} : item)),
									children: UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: unit,
										children: unit
									}, unit))
								})
							}) : null]
						}),
						field.kind === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Opções",
							hint: "Separadas por vírgulas.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: field.options,
								placeholder: "SPDT, DPDT",
								onChange: (event) => setFields((current) => current.map((item, i) => i === index ? {
									...item,
									options: event.target.value
								} : item))
							})
						}) : null,
						fields.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setFields((current) => current.filter((_, i) => i !== index)),
							children: "Tirar campo"
						}) : null
					]
				}, field.key || index)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setFields((current) => [...current, emptyField()]),
					children: "Adicionar campo"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null
			]
		})
	});
}
function InventoryView({ filter, setFilter, onCreate, onEdit }) {
	const categories = useBench((state) => state.categories);
	const parts = useBench((state) => state.parts);
	const adjustQty = useBench((state) => state.adjustQty);
	const [query, setQuery] = (0, import_react.useState)("");
	const units = parts.reduce((sum, part) => sum + part.qty, 0);
	const lowCount = parts.filter(isLow).length;
	const visible = (0, import_react.useMemo)(() => {
		return parts.filter((part) => {
			if (filter === "low" && !isLow(part)) return false;
			if (filter !== "all" && filter !== "low" && part.categoryId !== filter) return false;
			return matchesQuery(part, categories, query);
		});
	}, [
		parts,
		categories,
		filter,
		query
	]);
	const groups = (0, import_react.useMemo)(() => {
		const order = categories.map((category) => category.id);
		const buckets = /* @__PURE__ */ new Map();
		for (const part of visible) {
			const list = buckets.get(part.categoryId) ?? [];
			list.push(part);
			buckets.set(part.categoryId, list);
		}
		return [...buckets.entries()].sort((a, b) => {
			const ai = order.indexOf(a[0]);
			const bi = order.indexOf(b[0]);
			return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
		}).map(([id, items]) => ({
			id,
			name: categories.find((category) => category.id === id)?.name ?? "Sem categoria",
			items: items.sort((a, b) => {
				const cat = categories.find((c) => c.id === id);
				const field = cat?.fields.find((item) => item.kind === "si");
				const av = field ? parseEngineering(a.props[field.key] || "") : null;
				const bv = field ? parseEngineering(b.props[field.key] || "") : null;
				if (av != null && bv != null && av !== bv) return av - bv;
				return partHeadline(a, cat).title.localeCompare(partHeadline(b, cat).title, "pt");
			})
		}));
	}, [visible, categories]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "pointer-events-none absolute top-3 left-3 size-5 text-subtle",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Valor, referência ou gaveta",
						"aria-label": "Procurar",
						className: "pl-10"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onCreate,
					className: "shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Nova peça"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: filter === "all",
						onClick: () => setFilter("all"),
						children: "Todas"
					}),
					categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: filter === category.id,
						onClick: () => setFilter(category.id),
						children: `${category.short} ${category.name}`
					}, category.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: filter === "low",
						onClick: () => setFilter(filter === "low" ? "all" : "low"),
						children: "Stock baixo"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Referências",
						value: String(parts.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Unidades",
						value: String(units)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setFilter(filter === "low" ? "all" : "low"),
						className: cn("press rounded-lg border px-3 py-3 text-left", filter === "low" ? "border-accent bg-surface" : "border-line bg-surface"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("num block text-lg", lowCount > 0 ? "text-danger" : "text-ink"),
							children: lowCount
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: "Baixas"
						})]
					})
				]
			}),
			parts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { onCreate }) : groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-muted",
				children: "Nenhuma peça corresponde."
			}) : groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-sm font-medium text-muted",
					children: [group.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num",
						children: [" · ", group.items.length]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3",
					children: group.items.map((part) => {
						const category = categories.find((item) => item.id === part.categoryId);
						const headline = partHeadline(part, category);
						const low = isLow(part);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col rounded-xl border border-line bg-surface p-4 shadow-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onEdit(part),
								className: "flex items-start gap-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-sm border border-line bg-elevated font-mono text-sm text-muted",
									children: category?.short ?? "?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("text-base font-medium tracking-tight", part.name ? "" : "num"),
												children: headline.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num text-base",
												children: part.qty
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-sm break-words text-muted",
											children: headline.meta
										}),
										low ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-2 inline-flex",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: part.qty <= 0 ? "Esgotado" : "Baixo" })
										}) : null
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										size: "icon",
										"aria-label": `Diminuir ${headline.title}`,
										onClick: () => adjustQty(part.id, -1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
											className: "size-4",
											"aria-hidden": "true"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										size: "icon",
										"aria-label": `Aumentar ${headline.title}`,
										onClick: () => adjustQty(part.id, 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
											className: "size-4",
											"aria-hidden": "true"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										className: "ml-auto",
										onClick: () => onEdit(part),
										children: "Editar"
									})
								]
							})]
						}, part.id);
					})
				})]
			}, group.id))
		]
	});
}
function FilterChip({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("press h-11 shrink-0 rounded-full border px-4 text-sm font-medium", active ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-ink"),
		children
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-surface px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "num block text-lg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted",
			children: label
		})]
	});
}
function Empty({ onCreate }) {
	const resetDemo = useBench((state) => state.resetDemo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-surface px-4 py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-medium",
				children: "A bancada está vazia"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-sm text-sm text-muted",
				children: "Acrescenta a primeira peça ou repõe um inventário de exemplo para experimentar as contas."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCreate,
					children: "Nova peça"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: resetDemo,
					children: "Repor exemplo"
				})]
			})
		]
	});
}
function blankPart(categoryId) {
	return {
		id: crypto.randomUUID(),
		categoryId,
		name: "",
		mpn: "",
		qty: 1,
		minQty: 0,
		location: "",
		notes: "",
		props: {},
		updatedAt: Date.now()
	};
}
function decorate(part) {
	const category = useBench.getState().categories.find((item) => item.id === part.categoryId);
	if (!category) return part;
	const props = { ...part.props };
	for (const field of category.fields) if (props[field.key]) props[field.key] = toInput(props[field.key], field);
	return {
		...part,
		props
	};
}
function toInput(value, field) {
	if (!value) return "";
	if (field.kind === "si") return parseEngineering(value) == null ? value : formatProp(value, field);
	if (field.kind === "number") return value.replace(".", ",");
	return value;
}
function fromInput(value, field) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (field.kind === "si") {
		const parsed = parseEngineering(trimmed);
		return parsed == null ? trimmed : String(parsed);
	}
	if (field.kind === "number") {
		const parsed = Number(trimmed.replace(",", "."));
		return Number.isFinite(parsed) ? String(parsed) : trimmed;
	}
	return trimmed;
}
function PartDrawer({ initial, mode, onClose }) {
	const categories = useBench((state) => state.categories);
	const parts = useBench((state) => state.parts);
	const addPart = useBench((state) => state.addPart);
	const updatePart = useBench((state) => state.updatePart);
	const removePart = useBench((state) => state.removePart);
	const [part, setPart] = (0, import_react.useState)(() => decorate(initial));
	const [error, setError] = (0, import_react.useState)("");
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const category = categories.find((item) => item.id === part.categoryId) ?? categories[0];
	const locations = (0, import_react.useMemo)(() => [...new Set(parts.map((item) => item.location).filter(Boolean))].sort(), [parts]);
	function setProp(key, value) {
		setPart((current) => ({
			...current,
			props: {
				...current.props,
				[key]: value
			}
		}));
	}
	function changeCategory(categoryId) {
		const next = categories.find((item) => item.id === categoryId);
		setPart((current) => {
			const props = {};
			for (const field of next?.fields ?? []) if (current.props[field.key]) props[field.key] = current.props[field.key];
			return {
				...current,
				categoryId,
				props
			};
		});
	}
	function save() {
		if (!category) return;
		const qty = Math.round(Number(part.qty));
		const minQty = Math.round(Number(part.minQty));
		if (!Number.isFinite(qty) || qty < 0) {
			setError("A quantidade tem de ser zero ou mais.");
			return;
		}
		const props = {};
		for (const field of category.fields) {
			const stored = fromInput(part.props[field.key] ?? "", field);
			if (stored) props[field.key] = stored;
		}
		if (!(part.name.trim() || part.mpn.trim() || Object.keys(props).length > 0)) {
			setError("Indica um valor, um nome ou uma referência.");
			return;
		}
		const next = {
			...part,
			name: part.name.trim(),
			mpn: part.mpn.trim(),
			location: part.location.trim(),
			notes: part.notes.trim(),
			qty,
			minQty: Number.isFinite(minQty) ? Math.max(0, minQty) : 0,
			props,
			updatedAt: Date.now()
		};
		if (mode === "new") addPart(next);
		else updatePart(next);
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
		title: mode === "new" ? "Nova peça" : "Editar peça",
		description: "Valores como 4k7, 100n, 10µ ou 250m.",
		onClose,
		footer: confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "self-center text-sm text-muted",
				children: "Eliminar esta peça?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "ml-auto",
				onClick: () => setConfirmDelete(false),
				children: "Não"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				onClick: () => {
					removePart(part.id);
					onClose();
				},
				children: "Eliminar"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			mode === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				onClick: () => setConfirmDelete(true),
				children: "Eliminar"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "ml-auto",
				onClick: onClose,
				children: "Cancelar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Guardar"
			})
		] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-4",
			onSubmit: (event) => {
				event.preventDefault();
				save();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Categoria",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: part.categoryId,
						onChange: (event) => changeCategory(event.target.value),
						children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.name
						}, item.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nome",
					hint: "Opcional. Se ficar vazio, o valor principal serve de nome.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: part.name,
						onChange: (event) => setPart({
							...part,
							name: event.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Referência",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: part.mpn,
						placeholder: "BC547B",
						onChange: (event) => setPart({
							...part,
							mpn: event.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Quantidade",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							value: String(part.qty),
							onChange: (event) => setPart({
								...part,
								qty: Number(event.target.value.replace(",", ".")) || 0
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Mínimo",
						hint: "Avisa quando chega a este número. 0 desliga.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							value: String(part.minQty),
							onChange: (event) => setPart({
								...part,
								minQty: Number(event.target.value.replace(",", ".")) || 0
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "Localização",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						list: "locations",
						value: part.location,
						placeholder: "Gaveta A3",
						onChange: (event) => setPart({
							...part,
							location: event.target.value
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: "locations",
						children: locations.map((location) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: location }, location))
					})]
				}),
				category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropsFields, {
					category,
					props: part.props,
					onChange: setProp
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notas",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: part.notes,
						onChange: (event) => setPart({
							...part,
							notes: event.target.value
						})
					})
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null
			]
		})
	});
}
function PropsFields({ category, props, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: category.fields.map((field) => {
			const value = props[field.key] ?? "";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: field.unit && field.kind !== "select" ? `${field.label} (${field.unit})` : field.label,
				children: field.kind === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value,
					onChange: (event) => onChange(field.key, event.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}),
						field.options?.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: option,
							children: field.key === "tolerance" ? `${option.replace(".", ",")} %` : option
						}, option)),
						value && !field.options?.includes(value) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value,
							children: value
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value,
					placeholder: field.placeholder,
					inputMode: field.kind === "text" ? "text" : "decimal",
					onChange: (event) => onChange(field.key, event.target.value)
				})
			}, field.key);
		})
	});
}
var NAV = [
	{
		id: "inventory",
		label: "Inventário",
		icon: Boxes
	},
	{
		id: "calc",
		label: "Calcular",
		icon: Calculator
	},
	{
		id: "categories",
		label: "Categorias",
		icon: Layers
	}
];
function App() {
	const [view, setView] = (0, import_react.useState)("inventory");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	const importData = useBench((state) => state.importData);
	(0, import_react.useEffect)(() => {
		Promise.resolve(useBench.persist.rehydrate());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(""), 4e3);
		return () => window.clearTimeout(timer);
	}, [notice]);
	function exportFile() {
		const { categories, parts } = useBench.getState();
		const blob = new Blob([JSON.stringify({
			app: "bancada",
			version: 1,
			categories,
			parts
		}, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "bancada.json";
		link.click();
		URL.revokeObjectURL(url);
		setNotice("Cópia descarregada.");
	}
	async function onImport(file) {
		try {
			const data = JSON.parse(await file.text());
			const result = importData(data);
			setNotice(result.ok ? `${result.count} peças importadas.` : result.error);
		} catch {
			setNotice("Não consegui ler esse ficheiro.");
		}
	}
	function openNew() {
		const categories = useBench.getState().categories;
		const categoryId = categories.some((category) => category.id === filter) ? filter : categories[0]?.id ?? "resistors";
		setDraft({
			part: blankPart(categoryId),
			mode: "new"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink md:grid md:grid-cols-[14rem_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-dvh flex-col border-r border-line p-4 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-6 flex flex-col gap-1",
						"aria-label": "Secções",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							item,
							active: view === item.id,
							onClick: () => setView(item.id)
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-2 pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: exportFile,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Exportar"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: () => fileRef.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Importar"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
						className: "border-b border-line md:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-4 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Exportar",
									onClick: exportFile,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-4",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Importar",
									onClick: () => fileRef.current?.click(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
										className: "size-4",
										"aria-hidden": "true"
									})
								})]
							})]
						})
					}),
					notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 pt-4 text-sm text-muted",
						role: "status",
						children: notice
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "px-4 py-4 pb-24 md:py-6 md:pb-8",
						children: view === "inventory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryView, {
							filter,
							setFilter,
							onCreate: openNew,
							onEdit: (part) => setDraft({
								part,
								mode: "edit"
							})
						}) : view === "calc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcView, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryView, { onOpenCategory: (id) => {
							setFilter(id);
							setView("inventory");
						} })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-surface md:hidden",
				"aria-label": "Secções",
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setView(item.id),
					className: cn("flex h-14 flex-col items-center justify-center gap-1 text-sm", view === item.id ? "text-ink" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
						className: "size-4",
						"aria-hidden": "true"
					}), item.label]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "application/json,.json",
				className: "hidden",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) onImport(file);
				}
			}),
			draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartDrawer, {
				initial: draft.part,
				mode: draft.mode,
				onClose: () => setDraft(null)
			}) : null
		]
	});
}
function Brand() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 32 16",
			className: "h-4 w-8 shrink-0 text-accent",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M1 8h6l2-5 4 10 4-10 2 5h6",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinejoin: "round",
				strokeLinecap: "round"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-medium tracking-tight",
			children: "Bancada"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-muted",
		children: "Componentes discretos"
	})] });
}
function NavButton({ item, active, onClick }) {
	const Icon = item.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("press flex h-11 items-center gap-2 rounded-sm px-3 text-left text-sm font-medium", active ? "bg-surface text-ink shadow-panel" : "text-muted hover:text-ink"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4",
			"aria-hidden": "true"
		}), item.label]
	});
}
var SplitComponent = App;
//#endregion
export { SplitComponent as component };
