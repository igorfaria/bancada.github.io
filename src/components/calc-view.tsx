import { useMemo, useState, type ReactNode } from "react";
import {
  BANDS,
  bandById,
  biasDivider,
  biasSwitch,
  decodeBands,
  encodeResistor,
  equivalent,
  lcResonance,
  ledResistor,
  nearestSeries,
  parseBeta,
  rcFilter,
  solveOhm,
  toleranceBand,
  voltageDivider,
  type BiasResistor,
  type BjtPolarity,
} from "@/lib/calc";
import { formatSi, formatNum, parseEngineering } from "@/lib/si";
import { formatProp, powerOf } from "@/lib/parts";
import { suggestWattage } from "@/lib/propose";
import { useBench } from "@/lib/store";
import type { Part } from "@/lib/types";
import { Button, Field, Input, Select } from "@/components/ui";
import { DividerPlan, StockPlan } from "@/components/stock-plan";
import { blankPart, PartDrawer } from "@/components/part-drawer";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "ohm", name: "Lei de Ohm", blurb: "Tensão, corrente, resistência e potência" },
  { id: "divider", name: "Divisor", blurb: "Duas resistências entre a fonte e a massa" },
  { id: "rc", name: "Filtro RC", blurb: "Frequência de corte e constante de tempo" },
  { id: "lc", name: "Ressonância LC", blurb: "Frequência de um circuito LC" },
  { id: "led", name: "LED", blurb: "Resistência série e o que há na gaveta" },
  { id: "bjt", name: "Transistor", blurb: "Polarização e resistor de base, NPN ou PNP" },
  { id: "net", name: "Série / paralelo", blurb: "Equivalente de R, C ou L" },
  { id: "bands", name: "Código de cores", blurb: "Ler ou gerar as bandas" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function CalcView() {
  const [tool, setTool] = useState<ToolId>("ohm");
  const current = TOOLS.find((item) => item.id === tool) ?? TOOLS[0];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={cn(
              "press h-11 shrink-0 rounded-full border px-4 text-sm font-medium",
              tool === item.id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-ink",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">{current.blurb}. Podes escrever 4k7, 100n ou 10µ, ou escolher uma peça.</p>
      {tool === "ohm" ? <OhmPanel /> : null}
      {tool === "divider" ? <DividerPanel /> : null}
      {tool === "rc" ? <RcPanel /> : null}
      {tool === "lc" ? <LcPanel /> : null}
      {tool === "led" ? <LedPanel /> : null}
      {tool === "bjt" ? <TransistorPanel /> : null}
      {tool === "net" ? <NetPanel /> : null}
      {tool === "bands" ? <BandsPanel /> : null}
    </div>
  );
}

function StockSelect({
  categoryId,
  fieldKey,
  onPick,
}: {
  categoryId: string;
  fieldKey: string;
  onPick: (part: Part) => void;
}) {
  const parts = useBench((state) => state.parts);
  const categories = useBench((state) => state.categories);
  const category = categories.find((item) => item.id === categoryId);
  const field = category?.fields.find((item) => item.key === fieldKey);
  const options = parts
    .filter((part) => part.categoryId === categoryId && part.qty > 0 && parseEngineering(part.props[fieldKey] || "") != null)
    .sort((a, b) => (parseEngineering(a.props[fieldKey] || "") ?? 0) - (parseEngineering(b.props[fieldKey] || "") ?? 0));
  if (!field || options.length === 0) return null;
  return (
    <Select
      aria-label={`Escolher ${field.label} do stock`}
      value=""
      onChange={(event) => {
        const part = options.find((item) => item.id === event.target.value);
        if (part) onPick(part);
      }}
    >
      <option value="">Do stock</option>
      {options.map((part) => {
        const value = formatProp(part.props[fieldKey], field);
        const extra = part.props.package || part.props.tech || part.props.kind || part.mpn || part.name;
        return (
          <option key={part.id} value={part.id}>
            {value}
            {extra ? ` · ${extra}` : ""} · {part.qty} un.
            {part.location ? ` · ${part.location}` : ""}
          </option>
        );
      })}
    </Select>
  );
}

function ValueField({
  label,
  value,
  onChange,
  placeholder,
  stock,
}: {
  label: string;
  value: string;
  onChange: (value: string, part: Part | null) => void;
  placeholder?: string;
  stock?: { categoryId: string; fieldKey: string };
}) {
  return (
    <Field label={label}>
      <Input
        value={value}
        placeholder={placeholder}
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value, null)}
      />
      {stock ? (
        <StockSelect
          categoryId={stock.categoryId}
          fieldKey={stock.fieldKey}
          onPick={(part) => onChange(formatProp(part.props[stock.fieldKey], { key: stock.fieldKey, label, kind: "si", unit: unitFrom(stock) }), part)}
        />
      ) : null}
    </Field>
  );
}

function unitFrom(stock: { categoryId: string; fieldKey: string }): string {
  if (stock.fieldKey === "capacitance") return "F";
  if (stock.fieldKey === "inductance") return "H";
  if (stock.fieldKey === "voltage" || stock.fieldKey === "vf" || stock.fieldKey === "coilVoltage") return "V";
  if (stock.fieldKey === "current") return "A";
  if (stock.fieldKey === "frequency") return "Hz";
  return "Ω";
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-1 text-2xl">{value}</p>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
    </div>
  );
}

function PowerNote({ dissipated, part }: { dissipated: number; part: Part | null }) {
  const rating = powerOf(part);
  if (rating == null) return null;
  const over = dissipated > rating;
  return (
    <p className={cn("text-sm", over ? "text-danger" : "text-muted")}>
      {formatSi(dissipated, "W")} na peça de {formatSi(rating, "W")}
      {over ? " — a potência não chega." : "."}
    </p>
  );
}

function StockHits({
  categoryId,
  fieldKey,
  target,
  unit,
  dissipated,
  onUse,
  title,
}: {
  categoryId: string;
  fieldKey: string;
  target: number;
  unit: string;
  dissipated?: number;
  onUse?: (value: string) => void;
  title?: string;
}) {
  const kind = fieldKey === "capacitance" ? "C" : fieldKey === "inductance" ? "L" : "R";
  return (
    <StockPlan
      categoryId={categoryId}
      fieldKey={fieldKey}
      kind={kind}
      target={target}
      unit={unit}
      dissipated={dissipated}
      onUse={onUse}
      title={title}
    />
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-panel">{children}</section>;
}

function OhmPanel() {
  const [v, setV] = useState("");
  const [i, setI] = useState("");
  const [r, setR] = useState("");
  const [rPart, setRPart] = useState<Part | null>(null);
  const result = solveOhm({ v: parseEngineering(v), i: parseEngineering(i), r: parseEngineering(r) });
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <ValueField label="Tensão" value={v} placeholder="5" onChange={(value) => setV(value)} />
        <ValueField label="Corrente" value={i} placeholder="20m" onChange={(value) => setI(value)} />
        <ValueField
          label="Resistência"
          value={r}
          placeholder="10k"
          stock={{ categoryId: "resistors", fieldKey: "resistance" }}
          onChange={(value, part) => {
            setR(value);
            setRPart(part);
          }}
        />
      </div>
      {result == null ? (
        <p className="text-sm text-muted">V = I × R. Preenche dois e o terceiro aparece.</p>
      ) : result.ok ? (
        <>
          <p className="text-sm text-muted">{result.formula}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Tensão" value={formatSi(result.voltage, "V")} />
            <Metric label="Corrente" value={formatSi(result.current, "A")} />
            <Metric label="Resistência" value={formatSi(result.resistance, "Ω")} />
            <Metric label="Potência" value={formatSi(result.power, "W")} />
          </div>
          <PowerNote dissipated={result.power} part={rPart} />
          <AddResistorStock ohms={result.resistance} power={result.power} notes="Valor saído da lei de Ohm." />
          <StockHits categoryId="resistors" fieldKey="resistance" target={result.resistance} unit="Ω" dissipated={result.power} />
        </>
      ) : (
        <p className={cn("text-sm", result.severity === "danger" ? "text-danger" : "text-muted")}>{result.error}</p>
      )}
    </Panel>
  );
}

function DividerPanel() {
  const [vin, setVin] = useState("");
  const [r1, setR1] = useState("");
  const [r2, setR2] = useState("");
  const [p1, setP1] = useState<Part | null>(null);
  const [p2, setP2] = useState<Part | null>(null);
  const V = parseEngineering(vin);
  const R1 = parseEngineering(r1);
  const R2 = parseEngineering(r2);
  const result = V != null && R1 != null && R2 != null ? voltageDivider(V, R1, R2) : null;
  return (
    <Panel>
      <p className="text-sm text-muted">R1 fica entre a entrada e a saída. R2 fica entre a saída e a massa.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <ValueField label="Vin" value={vin} placeholder="12" onChange={(value) => setVin(value)} />
        <ValueField
          label="R1"
          value={r1}
          placeholder="10k"
          stock={{ categoryId: "resistors", fieldKey: "resistance" }}
          onChange={(value, part) => {
            setR1(value);
            setP1(part);
          }}
        />
        <ValueField
          label="R2"
          value={r2}
          placeholder="10k"
          stock={{ categoryId: "resistors", fieldKey: "resistance" }}
          onChange={(value, part) => {
            setR2(value);
            setP2(part);
          }}
        />
      </div>
      {result == null ? (
        <p className="text-sm text-muted">Vout = Vin × R2 / (R1 + R2)</p>
      ) : result.ok ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Vout" value={formatSi(result.vout, "V")} detail={formatNum((result.vout / V!) * 100, 3) + " % de Vin"} />
            <Metric label="Corrente" value={formatSi(result.current, "A")} />
            <Metric label="Potência em R1" value={formatSi(result.p1, "W")} />
            <Metric label="Potência em R2" value={formatSi(result.p2, "W")} />
          </div>
          <PowerNote dissipated={result.p1} part={p1} />
          <PowerNote dissipated={result.p2} part={p2} />
          <StockHits
            categoryId="resistors"
            fieldKey="resistance"
            target={R1!}
            unit="Ω"
            dissipated={result.p1}
            onUse={(value) => {
              setR1(value);
              setP1(null);
            }}
            title="R1 com o stock"
          />
          <StockHits
            categoryId="resistors"
            fieldKey="resistance"
            target={R2!}
            unit="Ω"
            dissipated={result.p2}
            onUse={(value) => {
              setR2(value);
              setP2(null);
            }}
            title="R2 com o stock"
          />
        </>
      ) : (
        <p className="text-sm text-danger">{result.error}</p>
      )}
    </Panel>
  );
}

function RcPanel() {
  const [r, setR] = useState("");
  const [c, setC] = useState("");
  const [f, setF] = useState("");
  const R = parseEngineering(r);
  const C = parseEngineering(c);
  const F = f.trim() ? parseEngineering(f) : null;
  const result = R != null && C != null ? rcFilter(R, C, F) : null;
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <ValueField
          label="Resistência"
          value={r}
          placeholder="10k"
          stock={{ categoryId: "resistors", fieldKey: "resistance" }}
          onChange={(value) => setR(value)}
        />
        <ValueField
          label="Capacidade"
          value={c}
          placeholder="100n"
          stock={{ categoryId: "capacitors", fieldKey: "capacitance" }}
          onChange={(value) => setC(value)}
        />
        <ValueField label="Frequência do sinal" value={f} placeholder="opcional, 1k" onChange={(value) => setF(value)} />
      </div>
      {result == null ? (
        <p className="text-sm text-muted">fc = 1 / (2πRC)</p>
      ) : result.ok ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Metric label="Corte" value={formatSi(result.fc, "Hz")} />
          <Metric label="Tau" value={formatSi(result.tau, "s")} />
          {result.gain != null && result.db != null ? (
            <Metric label="Ganho" value={formatNum(result.gain, 3)} detail={`${formatNum(result.db, 3)} dB`} />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-danger">{result.error}</p>
      )}
      {result?.ok && R != null ? (
        <StockHits categoryId="resistors" fieldKey="resistance" target={R} unit="Ω" onUse={setR} title="Resistência com o stock" />
      ) : null}
      {result?.ok && C != null ? (
        <StockHits categoryId="capacitors" fieldKey="capacitance" target={C} unit="F" onUse={setC} title="Capacitor com o stock" />
      ) : null}
    </Panel>
  );
}

function LcPanel() {
  const [l, setL] = useState("");
  const [c, setC] = useState("");
  const L = parseEngineering(l);
  const C = parseEngineering(c);
  const result = L != null && C != null ? lcResonance(L, C) : null;
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <ValueField
          label="Indutância"
          value={l}
          placeholder="10µ"
          stock={{ categoryId: "inductors", fieldKey: "inductance" }}
          onChange={(value) => setL(value)}
        />
        <ValueField
          label="Capacidade"
          value={c}
          placeholder="100n"
          stock={{ categoryId: "capacitors", fieldKey: "capacitance" }}
          onChange={(value) => setC(value)}
        />
      </div>
      {result == null ? (
        <p className="text-sm text-muted">f = 1 / (2π√LC)</p>
      ) : result.ok ? (
        <Metric label="Ressonância" value={formatSi(result.f, "Hz")} />
      ) : (
        <p className="text-sm text-danger">{result.error}</p>
      )}
      {result?.ok && L != null ? (
        <StockHits categoryId="inductors" fieldKey="inductance" target={L} unit="H" onUse={setL} title="Indutor com o stock" />
      ) : null}
      {result?.ok && C != null ? (
        <StockHits categoryId="capacitors" fieldKey="capacitance" target={C} unit="F" onUse={setC} title="Capacitor com o stock" />
      ) : null}
    </Panel>
  );
}

function LedPanel() {
  const [vs, setVs] = useState("5");
  const [vf, setVf] = useState("");
  const [i, setI] = useState("20m");
  const Vs = parseEngineering(vs);
  const Vf = parseEngineering(vf);
  const I = parseEngineering(i);
  const result = Vs != null && Vf != null && I != null ? ledResistor(Vs, Vf, I) : null;
  const e12 = result?.ok ? nearestSeries(result.resistance, "E12") : null;
  const e24 = result?.ok ? nearestSeries(result.resistance, "E24") : null;
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <ValueField label="Fonte" value={vs} placeholder="5" onChange={(value) => setVs(value)} />
        <ValueField
          label="Vf do LED"
          value={vf}
          placeholder="2"
          stock={{ categoryId: "diodes", fieldKey: "vf" }}
          onChange={(value) => setVf(value)}
        />
        <ValueField label="Corrente" value={i} placeholder="20m" onChange={(value) => setI(value)} />
      </div>
      {result == null ? (
        <p className="text-sm text-muted">R = (Vfonte − Vf) / I</p>
      ) : result.ok ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Resistência" value={formatSi(result.resistance, "Ω")} />
            <Metric label="No resistor" value={formatSi(result.pRes, "W")} />
            <Metric label="No LED" value={formatSi(result.pLed, "W")} />
            <Metric label="E12 / E24" value={e12 != null && e24 != null ? `${formatSi(e12, "Ω")}` : "—"} detail={e24 != null ? `E24 ${formatSi(e24, "Ω")}` : undefined} />
          </div>
          <AddResistorStock ohms={e24 ?? result.resistance} power={result.pRes} notes={`Conta do LED: ${formatSi(result.resistance, "Ω")}.`} />
          <StockHits categoryId="resistors" fieldKey="resistance" target={result.resistance} unit="Ω" dissipated={result.pRes} />
        </>
      ) : (
        <p className="text-sm text-danger">{result.error}</p>
      )}
    </Panel>
  );
}

function optionalNumber(raw: string): number | null | "bad" {
  if (!raw.trim()) return null;
  const value = parseEngineering(raw);
  return value == null ? "bad" : value;
}

function TransistorPanel() {
  const parts = useBench((state) => state.parts);
  const [polarity, setPolarity] = useState<BjtPolarity>("npn");
  const [mode, setMode] = useState<"bias" | "switch">("bias");
  const [vcc, setVcc] = useState("12");
  const [icBias, setIcBias] = useState("2m");
  const [icSwitch, setIcSwitch] = useState("100m");
  const [betaBias, setBetaBias] = useState("100");
  const [betaSwitch, setBetaSwitch] = useState("10");
  const [vbe, setVbe] = useState("0,7");
  const [ve, setVe] = useState("");
  const [vce, setVce] = useState("");
  const [stiff, setStiff] = useState("10");
  const [drive, setDrive] = useState("");
  const [vsat, setVsat] = useState("0,2");
  const [picked, setPicked] = useState<Part | null>(null);

  const stockBjts = parts
    .filter((part) => part.categoryId === "transistors" && part.qty > 0 && /^(NPN|PNP)$/i.test(part.props.kind || ""))
    .sort((a, b) => (a.props.model || a.name).localeCompare(b.props.model || b.name, "pt"));

  function applyPart(part: Part) {
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
  const typed = [Ve, Vce, Drive].some((value) => value === "bad");

  let result: ReturnType<typeof biasDivider> | null = null;
  if (!typed && Vcc != null && Ic != null && Beta != null && Vbe != null && Ve !== "bad" && Vce !== "bad" && Drive !== "bad") {
    result =
      mode === "bias"
        ? biasDivider({
            polarity,
            vcc: Vcc,
            ic: Ic,
            beta: Beta,
            vbe: Vbe,
            veDrop: Ve,
            vce: Vce,
            stiffness: K ?? Number.NaN,
          })
        : Vsat == null
          ? { ok: false, error: "Indica o Vce de saturação." }
          : biasSwitch({
              polarity,
              vcc: Vcc,
              ic: Ic,
              beta: Beta,
              vbe: Vbe,
              vdrive: Drive,
              vceSat: Vsat,
            });
  }

  const vMax = picked ? parseEngineering(picked.props.voltage || "") : null;
  const iMax = picked ? parseEngineering(picked.props.current || "") : null;
  const catalogBeta = picked ? parseBeta(picked.props.param || "") : null;

  return (
    <Panel>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["bias", "Polarização"],
            ["switch", "Interruptor"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["npn", "NPN"],
            ["pnp", "PNP"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPolarity(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              polarity === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {stockBjts.length > 0 ? (
        <Field label="Do stock" hint={picked ? picked.props.model || picked.name : "NPN e PNP com quantidade"}>
          <Select
            aria-label="Escolher transístor do stock"
            value={picked?.id ?? ""}
            onChange={(event) => {
              const part = stockBjts.find((item) => item.id === event.target.value);
              if (part) applyPart(part);
              else setPicked(null);
            }}
          >
            <option value="">Escolher modelo</option>
            {stockBjts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.props.kind} {part.props.model || part.name}
                {part.props.param ? ` · ${part.props.param}` : ""} · {part.qty} un.
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <BiasSchematic polarity={polarity} mode={mode} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ValueField label="Fonte" value={vcc} placeholder="12" onChange={(value) => setVcc(value)} />
        <ValueField label={mode === "bias" ? "Ic em repouso" : "Corrente da carga"} value={ic} placeholder="2m" onChange={(value) => (mode === "bias" ? setIcBias(value) : setIcSwitch(value))} />
        <ValueField
          label={mode === "bias" ? "hFE mínimo" : "hFE forçado"}
          value={beta}
          placeholder={mode === "bias" ? "100" : "10"}
          onChange={(value) => (mode === "bias" ? setBetaBias(value) : setBetaSwitch(value))}
        />
        <ValueField label="Vbe" value={vbe} placeholder="0,7" onChange={(value) => setVbe(value)} />
        {mode === "bias" ? (
          <>
            <ValueField label="Queda no Re" value={ve} placeholder="10% da fonte" onChange={(value) => setVe(value)} />
            <ValueField label="Vce" value={vce} placeholder="meio da excursão" onChange={(value) => setVce(value)} />
            <ValueField label="Rigidez do divisor" value={stiff} placeholder="10" onChange={(value) => setStiff(value)} />
          </>
        ) : (
          <>
            <ValueField
              label={polarity === "npn" ? "Comando ligado" : "Comando em baixo"}
              value={drive}
              placeholder={polarity === "npn" ? "igual à fonte" : "0"}
              onChange={(value) => setDrive(value)}
            />
            <ValueField label="Vce sat" value={vsat} placeholder="0,2" onChange={(value) => setVsat(value)} />
          </>
        )}
      </div>
      {typed ? (
        <p className="text-sm text-danger">Há um valor que não consigo ler. Experimenta 1,2 ou 4k7.</p>
      ) : result == null ? (
        <p className="text-sm text-muted">
          {mode === "bias"
            ? "Divisor na base, Re a estabilizar o emissor. R1 fica do lado da fonte, R2 do lado da massa."
            : "Um único resistor de base leva o transístor à saturação."}
        </p>
      ) : result.ok ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.resistors.map((item) => (
              <ResistorCard key={item.name} item={item} />
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="Ib" value={formatSi(result.ib, "A")} />
            <Metric label="No transístor" value={formatSi(result.pq, "W")} detail={`Vce ${formatSi(result.vce, "V")}`} />
            {result.av != null ? (
              <Metric label="Ganho |Rc/Re|" value={`${formatNum(Math.abs(result.av), 2)}×`} detail="sem bypass no emissor" />
            ) : (
              <Metric label="Ie" value={formatSi(result.ie, "A")} />
            )}
          </div>
          {mode === "bias" ? (
            <p className="text-sm text-muted">
              Vb {formatSi(result.vb, "V")} · Ve {formatSi(result.ve, "V")} · Vc {formatSi(result.vc, "V")}
            </p>
          ) : null}
          {mode === "bias" && Vcc != null && Vbe != null && Beta != null && K != null ? (
            <DividerPlan
              polarity={polarity}
              vcc={Vcc}
              vbe={Vbe}
              beta={Beta}
              re={result.resistors.find((item) => item.name === "Re")!.ohms}
              rc={result.resistors.find((item) => item.name === "Rc")!.ohms}
              r1={result.resistors.find((item) => item.name === "R1")!.ohms}
              r2={result.resistors.find((item) => item.name === "R2")!.ohms}
              targetIc={result.ic}
              minStiffness={K}
            />
          ) : null}
          <ul className="flex flex-col gap-1">
            {result.notes.map((note) => (
              <li key={note} className="text-sm text-muted">
                {note}
              </li>
            ))}
            {vMax != null && Vcc != null && Vcc > vMax ? (
              <li className="text-sm text-danger">A fonte passa o Vceo desta peça ({formatSi(vMax, "V")}).</li>
            ) : null}
            {iMax != null && Ic != null && Ic > iMax ? (
              <li className="text-sm text-danger">A corrente passa o Ic máximo desta peça ({formatSi(iMax, "A")}).</li>
            ) : null}
            {mode === "switch" && catalogBeta != null ? (
              <li className="text-sm text-muted">hFE de catálogo desta peça: {formatNum(catalogBeta, 0)}. No interruptor o valor forçado é o que conta.</li>
            ) : null}
          </ul>
        </>
      ) : (
        <p className="text-sm text-danger">{result.error}</p>
      )}
    </Panel>
  );
}

function ResistorCard({ item }: { item: BiasResistor }) {
  const e12 = nearestSeries(item.ohms, "E12");
  const e24 = nearestSeries(item.ohms, "E24");
  const hot = item.power > 0.25;
  return (
    <div className="rounded-lg border border-line bg-bg px-4 py-3">
      <p className="text-sm text-muted">
        {item.name} · {item.role}
      </p>
      <p className="num mt-1 text-2xl">{formatSi(item.ohms, "Ω")}</p>
      <p className="mt-1 text-sm text-muted">
        E12 {formatSi(e12, "Ω")} · E24 {formatSi(e24, "Ω")} · {formatSi(item.power, "W")}
      </p>
      {hot ? <p className="mt-1 text-sm text-danger">{item.power > 0.5 ? "Precisa de 1 W ou mais." : "Acima de ¼ W: usa ½ W."}</p> : null}
      <div className="mt-3">
        <StockHits categoryId="resistors" fieldKey="resistance" target={item.ohms} unit="Ω" dissipated={item.power} title={`${item.name} com o stock`} />
      </div>
      <div className="mt-3">
        <AddResistorStock ohms={e24} power={item.power} notes={`${item.name}, conta ${formatSi(item.ohms, "Ω")}.`} />
      </div>
    </div>
  );
}

function BiasSchematic({ polarity, mode }: { polarity: BjtPolarity; mode: "bias" | "switch" }) {
  const npn = polarity === "npn";
  const label = mode === "switch" ? (npn ? "NPN como interruptor, carga em cima" : "PNP como interruptor, carga em baixo") : npn ? "NPN com divisor e Re" : "PNP com divisor e Re";
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full font-sans text-ink" role="img" aria-label={label}>
      <title>{label}</title>
      {mode === "bias" ? <BiasDrawing npn={npn} /> : <SwitchDrawing npn={npn} />}
    </svg>
  );
}

function wire(d: string) {
  return <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />;
}

function resistorBox(x: number, y: number, w: number, h: number) {
  return <rect x={x} y={y} width={w} height={h} rx="2" className="fill-surface" stroke="currentColor" strokeWidth="1.5" />;
}

function BiasDrawing({ npn }: { npn: boolean }) {
  const label = npn ? "NPN" : "PNP";
  return (
    <g>
      <text x="8" y="16" className="fill-accent text-[12px] font-medium">
        Vcc
      </text>
      {wire("M24 20 H300")}
      {wire("M36 184 H300")}
      <text x="8" y="188" className="fill-current text-[11px]">
        massa
      </text>
      <circle cx="168" cy="102" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M150 78 V126" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <text x="250" y="106" className="fill-accent text-[12px] font-medium">
        {label}
      </text>
      {wire("M64 20 V34")}
      {resistorBox(52, 34, 24, 32)}
      <text x="28" y="54" className="fill-current text-[12px]">
        R1
      </text>
      {wire("M64 66 V102")}
      <circle cx="64" cy="102" r="2.5" className="fill-ink" />
      {wire("M64 102 H150")}
      {wire("M64 102 V118")}
      {resistorBox(52, 118, 24, 32)}
      <text x="28" y="138" className="fill-current text-[12px]">
        R2
      </text>
      {wire("M64 150 V184")}
      {npn ? (
        <g>
          {wire("M214 20 V36")}
          {resistorBox(202, 36, 24, 30)}
          <text x="232" y="56" className="fill-current text-[12px]">
            Rc
          </text>
          {wire("M214 66 V70")}
          {wire("M150 90 L214 70")}
          {wire("M150 114 L214 154")}
          <polygon points="214,154 198,146 206,140" className="fill-ink" />
          {wire("M214 154 V160")}
          {resistorBox(202, 160, 24, 24)}
          <text x="232" y="176" className="fill-current text-[12px]">
            Re
          </text>
        </g>
      ) : (
        <g>
          {wire("M214 20 V32")}
          {resistorBox(202, 32, 24, 28)}
          <text x="232" y="50" className="fill-current text-[12px]">
            Re
          </text>
          {wire("M214 60 V66")}
          {wire("M150 90 L214 66")}
          <polygon points="158,88 174,80 166,74" className="fill-ink" />
          {wire("M150 114 L214 150")}
          {wire("M214 150 V158")}
          {resistorBox(202, 158, 24, 26)}
          <text x="232" y="176" className="fill-current text-[12px]">
            Rc
          </text>
        </g>
      )}
    </g>
  );
}

function SwitchDrawing({ npn }: { npn: boolean }) {
  return (
    <g>
      <text x="8" y="16" className="fill-accent text-[12px] font-medium">
        Vcc
      </text>
      {wire("M24 20 H260")}
      {wire("M36 184 H260")}
      <text x="8" y="188" className="fill-current text-[11px]">
        massa
      </text>
      <circle cx="168" cy="104" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M150 80 V128" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <text x="214" y="108" className="fill-accent text-[12px] font-medium">
        {npn ? "NPN" : "PNP"}
      </text>
      {wire("M24 104 H52")}
      <text x="8" y="98" className="fill-current text-[11px]">
        cmd
      </text>
      {resistorBox(52, 92, 42, 24)}
      <text x="64" y="108" className="fill-current text-[12px]">
        Rb
      </text>
      {wire("M94 104 H150")}
      {npn ? (
        <g>
          {wire("M214 20 V34")}
          <rect x="186" y="34" width="56" height="26" rx="2" fill="none" stroke="currentColor" strokeDasharray="3 3" />
          <text x="198" y="51" className="fill-current text-[11px]">
            carga
          </text>
          {wire("M214 60 V72")}
          {wire("M150 90 L214 72")}
          {wire("M150 116 L214 158")}
          <polygon points="214,158 198,150 206,144" className="fill-ink" />
          {wire("M214 158 V184")}
        </g>
      ) : (
        <g>
          {wire("M214 20 V48")}
          {wire("M150 92 L214 48")}
          <polygon points="158,88 174,78 166,72" className="fill-ink" />
          {wire("M150 116 L214 146")}
          {wire("M214 146 V154")}
          <rect x="186" y="154" width="56" height="22" rx="2" fill="none" stroke="currentColor" strokeDasharray="3 3" />
          <text x="198" y="169" className="fill-current text-[11px]">
            carga
          </text>
          {wire("M214 176 V184")}
        </g>
      )}
    </g>
  );
}

function NetPanel() {
  const [kind, setKind] = useState<"R" | "L" | "C">("R");
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [rows, setRows] = useState([
    { id: "a", text: "" },
    { id: "b", text: "" },
  ]);
  const stock = kind === "R" ? { categoryId: "resistors", fieldKey: "resistance" } : kind === "C" ? { categoryId: "capacitors", fieldKey: "capacitance" } : { categoryId: "inductors", fieldKey: "inductance" };
  const unit = kind === "R" ? "Ω" : kind === "C" ? "F" : "H";
  const values = rows.map((row) => parseEngineering(row.text)).filter((value): value is number => value != null);
  const result = equivalent(values, mode, kind);
  return (
    <Panel>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["R", "Resistências"],
            ["C", "Capacitores"],
            ["L", "Indutores"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              kind === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
              id === "L" ? "col-span-2" : "",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["series", "Série"],
            ["parallel", "Paralelo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <ValueField
              label={index === 0 ? "Valores" : ""}
              value={row.text}
              placeholder={kind === "C" ? "100n" : kind === "L" ? "10µ" : "10k"}
              stock={stock}
              onChange={(value) => setRows((current) => current.map((item) => (item.id === row.id ? { ...item, text: value } : item)))}
            />
            {rows.length > 2 ? (
              <Button
                variant="ghost"
                className="sm:mt-7"
                onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
              >
                Tirar
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        onClick={() => setRows((current) => [...current, { id: crypto.randomUUID(), text: "" }])}
      >
        Adicionar valor
      </Button>
      {result.ok ? (
        <>
          <p className="text-sm text-muted">{result.formula}</p>
          <Metric label="Equivalente" value={formatSi(result.value, unit)} />
          {kind === "R" ? <AddResistorStock ohms={result.value} notes="Equivalente série ou paralelo." /> : null}
          <StockHits categoryId={stock.categoryId} fieldKey={stock.fieldKey} target={result.value} unit={unit} />
        </>
      ) : (
        <p className="text-sm text-muted">{result.error}</p>
      )}
    </Panel>
  );
}

function ResistorGraphic({ ids }: { ids: string[] }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      <span className="h-px w-6 bg-ink" />
      <div className="resistor-body flex h-12 w-52 items-center justify-evenly rounded-full">
        {ids.map((id, index) => (
          <span key={`${id}-${index}`} className={cn("band", `band-${id}`)} />
        ))}
      </div>
      <span className="h-px w-6 bg-ink" />
    </div>
  );
}

function BandsPanel() {
  const [mode, setMode] = useState<"read" | "write">("read");
  const [count, setCount] = useState<4 | 5>(4);
  const [digits, setDigits] = useState(["brown", "black", "red"]);
  const [mult, setMult] = useState("red");
  const [tol, setTol] = useState("gold");
  const [text, setText] = useState("1k");
  const [tolValue, setTolValue] = useState("5");

  const readIds = useMemo(() => {
    const used = count === 4 ? digits.slice(0, 2) : digits.slice(0, 3);
    return [...used, mult, tol];
  }, [count, digits, mult, tol]);

  const encoded = useMemo(() => {
    const ohms = parseEngineering(text);
    if (ohms == null) return null;
    const result = encodeResistor(ohms, count);
    if (!result.ok) return result;
    const tolId = toleranceBand(Number(tolValue));
    return { ...result, tolId };
  }, [text, count, tolValue]);

  const writeIds =
    encoded && "digits" in encoded
      ? [...encoded.digits, encoded.multiplier, ...(encoded.tolId ? [encoded.tolId] : [])]
      : null;
  const shown = mode === "read" ? readIds : (writeIds ?? []);
  const decoded = mode === "read" ? decodeBands(readIds) : null;
  const writeOhms = encoded && "nominal" in encoded ? encoded.nominal : null;
  const target = mode === "read" ? (decoded?.ok ? decoded.ohms : null) : writeOhms;

  function setDigit(index: number, id: string) {
    setDigits((current) => {
      const next = current.slice();
      next[index] = id;
      return next;
    });
  }

  const digitBands = BANDS.filter((band) => band.digit != null);
  const multBands = BANDS.filter((band) => band.exp != null);
  const tolBands = BANDS.filter((band) => band.tol != null);

  return (
    <Panel>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["read", "Ler"],
            ["write", "Codificar"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              mode === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            [4, "4 bandas"],
            [5, "5 bandas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCount(id)}
            className={cn(
              "press h-11 rounded-sm border text-sm font-medium",
              count === id ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <ResistorGraphic ids={shown} />
      {mode === "write" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor">
            <Input value={text} placeholder="4k7" inputMode="decimal" onChange={(event) => setText(event.target.value)} />
          </Field>
          <Field label="Tolerância">
            <Select value={tolValue} onChange={(event) => setTolValue(event.target.value)}>
              {["0.1", "0.25", "0.5", "1", "2", "5", "10", "20"].map((value) => (
                <option key={value} value={value}>
                  {value.replace(".", ",")} %
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: count === 4 ? 2 : 3 }, (_, index) => (
            <Field key={index} label={`Dígito ${index + 1}`}>
              <Select value={digits[index] ?? "black"} onChange={(event) => setDigit(index, event.target.value)}>
                {digitBands.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.name}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
          <Field label="Multiplicador">
            <Select value={mult} onChange={(event) => setMult(event.target.value)}>
              {multBands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tolerância">
            <Select value={tol} onChange={(event) => setTol(event.target.value)}>
              {tolBands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.name}
                  {band.tol != null ? ` · ${String(band.tol).replace(".", ",")} %` : ""}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      {mode === "write" && encoded && "error" in encoded ? <p className="text-sm text-danger">{encoded.error}</p> : null}
      {mode === "write" && encoded == null ? <p className="text-sm text-muted">Escreve um valor, por exemplo 4k7.</p> : null}
      {mode === "write" && writeOhms != null ? (
        <>
          <Metric
            label="Resistência"
            value={formatSi(writeOhms, "Ω")}
            detail={`± ${tolValue.replace(".", ",")} %`}
          />
          {tolValue === "20" ? <p className="text-sm text-muted">20% muitas vezes não leva banda de tolerância.</p> : null}
          <p className="text-sm text-muted">{shown.map((id) => bandById(id)?.name ?? id).join(" · ")}</p>
          <AddResistorStock ohms={writeOhms} tolerance={Number(tolValue)} bands={shown} />
          <StockHits categoryId="resistors" fieldKey="resistance" target={writeOhms} unit="Ω" />
        </>
      ) : null}
      {mode === "read" && decoded?.ok ? (
        <>
          <Metric
            label="Resistência"
            value={formatSi(decoded.ohms, "Ω")}
            detail={decoded.tolerance != null ? `± ${String(decoded.tolerance).replace(".", ",")} %` : "Sem banda de tolerância"}
          />
          <p className="text-sm text-muted">{shown.map((id) => bandById(id)?.name ?? id).join(" · ")}</p>
          <AddResistorStock ohms={decoded.ohms} tolerance={decoded.tolerance} bands={shown} />
          {target != null ? <StockHits categoryId="resistors" fieldKey="resistance" target={target} unit="Ω" /> : null}
        </>
      ) : null}
      {mode === "read" && decoded && !decoded.ok ? <p className="text-sm text-danger">{decoded.error}</p> : null}
    </Panel>
  );
}

function AddResistorStock({
  ohms,
  tolerance,
  power,
  notes,
  bands,
}: {
  ohms: number;
  tolerance?: number | null;
  power?: number;
  notes?: string;
  bands?: string[];
}) {
  const [draft, setDraft] = useState<Part | null>(null);
  const [saved, setSaved] = useState(false);
  const label = formatSi(ohms, "Ω");
  const wattage = suggestWattage(power);

  function open() {
    const part = blankPart("resistors");
    const bandNote = bands?.length ? `Código de cores: ${bands.map((id) => bandById(id)?.name ?? id).join(" · ")}` : "";
    part.props = {
      resistance: String(ohms),
      ...(wattage ? { power: wattage } : {}),
      ...(tolerance != null ? { tolerance: String(tolerance) } : {}),
    };
    part.notes = [notes, bandNote].filter(Boolean).join(" ");
    part.qty = 1;
    setDraft(part);
    setSaved(false);
  }

  function close(saved?: boolean) {
    if (saved) setSaved(true);
    setDraft(null);
  }

  return (
    <>
      <Button variant="secondary" onClick={open}>
        Adicionar {label} ao stock
      </Button>
      {saved ? <p className="text-sm text-muted">{label} entrou no inventário.</p> : null}
      {draft ? <PartDrawer key={draft.id} initial={draft} mode="new" onClose={close} /> : null}
    </>
  );
}
