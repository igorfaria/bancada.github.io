export type FieldKind = "text" | "number" | "si" | "select";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  unit?: string;
  options?: string[];
  placeholder?: string;
};

export type Category = {
  id: string;
  name: string;
  short: string;
  builtin: boolean;
  fields: FieldDef[];
};

export type Part = {
  id: string;
  categoryId: string;
  name: string;
  mpn: string;
  qty: number;
  minQty: number;
  location: string;
  notes: string;
  props: Record<string, string>;
  updatedAt: number;
};

export type BenchFile = {
  app?: string;
  version?: number;
  categories: Category[];
  parts: Part[];
};
