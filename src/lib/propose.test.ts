import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { biasDivider } from "./calc.ts";
import { biasPoint, proposeDivider, proposeNetworks } from "./propose.ts";
import { compareByValue, compareLocationLabels, locationRank } from "./sort-parts.ts";
import type { Category, Part } from "./types.ts";

function resistor(id: string, ohms: number, qty = 10, power = 0.25, location = ""): Part {
  return {
    id,
    categoryId: "resistors",
    name: "",
    mpn: "",
    qty,
    minQty: 0,
    location,
    notes: "",
    props: { resistance: String(ohms), power: String(power) },
    updatedAt: 0,
  };
}

describe("location order", () => {
  it("sorts value labels from 1k to 1M", () => {
    const labels = ["1M", "10k", "2k", "1k", "2k2"];
    labels.sort(compareLocationLabels);
    assert.deepEqual(labels, ["1k", "2k", "2k2", "10k", "1M"]);
    assert.equal(locationRank("Gaveta 10k"), 10000);
    assert.equal(locationRank("Gaveta A1"), null);
  });

  it("sorts parts by the primary value, descending too", () => {
    const categories: Category[] = [
      {
        id: "resistors",
        name: "Resistores",
        short: "R",
        builtin: true,
        fields: [{ key: "resistance", label: "Resistência", kind: "si", unit: "Ω" }],
      },
    ];
    const parts = [resistor("a", 1e6), resistor("b", 1000), resistor("c", 10000)];
    const asc = [...parts].sort((a, b) => compareByValue(a, b, categories, "asc")).map((part) => part.id);
    const desc = [...parts].sort((a, b) => compareByValue(a, b, categories, "desc")).map((part) => part.id);
    assert.deepEqual(asc, ["b", "c", "a"]);
    assert.deepEqual(desc, ["a", "c", "b"]);
  });
});

describe("stock networks", () => {
  it("prefers one exact part over a combination", () => {
    const found = proposeNetworks(
      [resistor("10k", 10000), resistor("4k7", 4700, 4)],
      "resistors",
      "resistance",
      10000,
      "R",
    );
    assert.equal(found[0]?.mode, "single");
    assert.equal(found[0]?.uses[0]?.part.id, "10k");
    assert.ok(!found.some((item) => item.parts > 1));
  });

  it("builds a series pair when nothing single is close", () => {
    const found = proposeNetworks([resistor("4k7", 4700, 4)], "resistors", "resistance", 9400, "R");
    assert.equal(found.some((item) => item.mode === "series" && item.parts === 2), true);
    const series = found.find((item) => item.mode === "series");
    assert.ok(series);
    assert.ok(series.errPct < 0.1);
  });

  it("builds a parallel pair and refuses a part that is out of quantity", () => {
    const found = proposeNetworks([resistor("10k", 10000, 1)], "resistors", "resistance", 5000, "R");
    assert.equal(found.some((item) => item.mode === "parallel"), false);
    const enough = proposeNetworks([resistor("10k", 10000, 2)], "resistors", "resistance", 5000, "R");
    const parallel = enough.find((item) => item.mode === "parallel");
    assert.ok(parallel);
    assert.ok(parallel.errPct < 0.1);
  });

  it("adds capacitors in parallel and divides them in series", () => {
    const cap = (id: string, farads: number, qty = 2): Part => ({
      ...resistor(id, farads, qty),
      categoryId: "capacitors",
      props: { capacitance: String(farads) },
    });
    const parallel = proposeNetworks([cap("100n", 100e-9)], "capacitors", "capacitance", 200e-9, "C", { unit: "F" });
    assert.equal(parallel.some((item) => item.mode === "parallel" && item.errPct < 0.1), true);
    const series = proposeNetworks([cap("100n", 100e-9)], "capacitors", "capacitance", 50e-9, "C", { unit: "F" });
    assert.equal(series.some((item) => item.mode === "series" && item.errPct < 0.1), true);
  });
});

describe("divider from stock", () => {
  it("recovers the designed current with the calculated resistors", () => {
    const designed = biasDivider({
      polarity: "npn",
      vcc: 12,
      ic: 0.002,
      beta: 100,
      vbe: 0.7,
      veDrop: 1.2,
      vce: null,
      stiffness: 10,
    });
    assert.equal(designed.ok, true);
    if (!designed.ok) return;
    const re = designed.resistors.find((item) => item.name === "Re")!;
    const rc = designed.resistors.find((item) => item.name === "Rc")!;
    const r1 = designed.resistors.find((item) => item.name === "R1")!;
    const r2 = designed.resistors.find((item) => item.name === "R2")!;
    const point = biasPoint({
      polarity: "npn",
      vcc: 12,
      vbe: 0.7,
      beta: 100,
      re: re.ohms,
      rc: rc.ohms,
      r1: r1.ohms,
      r2: r2.ohms,
    });
    assert.ok(point);
    assert.ok(Math.abs(point.ic - 0.002) / 0.002 < 0.02);
  });

  it("picks a 47k and 10k pair close to the ideal divider", () => {
    const designed = biasDivider({
      polarity: "npn",
      vcc: 12,
      ic: 0.002,
      beta: 100,
      vbe: 0.7,
      veDrop: 1.2,
      vce: null,
      stiffness: 10,
    });
    assert.equal(designed.ok, true);
    if (!designed.ok) return;
    const re = designed.resistors.find((item) => item.name === "Re")!;
    const rc = designed.resistors.find((item) => item.name === "Rc")!;
    const r1 = designed.resistors.find((item) => item.name === "R1")!;
    const r2 = designed.resistors.find((item) => item.name === "R2")!;
    const parts = [resistor("10k", 10000, 5, 0.25, "10k"), resistor("47k", 47000, 5, 0.25, "47k"), resistor("1k", 1000, 5)];
    const pairs = proposeDivider({
      parts,
      polarity: "npn",
      vcc: 12,
      vbe: 0.7,
      beta: 100,
      re: re.ohms,
      rc: rc.ohms,
      r1: r1.ohms,
      r2: r2.ohms,
      targetIc: designed.ic,
      minStiffness: 10,
    });
    assert.ok(pairs.length > 0);
    assert.ok(pairs[0]!.icErrPct < 15);
    const ids = [pairs[0]!.r1.uses[0]!.part.id, pairs[0]!.r2.uses[0]!.part.id].sort();
    assert.deepEqual(ids, ["10k", "47k"]);
  });
});
