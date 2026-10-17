import { useEffect, useRef, useState } from "react";
import { Boxes, Calculator, Download, Layers, Upload } from "lucide-react";
import { CalcView } from "@/components/calc-view";
import { CategoryView } from "@/components/category-view";
import { InventoryView } from "@/components/inventory-view";
import { blankPart, PartDrawer } from "@/components/part-drawer";
import { Button } from "@/components/ui";
import { useBench } from "@/lib/store";
import type { Part } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "inventory" | "calc" | "categories";

const NAV: { id: View; label: string; icon: typeof Boxes }[] = [
  { id: "inventory", label: "Inventário", icon: Boxes },
  { id: "calc", label: "Calcular", icon: Calculator },
  { id: "categories", label: "Categorias", icon: Layers },
];

export function App() {
  const [view, setView] = useState<View>("inventory");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<{ part: Part; mode: "new" | "edit" } | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importData = useBench((state) => state.importData);

  useEffect(() => {
    void Promise.resolve(useBench.persist.rehydrate());
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function exportFile() {
    const { categories, parts } = useBench.getState();
    const blob = new Blob([JSON.stringify({ app: "bancada", version: 1, categories, parts }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bancada.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Cópia descarregada.");
  }

  async function onImport(file: File) {
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const result = importData(data);
      setNotice(result.ok ? `${result.count} peças importadas.` : result.error);
    } catch {
      setNotice("Não consegui ler esse ficheiro.");
    }
  }

  function openNew() {
    const categories = useBench.getState().categories;
    const categoryId = categories.some((category) => category.id === filter) ? filter : (categories[0]?.id ?? "resistors");
    setDraft({ part: blankPart(categoryId), mode: "new" });
  }

  return (
    <div className="min-h-dvh bg-bg text-ink md:grid md:grid-cols-[14rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line p-4 md:flex">
        <Brand />
        <nav className="mt-6 flex flex-col gap-1" aria-label="Secções">
          {NAV.map((item) => (
            <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button variant="secondary" onClick={exportFile}>
            <Download className="size-4" aria-hidden="true" />
            Exportar
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Importar
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-line md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <Brand />
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Exportar" onClick={exportFile}>
                <Download className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Importar" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </header>
        {notice ? (
          <p className="px-4 pt-4 text-sm text-muted" role="status">
            {notice}
          </p>
        ) : null}
        <main className="px-4 py-4 pb-24 md:py-6 md:pb-8">
          {view === "inventory" ? (
            <InventoryView
              filter={filter}
              setFilter={setFilter}
              onCreate={openNew}
              onEdit={(part) => setDraft({ part, mode: "edit" })}
            />
          ) : view === "calc" ? (
            <CalcView />
          ) : (
            <CategoryView
              onOpenCategory={(id) => {
                setFilter(id);
                setView("inventory");
              }}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-surface md:hidden" aria-label="Secções">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 text-sm",
              view === item.id ? "text-ink" : "text-muted",
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onImport(file);
        }}
      />
      {draft ? <PartDrawer initial={draft.part} mode={draft.mode} onClose={() => setDraft(null)} /> : null}
    </div>
  );
}

function Brand() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 32 16" className="h-4 w-8 shrink-0 text-accent" aria-hidden="true">
          <path
            d="M1 8h6l2-5 4 10 4-10 2 5h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-lg font-medium tracking-tight">Bancada</p>
      </div>
      <p className="mt-1 text-sm text-muted">Componentes discretos</p>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press flex h-11 items-center gap-2 rounded-sm px-3 text-left text-sm font-medium",
        active ? "bg-surface text-ink shadow-panel" : "text-muted hover:text-ink",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </button>
  );
}
