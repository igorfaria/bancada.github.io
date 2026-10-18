import { useMemo } from "react";
import { formatNum, formatSi } from "@/lib/si";
import { proposeDivider, proposeNetworks, type DividerProposal, type NetworkKind, type NetworkProposal } from "@/lib/propose";
import { useBench } from "@/lib/store";
import type { BjtPolarity } from "@/lib/calc";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

function places(uses: NetworkProposal["uses"]): string {
  return uses
    .map((use) => {
      const where = use.part.location || "sem gaveta";
      return use.count > 1 ? `${use.count}× ${where}` : where;
    })
    .join(" + ");
}

export function StockPlan({
  categoryId,
  fieldKey,
  kind,
  target,
  unit,
  dissipated,
  onUse,
  title = "Com o que tens",
}: {
  categoryId: string;
  fieldKey: string;
  kind: NetworkKind;
  target: number;
  unit: string;
  dissipated?: number;
  onUse?: (value: string) => void;
  title?: string;
}) {
  const parts = useBench((state) => state.parts);
  const proposals = useMemo(
    () => proposeNetworks(parts, categoryId, fieldKey, target, kind, { dissipated, unit }),
    [parts, categoryId, fieldKey, target, kind, dissipated, unit],
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{title}</p>
      {proposals.length === 0 ? (
        <p className="text-sm text-muted">Ainda não há peças desta categoria com quantidade.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {proposals.map((item) => (
            <li key={item.id} className="rounded-lg border border-line bg-bg px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="num">{formatSi(item.value, unit)}</span>
                    {` · ${formatNum(item.errPct, 1)}% · ${places(item.uses)}`}
                  </p>
                  {item.powerOk === false ? (
                    <p className="mt-1 text-sm text-danger">A potência destas peças não chega.</p>
                  ) : null}
                </div>
                {onUse ? (
                  <Button variant="secondary" size="sm" className="shrink-0" onClick={() => onUse(formatSi(item.value, unit))}>
                    Usar
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DividerPlan({
  polarity,
  vcc,
  vbe,
  beta,
  re,
  rc,
  r1,
  r2,
  targetIc,
  minStiffness,
}: {
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
}) {
  const parts = useBench((state) => state.parts);
  const proposals = useMemo(
    () =>
      proposeDivider({
        parts,
        polarity,
        vcc,
        vbe,
        beta,
        re,
        rc,
        r1,
        r2,
        targetIc,
        minStiffness,
      }),
    [parts, polarity, vcc, vbe, beta, re, rc, r1, r2, targetIc, minStiffness],
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Divisor com o stock</p>
      <p className="text-sm text-muted">R1 e R2 em conjunto. Re e Rc ficam nos valores da conta.</p>
      {proposals.length === 0 ? (
        <p className="text-sm text-muted">Nenhum par do stock segura este ponto.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {proposals.map((item) => (
            <DividerRow key={item.id} item={item} soft={minStiffness} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DividerRow({ item, soft }: { item: DividerProposal; soft: number }) {
  const stiffLow = item.stiffness + 0.05 < soft;
  return (
    <li className="rounded-lg border border-line bg-bg px-3 py-3 text-sm">
      <p>
        <span className="text-muted">R1 · </span>
        {item.r1.label}
      </p>
      <p className="mt-1">
        <span className="text-muted">R2 · </span>
        {item.r2.label}
      </p>
      <p className={cn("mt-1", stiffLow ? "text-danger" : "text-muted")}>
        Ic {formatSi(item.ic, "A")} · erro {formatNum(item.icErrPct, 1)}% · rigidez {formatNum(item.stiffness, 1)}×
        {stiffLow ? " — o divisor fica mole." : ""}
      </p>
      <p className="mt-1 text-muted">
        {places(item.r1.uses)} · {places(item.r2.uses)}
      </p>
    </li>
  );
}
