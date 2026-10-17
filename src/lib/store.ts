import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { builtinCategories, demoParts } from "@/lib/catalog";
import type { Category, FieldDef, Part } from "@/lib/types";

type ImportResult = { ok: true; count: number } | { ok: false; error: string };

type BenchState = {
  categories: Category[];
  parts: Part[];
  addPart: (part: Part) => void;
  updatePart: (part: Part) => void;
  removePart: (id: string) => void;
  adjustQty: (id: string, delta: number) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => { ok: true } | { ok: false; error: string };
  importData: (data: unknown) => ImportResult;
  resetDemo: () => void;
};

function withBuiltins(categories: Category[]): Category[] {
  const ids = new Set(categories.map((c) => c.id));
  const missing = builtinCategories().filter((c) => !ids.has(c.id));
  return [...categories, ...missing];
}

function isField(value: unknown): value is FieldDef {
  if (!value || typeof value !== "object") return false;
  const field = value as FieldDef;
  return typeof field.key === "string" && typeof field.label === "string" && typeof field.kind === "string";
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") return false;
  const category = value as Category;
  return (
    typeof category.id === "string" &&
    typeof category.name === "string" &&
    Array.isArray(category.fields) &&
    category.fields.every(isField)
  );
}

function isPart(value: unknown): value is Part {
  if (!value || typeof value !== "object") return false;
  const part = value as Part;
  return typeof part.id === "string" && typeof part.categoryId === "string" && !!part.props && typeof part.props === "object";
}

function normalizePart(part: Part): Part {
  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(part.props ?? {})) {
    if (typeof value === "string" || typeof value === "number") props[key] = String(value);
  }
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
    updatedAt: Number(part.updatedAt) || Date.now(),
  };
}

function normalizeCategory(category: Category): Category {
  const builtin = builtinCategories().find((item) => item.id === category.id);
  return {
    id: category.id,
    name: category.name.trim() || builtin?.name || "Categoria",
    short: (category.short || builtin?.short || category.name.slice(0, 1) || "?").slice(0, 2),
    builtin: builtin ? true : Boolean(category.builtin),
    fields: category.fields.length > 0 ? category.fields : (builtin?.fields ?? []),
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useBench = create<BenchState>()(
  persist(
    (set, get) => ({
      categories: builtinCategories(),
      parts: demoParts(),
      addPart: (part) => set((state) => ({ parts: [normalizePart(part), ...state.parts] })),
      updatePart: (part) =>
        set((state) => ({
          parts: state.parts.map((item) => (item.id === part.id ? normalizePart({ ...part, updatedAt: Date.now() }) : item)),
        })),
      removePart: (id) => set((state) => ({ parts: state.parts.filter((item) => item.id !== id) })),
      adjustQty: (id, delta) =>
        set((state) => ({
          parts: state.parts.map((item) =>
            item.id === id ? { ...item, qty: Math.max(0, item.qty + delta), updatedAt: Date.now() } : item,
          ),
        })),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, normalizeCategory(category)] })),
      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? normalizeCategory({ ...category, ...patch, id }) : category,
          ),
        })),
      removeCategory: (id) => {
        const category = get().categories.find((item) => item.id === id);
        if (!category) return { ok: false, error: "Categoria inexistente." };
        if (category.builtin) return { ok: false, error: "As categorias de origem ficam." };
        const used = get().parts.some((part) => part.categoryId === id);
        if (used) return { ok: false, error: "Ainda há peças nesta categoria." };
        set((state) => ({ categories: state.categories.filter((item) => item.id !== id) }));
        return { ok: true };
      },
      importData: (data) => {
        if (!data || typeof data !== "object") return { ok: false, error: "Ficheiro inválido." };
        const record = data as { categories?: unknown; parts?: unknown };
        if (!Array.isArray(record.categories) || !Array.isArray(record.parts)) {
          return { ok: false, error: "O ficheiro não tem categorias e peças." };
        }
        const categories = withBuiltins(record.categories.filter(isCategory).map(normalizeCategory));
        const parts = record.parts.filter(isPart).map(normalizePart);
        if (categories.length === 0) return { ok: false, error: "Nenhuma categoria válida." };
        set({ categories, parts });
        return { ok: true, count: parts.length };
      },
      resetDemo: () => set({ categories: builtinCategories(), parts: demoParts() }),
    }),
    {
      name: "bancada",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (state) => ({ categories: state.categories, parts: state.parts }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<Pick<BenchState, "categories" | "parts">> | undefined;
        if (!saved?.categories || !saved.parts) return current;
        return {
          ...current,
          categories: withBuiltins(saved.categories.map(normalizeCategory)),
          parts: saved.parts.map(normalizePart),
        };
      },
    },
  ),
);
