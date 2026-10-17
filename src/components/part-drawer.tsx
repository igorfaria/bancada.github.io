import { useMemo, useState } from "react";
import { parseEngineering } from "@/lib/si";
import { formatProp } from "@/lib/parts";
import { useBench } from "@/lib/store";
import type { Category, FieldDef, Part } from "@/lib/types";
import { Button, Drawer, Field, Input, Select, TextArea } from "@/components/ui";

export function blankPart(categoryId: string): Part {
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
    updatedAt: Date.now(),
  };
}

function decorate(part: Part): Part {
  const category = useBench.getState().categories.find((item) => item.id === part.categoryId);
  if (!category) return part;
  const props = { ...part.props };
  for (const field of category.fields) {
    if (props[field.key]) props[field.key] = toInput(props[field.key], field);
  }
  return { ...part, props };
}
function toInput(value: string | undefined, field: FieldDef): string {
  if (!value) return "";
  if (field.kind === "si") {
    const parsed = parseEngineering(value);
    return parsed == null ? value : formatProp(value, field);
  }
  if (field.kind === "number") return value.replace(".", ",");
  return value;
}

function fromInput(value: string, field: FieldDef): string {
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

export function PartDrawer({ initial, mode, onClose }: { initial: Part; mode: "new" | "edit"; onClose: () => void }) {
  const categories = useBench((state) => state.categories);
  const parts = useBench((state) => state.parts);
  const addPart = useBench((state) => state.addPart);
  const updatePart = useBench((state) => state.updatePart);
  const removePart = useBench((state) => state.removePart);
  const [part, setPart] = useState(() => decorate(initial));
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const category = categories.find((item) => item.id === part.categoryId) ?? categories[0];
  const locations = useMemo(() => [...new Set(parts.map((item) => item.location).filter(Boolean))].sort(), [parts]);

  function setProp(key: string, value: string) {
    setPart((current) => ({ ...current, props: { ...current.props, [key]: value } }));
  }

  function changeCategory(categoryId: string) {
    const next = categories.find((item) => item.id === categoryId);
    setPart((current) => {
      const props: Record<string, string> = {};
      for (const field of next?.fields ?? []) {
        if (current.props[field.key]) props[field.key] = current.props[field.key]!;
      }
      return { ...current, categoryId, props };
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
    const props: Record<string, string> = {};
    for (const field of category.fields) {
      const stored = fromInput(part.props[field.key] ?? "", field);
      if (stored) props[field.key] = stored;
    }
    const named = part.name.trim() || part.mpn.trim() || Object.keys(props).length > 0;
    if (!named) {
      setError("Indica um valor, um nome ou uma referência.");
      return;
    }
    const next: Part = {
      ...part,
      name: part.name.trim(),
      mpn: part.mpn.trim(),
      location: part.location.trim(),
      notes: part.notes.trim(),
      qty,
      minQty: Number.isFinite(minQty) ? Math.max(0, minQty) : 0,
      props,
      updatedAt: Date.now(),
    };
    if (mode === "new") addPart(next);
    else updatePart(next);
    onClose();
  }

  return (
    <Drawer
      title={mode === "new" ? "Nova peça" : "Editar peça"}
      description="Valores como 4k7, 100n, 10µ ou 250m."
      onClose={onClose}
      footer={
        confirmDelete ? (
          <>
            <p className="self-center text-sm text-muted">Eliminar esta peça?</p>
            <Button variant="secondary" className="ml-auto" onClick={() => setConfirmDelete(false)}>
              Não
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removePart(part.id);
                onClose();
              }}
            >
              Eliminar
            </Button>
          </>
        ) : (
          <>
            {mode === "edit" ? (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Eliminar
              </Button>
            ) : (
              <span />
            )}
            <Button variant="secondary" className="ml-auto" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar</Button>
          </>
        )
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <Field label="Categoria">
          <Select value={part.categoryId} onChange={(event) => changeCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nome" hint="Opcional. Se ficar vazio, o valor principal serve de nome.">
          <Input value={part.name} onChange={(event) => setPart({ ...part, name: event.target.value })} />
        </Field>
        <Field label="Referência">
          <Input
            value={part.mpn}
            placeholder="BC547B"
            onChange={(event) => setPart({ ...part, mpn: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantidade">
            <Input
              inputMode="numeric"
              value={String(part.qty)}
              onChange={(event) => setPart({ ...part, qty: Number(event.target.value.replace(",", ".")) || 0 })}
            />
          </Field>
          <Field label="Mínimo" hint="Avisa quando chega a este número. 0 desliga.">
            <Input
              inputMode="numeric"
              value={String(part.minQty)}
              onChange={(event) => setPart({ ...part, minQty: Number(event.target.value.replace(",", ".")) || 0 })}
            />
          </Field>
        </div>
        <Field label="Localização">
          <Input
            list="locations"
            value={part.location}
            placeholder="Gaveta A3"
            onChange={(event) => setPart({ ...part, location: event.target.value })}
          />
          <datalist id="locations">
            {locations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </Field>
        {category ? <PropsFields category={category} props={part.props} onChange={setProp} /> : null}
        <Field label="Notas">
          <TextArea value={part.notes} onChange={(event) => setPart({ ...part, notes: event.target.value })} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </form>
    </Drawer>
  );
}

function PropsFields({
  category,
  props,
  onChange,
}: {
  category: Category;
  props: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {category.fields.map((field) => {
        const value = props[field.key] ?? "";
        return (
          <Field key={field.key} label={field.unit && field.kind !== "select" ? `${field.label} (${field.unit})` : field.label}>
            {field.kind === "select" ? (
              <Select value={value} onChange={(event) => onChange(field.key, event.target.value)}>
                <option value="">—</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {field.key === "tolerance" ? `${option.replace(".", ",")} %` : option}
                  </option>
                ))}
                {value && !field.options?.includes(value) ? <option value={value}>{value}</option> : null}
              </Select>
            ) : (
              <Input
                value={value}
                placeholder={field.placeholder}
                inputMode={field.kind === "text" ? "text" : "decimal"}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </Field>
        );
      })}
    </div>
  );
}
