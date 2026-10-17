import type { Category, FieldDef, Part } from "@/lib/types";

const TOL: FieldDef = {
  key: "tolerance",
  label: "Tolerância",
  kind: "select",
  options: ["0.1", "0.5", "1", "2", "5", "10", "20"],
};

export const builtinCategories = (): Category[] => [
  {
    id: "resistors",
    name: "Resistores",
    short: "R",
    builtin: true,
    fields: [
      { key: "resistance", label: "Resistência", kind: "si", unit: "Ω", placeholder: "10k ou 4k7" },
      TOL,
      { key: "power", label: "Potência", kind: "si", unit: "W", placeholder: "0,25" },
      {
        key: "tech",
        label: "Tecnologia",
        kind: "select",
        options: ["Filme de carbono", "Filme metálico", "Óxido metálico", "Wirewound", "Rede"],
      },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["Axial", "0201", "0402", "0603", "0805", "1206", "1210", "2010", "2512"],
      },
    ],
  },
  {
    id: "capacitors",
    name: "Capacitores",
    short: "C",
    builtin: true,
    fields: [
      { key: "capacitance", label: "Capacidade", kind: "si", unit: "F", placeholder: "100n" },
      { key: "voltage", label: "Tensão", kind: "si", unit: "V", placeholder: "50" },
      TOL,
      {
        key: "dielectric",
        label: "Dielétrico",
        kind: "select",
        options: ["C0G/NP0", "X7R", "Y5V", "Eletrolítico", "Tântalo", "Filme", "Poliéster", "Polipropileno"],
      },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["Radial", "Axial", "0402", "0603", "0805", "1206", "Snap-in"],
      },
      { key: "polarized", label: "Polarizado", kind: "select", options: ["Não", "Sim"] },
    ],
  },
  {
    id: "inductors",
    name: "Indutores",
    short: "L",
    builtin: true,
    fields: [
      { key: "inductance", label: "Indutância", kind: "si", unit: "H", placeholder: "10µ" },
      { key: "current", label: "Corrente", kind: "si", unit: "A", placeholder: "1" },
      { key: "dcr", label: "DCR", kind: "si", unit: "Ω", placeholder: "0,1" },
      {
        key: "type",
        label: "Tipo",
        kind: "select",
        options: ["Potência", "RF", "Choque", "Ferrite"],
      },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["Radial", "Axial", "0603", "0805", "1210", "Toroidal"],
      },
    ],
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
        options: ["Sinal", "Retificador", "Schottky", "Zener", "LED", "TVS"],
      },
      { key: "model", label: "Modelo", kind: "text", placeholder: "1N4148" },
      { key: "vf", label: "Vf / Vz", kind: "si", unit: "V", placeholder: "0,7" },
      { key: "current", label: "Corrente", kind: "si", unit: "A", placeholder: "20m" },
      { key: "power", label: "Potência", kind: "si", unit: "W", placeholder: "0,5" },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["DO-35", "DO-41", "SOD-123", "SOD-323", "SMA", "SMB", "LED 3 mm", "LED 5 mm", "LED SMD"],
      },
      { key: "color", label: "Cor", kind: "text", placeholder: "só para LED" },
    ],
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
        options: ["NPN", "PNP", "MOSFET-N", "MOSFET-P", "JFET-N", "JFET-P"],
      },
      { key: "model", label: "Modelo", kind: "text", placeholder: "BC547" },
      { key: "voltage", label: "Vceo / Vds", kind: "si", unit: "V", placeholder: "45" },
      { key: "current", label: "Ic / Id", kind: "si", unit: "A", placeholder: "100m" },
      { key: "param", label: "hFE ou Rds(on)", kind: "text", placeholder: "200 ou 17 mΩ" },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["TO-92", "SOT-23", "SOT-223", "TO-220", "TO-252", "TO-263"],
      },
    ],
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
        options: ["Eletromecânico", "Estado sólido", "Reed"],
      },
      { key: "model", label: "Modelo", kind: "text", placeholder: "SRD-05VDC-SL-C" },
      { key: "coilVoltage", label: "Bobina", kind: "si", unit: "V", placeholder: "5" },
      { key: "coilCurrent", label: "Corrente da bobina", kind: "si", unit: "A", placeholder: "70m" },
      {
        key: "config",
        label: "Contactos",
        kind: "select",
        options: ["SPST-NO", "SPST-NC", "SPDT", "DPST", "DPDT", "4PDT"],
      },
      { key: "contactVoltage", label: "Tensão dos contactos", kind: "si", unit: "V", placeholder: "250" },
      { key: "contactCurrent", label: "Corrente dos contactos", kind: "si", unit: "A", placeholder: "10" },
    ],
  },
  {
    id: "fuses",
    name: "Fusíveis",
    short: "F",
    builtin: true,
    fields: [
      { key: "current", label: "Corrente", kind: "si", unit: "A", placeholder: "1" },
      { key: "voltage", label: "Tensão", kind: "si", unit: "V", placeholder: "250" },
      { key: "speed", label: "Velocidade", kind: "select", options: ["Rápido", "Lento", "Resettable"] },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["5×20 mm", "6,3×32 mm", "SMD 1206", "Blade", "PTC"],
      },
    ],
  },
  {
    id: "crystals",
    name: "Cristais",
    short: "X",
    builtin: true,
    fields: [
      { key: "frequency", label: "Frequência", kind: "si", unit: "Hz", placeholder: "16M" },
      { key: "load", label: "Carga", kind: "number", unit: "pF", placeholder: "18" },
      {
        key: "package",
        label: "Encapsulamento",
        kind: "select",
        options: ["HC-49", "SMD 3225", "SMD 5032", "Cilíndrico"],
      },
    ],
  },
  {
    id: "pots",
    name: "Potenciómetros",
    short: "P",
    builtin: true,
    fields: [
      { key: "resistance", label: "Resistência", kind: "si", unit: "Ω", placeholder: "10k" },
      { key: "taper", label: "Curva", kind: "select", options: ["Linear", "Logarítmico"] },
      { key: "power", label: "Potência", kind: "si", unit: "W", placeholder: "0,1" },
      { key: "kind", label: "Forma", kind: "select", options: ["Trimmer", "Rotativo", "Deslizante", "Multivoltas"] },
    ],
  },
];

const n = (value: number) => String(value);

function part(
  id: string,
  categoryId: string,
  qty: number,
  location: string,
  props: Record<string, string>,
  extra?: Partial<Pick<Part, "name" | "mpn" | "minQty" | "notes">>,
): Part {
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
    updatedAt: 0,
  };
}

export function demoParts(): Part[] {
  return [
    part("demo-r-220", "resistors", 40, "Gaveta A1", {
      resistance: n(220),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-330", "resistors", 30, "Gaveta A1", {
      resistance: n(330),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-1k", "resistors", 50, "Gaveta A2", {
      resistance: n(1000),
      tolerance: "1",
      power: n(0.25),
      tech: "Filme metálico",
      package: "Axial",
    }),
    part("demo-r-2k2", "resistors", 25, "Gaveta A2", {
      resistance: n(2200),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-4k7", "resistors", 40, "Gaveta A2", {
      resistance: n(4700),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-10k", "resistors", 80, "Gaveta A3", {
      resistance: n(10000),
      tolerance: "1",
      power: n(0.25),
      tech: "Filme metálico",
      package: "Axial",
    }, { notes: "Pull-up habitual" }),
    part("demo-r-10k-smd", "resistors", 100, "Gaveta A3", {
      resistance: n(10000),
      tolerance: "5",
      power: n(0.125),
      tech: "Filme metálico",
      package: "0805",
    }),
    part("demo-r-47k", "resistors", 20, "Gaveta A4", {
      resistance: n(47000),
      tolerance: "1",
      power: n(0.25),
      tech: "Filme metálico",
      package: "Axial",
    }),
    part("demo-r-100k", "resistors", 35, "Gaveta A4", {
      resistance: n(100000),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-1m", "resistors", 12, "Gaveta A4", {
      resistance: n(1e6),
      tolerance: "5",
      power: n(0.25),
      tech: "Filme de carbono",
      package: "Axial",
    }),
    part("demo-r-10", "resistors", 6, "Gaveta A5", {
      resistance: n(10),
      tolerance: "5",
      power: n(1),
      tech: "Wirewound",
      package: "Axial",
    }),
    part("demo-c-22p", "capacitors", 20, "Gaveta B1", {
      capacitance: n(22e-12),
      voltage: n(50),
      tolerance: "5",
      dielectric: "C0G/NP0",
      package: "0805",
      polarized: "Não",
    }),
    part("demo-c-100n", "capacitors", 120, "Gaveta B1", {
      capacitance: n(100e-9),
      voltage: n(50),
      tolerance: "10",
      dielectric: "X7R",
      package: "0805",
      polarized: "Não",
    }, { notes: "Desacoplamento" }),
    part("demo-c-1u", "capacitors", 30, "Gaveta B2", {
      capacitance: n(1e-6),
      voltage: n(25),
      tolerance: "10",
      dielectric: "X7R",
      package: "0805",
      polarized: "Não",
    }),
    part("demo-c-10u", "capacitors", 18, "Gaveta B2", {
      capacitance: n(10e-6),
      voltage: n(25),
      tolerance: "20",
      dielectric: "Eletrolítico",
      package: "Radial",
      polarized: "Sim",
    }),
    part("demo-c-100u", "capacitors", 14, "Gaveta B3", {
      capacitance: n(100e-6),
      voltage: n(16),
      tolerance: "20",
      dielectric: "Eletrolítico",
      package: "Radial",
      polarized: "Sim",
    }),
    part("demo-c-470u", "capacitors", 6, "Gaveta B3", {
      capacitance: n(470e-6),
      voltage: n(25),
      tolerance: "20",
      dielectric: "Eletrolítico",
      package: "Radial",
      polarized: "Sim",
    }),
    part("demo-l-10u", "inductors", 8, "Gaveta C1", {
      inductance: n(10e-6),
      current: n(1),
      dcr: n(0.08),
      type: "Potência",
      package: "1210",
    }),
    part("demo-l-100u", "inductors", 6, "Gaveta C1", {
      inductance: n(100e-6),
      current: n(0.2),
      dcr: n(1.2),
      type: "RF",
      package: "Radial",
    }),
    part("demo-l-1m", "inductors", 4, "Gaveta C1", {
      inductance: n(1e-3),
      current: n(0.1),
      dcr: n(8),
      type: "Choque",
      package: "Radial",
    }, { minQty: 5 }),
    part("demo-d-4148", "diodes", 40, "Caixa D1", {
      kind: "Sinal",
      model: "1N4148",
      vf: n(0.7),
      current: n(0.2),
      power: n(0.5),
      package: "DO-35",
      color: "",
    }, { mpn: "1N4148" }),
    part("demo-d-4007", "diodes", 25, "Caixa D1", {
      kind: "Retificador",
      model: "1N4007",
      vf: n(1),
      current: n(1),
      power: n(3),
      package: "DO-41",
      color: "",
    }, { mpn: "1N4007" }),
    part("demo-d-5819", "diodes", 10, "Caixa D2", {
      kind: "Schottky",
      model: "1N5819",
      vf: n(0.4),
      current: n(1),
      power: n(1),
      package: "DO-41",
      color: "",
    }, { mpn: "1N5819" }),
    part("demo-d-zener", "diodes", 8, "Caixa D2", {
      kind: "Zener",
      model: "1N4733",
      vf: n(5.1),
      current: n(0.05),
      power: n(0.5),
      package: "DO-41",
      color: "",
    }, { mpn: "1N4733A" }),
    part("demo-d-led-r", "diodes", 25, "Caixa D3", {
      kind: "LED",
      model: "",
      vf: n(2),
      current: n(0.02),
      power: n(0.06),
      package: "LED 5 mm",
      color: "Vermelho",
    }),
    part("demo-d-led-w", "diodes", 8, "Caixa D3", {
      kind: "LED",
      model: "",
      vf: n(3.2),
      current: n(0.02),
      power: n(0.08),
      package: "LED 5 mm",
      color: "Branco",
    }, { minQty: 10 }),
    part("demo-q-bc547", "transistors", 20, "Caixa E1", {
      kind: "NPN",
      model: "BC547",
      voltage: n(45),
      current: n(0.1),
      param: "hFE 110–800",
      package: "TO-92",
    }, { mpn: "BC547B", notes: "Uso geral. Em muitos sítios substitui o 2N3904." }),
    part("demo-q-bc557", "transistors", 12, "Caixa E1", {
      kind: "PNP",
      model: "BC557",
      voltage: n(45),
      current: n(0.1),
      param: "hFE 110–800",
      package: "TO-92",
    }, { mpn: "BC557B" }),
    part("demo-q-2n7000", "transistors", 15, "Caixa E2", {
      kind: "MOSFET-N",
      model: "2N7000",
      voltage: n(60),
      current: n(0.2),
      param: "Rds(on) 5 Ω",
      package: "TO-92",
    }, { mpn: "2N7000" }),
    part("demo-q-irfz", "transistors", 2, "Caixa E2", {
      kind: "MOSFET-N",
      model: "IRFZ44N",
      voltage: n(55),
      current: n(49),
      param: "Rds(on) 17,5 mΩ",
      package: "TO-220",
    }, { mpn: "IRFZ44N", minQty: 4 }),
    part("demo-k-srd", "relays", 3, "Caixa F1", {
      kind: "Eletromecânico",
      model: "SRD-05VDC-SL-C",
      coilVoltage: n(5),
      coilCurrent: n(0.07),
      config: "SPDT",
      contactVoltage: n(250),
      contactCurrent: n(10),
    }, { mpn: "SRD-05VDC-SL-C" }),
    part("demo-k-g5v", "relays", 4, "Caixa F1", {
      kind: "Eletromecânico",
      model: "G5V-2",
      coilVoltage: n(12),
      coilCurrent: n(0.03),
      config: "DPDT",
      contactVoltage: n(125),
      contactCurrent: n(2),
    }, { mpn: "G5V-2-12VDC" }),
    part("demo-f-1a", "fuses", 10, "Caixa F2", {
      current: n(1),
      voltage: n(250),
      speed: "Rápido",
      package: "5×20 mm",
    }),
    part("demo-f-500m", "fuses", 4, "Caixa F2", {
      current: n(0.5),
      voltage: n(250),
      speed: "Lento",
      package: "5×20 mm",
    }, { minQty: 6 }),
    part("demo-x-16m", "crystals", 5, "Caixa G1", {
      frequency: n(16e6),
      load: "18",
      package: "HC-49",
    }),
    part("demo-x-32k", "crystals", 6, "Caixa G1", {
      frequency: n(32768),
      load: "12.5",
      package: "Cilíndrico",
    }),
    part("demo-p-10k", "pots", 8, "Caixa H1", {
      resistance: n(10000),
      taper: "Linear",
      power: n(0.1),
      kind: "Trimmer",
    }),
    part("demo-p-100k", "pots", 3, "Caixa H1", {
      resistance: n(100000),
      taper: "Logarítmico",
      power: n(0.2),
      kind: "Rotativo",
    }),
  ];
}

export function slugKey(label: string, used: Set<string>): string {
  const base =
    label
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "campo";
  let key = base;
  let i = 2;
  while (used.has(key)) {
    key = `${base}_${i}`;
    i += 1;
  }
  used.add(key);
  return key;
}
