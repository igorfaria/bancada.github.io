import { useMemo, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { isLow, matchesQuery, partHeadline } from "@/lib/parts";
import { compareByValue, compareLocationLabels, type SortDir } from "@/lib/sort-parts";
import { useBench } from "@/lib/store";
import type { Part } from "@/lib/types";
import { Badge, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export function InventoryView({
  filter,
  setFilter,
  onCreate,
  onEdit,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  onCreate: () => void;
  onEdit: (part: Part) => void;
}) {
  const categories = useBench((state) => state.categories);
  const parts = useBench((state) => state.parts);
  const adjustQty = useBench((state) => state.adjustQty);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"value" | "location">("value");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: "value" | "location") {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const units = parts.reduce((sum, part) => sum + part.qty, 0);
  const lowCount = parts.filter(isLow).length;

  const visible = useMemo(() => {
    return parts.filter((part) => {
      if (filter === "low" && !isLow(part)) return false;
      if (filter !== "all" && filter !== "low" && part.categoryId !== filter) return false;
      return matchesQuery(part, categories, query);
    });
  }, [parts, categories, filter, query]);

  const groups = useMemo(() => {
    if (sortKey === "location") {
      const buckets = new Map<string, Part[]>();
      for (const part of visible) {
        const key = part.location.trim();
        const list = buckets.get(key) ?? [];
        list.push(part);
        buckets.set(key, list);
      }
      return [...buckets.entries()]
        .sort((a, b) => {
          if (!a[0] && b[0]) return 1;
          if (a[0] && !b[0]) return -1;
          const cmp = compareLocationLabels(a[0], b[0]);
          return sortDir === "asc" ? cmp : -cmp;
        })
        .map(([location, items]) => ({
          id: location || "none",
          name: location || "Sem gaveta",
          items: [...items].sort((a, b) => compareByValue(a, b, categories, sortDir)),
        }));
    }

    const order = categories.map((category) => category.id);
    const buckets = new Map<string, Part[]>();
    for (const part of visible) {
      const list = buckets.get(part.categoryId) ?? [];
      list.push(part);
      buckets.set(part.categoryId, list);
    }
    return [...buckets.entries()]
      .sort((a, b) => {
        const ai = order.indexOf(a[0]);
        const bi = order.indexOf(b[0]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .map(([id, items]) => ({
        id,
        name: categories.find((category) => category.id === id)?.name ?? "Sem categoria",
        items: [...items].sort((a, b) => compareByValue(a, b, categories, sortDir)),
      }));
  }, [visible, categories, sortKey, sortDir]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-3 left-3 size-5 text-subtle" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Valor, referência ou gaveta"
            aria-label="Procurar"
            className="pl-10"
          />
        </div>
        <Button onClick={onCreate} className="shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          Nova peça
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Todas
        </FilterChip>
        {categories.map((category) => (
          <FilterChip key={category.id} active={filter === category.id} onClick={() => setFilter(category.id)}>
            {`${category.short} ${category.name}`}
          </FilterChip>
        ))}
        <FilterChip active={filter === "low"} onClick={() => setFilter(filter === "low" ? "all" : "low")}>
          Stock baixo
        </FilterChip>
      </div>

      <div className="flex gap-2">
        <SortChip
          label="Valor"
          active={sortKey === "value"}
          dir={sortDir}
          onClick={() => toggleSort("value")}
        />
        <SortChip
          label="Local"
          active={sortKey === "location"}
          dir={sortDir}
          onClick={() => toggleSort("location")}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Referências" value={String(parts.length)} />
        <Stat label="Unidades" value={String(units)} />
        <button
          type="button"
          onClick={() => setFilter(filter === "low" ? "all" : "low")}
          className={cn(
            "press rounded-lg border px-3 py-3 text-left",
            filter === "low" ? "border-accent bg-surface" : "border-line bg-surface",
          )}
        >
          <span className={cn("num block text-lg", lowCount > 0 ? "text-danger" : "text-ink")}>{lowCount}</span>
          <span className="text-sm text-muted">Baixas</span>
        </button>
      </div>

      {parts.length === 0 ? (
        <Empty onCreate={onCreate} />
      ) : groups.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          Nenhuma peça corresponde.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted">
              {group.name}
              <span className="num"> · {group.items.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((part) => {
                const category = categories.find((item) => item.id === part.categoryId);
                const headline = partHeadline(part, category);
                const low = isLow(part);
                return (
                  <article key={part.id} className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-panel">
                    <button type="button" onClick={() => onEdit(part)} className="flex items-start gap-3 text-left">
                      <span className="grid size-11 shrink-0 place-items-center rounded-sm border border-line bg-elevated font-mono text-sm text-muted">
                        {category?.short ?? "?"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={cn("text-base font-medium tracking-tight", part.name ? "" : "num")}>
                            {headline.title}
                          </span>
                          <span className="num text-base">{part.qty}</span>
                        </span>
                        <span className="mt-1 block text-sm break-words text-muted">{headline.meta}</span>
                        {low ? (
                          <span className="mt-2 inline-flex">
                            <Badge>{part.qty <= 0 ? "Esgotado" : "Baixo"}</Badge>
                          </span>
                        ) : null}
                      </span>
                    </button>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={`Diminuir ${headline.title}`}
                        onClick={() => adjustQty(part.id, -1)}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={`Aumentar ${headline.title}`}
                        onClick={() => adjustQty(part.id, 1)}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" className="ml-auto" onClick={() => onEdit(part)}>
                        Editar
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function SortChip({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  const direction = !active ? "ordenar" : dir === "asc" ? "crescente, clicar inverte" : "decrescente, clicar inverte";
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${label}, ${direction}`}
      onClick={onClick}
      className={cn(
        "press h-11 rounded-full border px-4 text-sm font-medium",
        active ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-ink",
      )}
    >
      {label}
      {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press h-11 shrink-0 rounded-full border px-4 text-sm font-medium",
        active ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <span className="num block text-lg">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function Empty({ onCreate }: { onCreate: () => void }) {
  const resetDemo = useBench((state) => state.resetDemo);
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-10 text-center">
      <p className="text-base font-medium">A bancada está vazia</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Acrescenta a primeira peça ou repõe um inventário de exemplo para experimentar as contas.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={onCreate}>Nova peça</Button>
        <Button variant="secondary" onClick={resetDemo}>
          Repor exemplo
        </Button>
      </div>
    </div>
  );
}
