import { useState } from "react";
import { slugKey } from "@/lib/catalog";
import { useBench } from "@/lib/store";
import type { Category, FieldDef, FieldKind } from "@/lib/types";
import { Button, Drawer, Field, Input, Select } from "@/components/ui";

const UNITS = ["Ω", "F", "H", "V", "A", "W", "Hz", "%"];

type DraftField = { key: string; label: string; kind: FieldKind; unit: string; options: string };

function emptyField(): DraftField {
  return { key: "", label: "", kind: "si", unit: "Ω", options: "" };
}

export function CategoryView({ onOpenCategory }: { onOpenCategory: (id: string) => void }) {
  const categories = useBench((state) => state.categories);
  const parts = useBench((state) => state.parts);
  const removeCategory = useBench((state) => state.removeCategory);
  const resetDemo = useBench((state) => state.resetDemo);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted">
          Cada categoria traz os campos que interessam nessa peça. As de origem ficam; podes criar outras.
        </p>
        <Button onClick={() => setEditing("new")}>Nova categoria</Button>
      </div>
      {message ? <p className="text-sm text-danger">{message}</p> : null}
      <ul className="flex flex-col gap-2">
        {categories.map((category) => {
          const count = parts.filter((part) => part.categoryId === category.id).length;
          const units = parts.filter((part) => part.categoryId === category.id).reduce((sum, part) => sum + part.qty, 0);
          return (
            <li key={category.id} className="rounded-xl border border-line bg-surface p-4 shadow-panel">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-sm border border-line bg-elevated font-mono text-sm text-muted">
                  {category.short}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-medium">{category.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    <span className="num">{count}</span> referências · <span className="num">{units}</span> unidades
                  </p>
                  <p className="mt-1 text-sm break-words text-muted">{category.fields.map((field) => field.label).join(" · ")}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => onOpenCategory(category.id)}>
                  Ver peças
                </Button>
                {!category.builtin ? (
                  <>
                    <Button variant="ghost" onClick={() => setEditing(category)}>
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        const result = removeCategory(category.id);
                        setMessage(result.ok ? "" : result.error);
                      }}
                    >
                      Eliminar
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="pt-2">
        <Button variant="secondary" onClick={() => setConfirmReset(true)}>
          Repor exemplo
        </Button>
      </div>
      {editing ? (
        <CategoryDrawer
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {confirmReset ? (
        <Drawer
          title="Repor o exemplo"
          description="Substitui categorias e peças guardadas neste browser."
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <Button variant="secondary" className="ml-auto" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetDemo();
                  setConfirmReset(false);
                  setMessage("");
                }}
              >
                Repor
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted">Exporta uma cópia antes se quiseres ficar com o inventário atual.</p>
        </Drawer>
      ) : null}
    </div>
  );
}

function CategoryDrawer({ initial, onClose }: { initial: Category | null; onClose: () => void }) {
  const addCategory = useBench((state) => state.addCategory);
  const updateCategory = useBench((state) => state.updateCategory);
  const [name, setName] = useState(initial?.name ?? "");
  const [fields, setFields] = useState<DraftField[]>(
    initial
      ? initial.fields.map((field) => ({
          key: field.key,
          label: field.label,
          kind: field.kind,
          unit: field.unit ?? "Ω",
          options: field.options?.join(", ") ?? "",
        }))
      : [emptyField()],
  );
  const [error, setError] = useState("");

  function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("A categoria precisa de um nome.");
      return;
    }
    const used = new Set(fields.map((field) => field.key).filter(Boolean));
    const nextFields: FieldDef[] = [];
    for (const field of fields) {
      const label = field.label.trim();
      if (!label) continue;
      const key = field.key || slugKey(label, used);
      if (!field.key) used.add(key);
      const def: FieldDef = { key, label, kind: field.kind };
      if (field.kind === "si" || field.kind === "number") def.unit = field.unit || undefined;
      if (field.kind === "select") {
        def.options = field.options
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean);
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
    if (initial) {
      updateCategory(initial.id, { name: trimmed, short: trimmed.slice(0, 1).toUpperCase(), fields: nextFields });
    } else {
      addCategory({
        id: `c_${crypto.randomUUID().slice(0, 8)}`,
        name: trimmed,
        short: trimmed.slice(0, 1).toUpperCase(),
        builtin: false,
        fields: nextFields,
      });
    }
    onClose();
  }

  return (
    <Drawer
      title={initial ? "Editar categoria" : "Nova categoria"}
      description="Texto, número, grandeza ou uma lista."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" className="ml-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nome">
          <Input value={name} placeholder="Conectores" onChange={(event) => setName(event.target.value)} />
        </Field>
        {fields.map((field, index) => (
          <div key={field.key || index} className="flex flex-col gap-3 rounded-lg border border-line bg-bg p-3">
            <Field label="Campo">
              <Input
                value={field.label}
                placeholder="Passo"
                onChange={(event) =>
                  setFields((current) => current.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tipo">
                <Select
                  value={field.kind}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, i) => (i === index ? { ...item, kind: event.target.value as FieldKind } : item)),
                    )
                  }
                >
                  <option value="si">Grandeza</option>
                  <option value="number">Número</option>
                  <option value="text">Texto</option>
                  <option value="select">Lista</option>
                </Select>
              </Field>
              {field.kind === "si" || field.kind === "number" ? (
                <Field label="Unidade">
                  <Select
                    value={field.unit}
                    onChange={(event) =>
                      setFields((current) => current.map((item, i) => (i === index ? { ...item, unit: event.target.value } : item)))
                    }
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}
            </div>
            {field.kind === "select" ? (
              <Field label="Opções" hint="Separadas por vírgulas.">
                <Input
                  value={field.options}
                  placeholder="SPDT, DPDT"
                  onChange={(event) =>
                    setFields((current) => current.map((item, i) => (i === index ? { ...item, options: event.target.value } : item)))
                  }
                />
              </Field>
            ) : null}
            {fields.length > 1 ? (
              <Button variant="ghost" onClick={() => setFields((current) => current.filter((_, i) => i !== index))}>
                Tirar campo
              </Button>
            ) : null}
          </div>
        ))}
        <Button variant="secondary" onClick={() => setFields((current) => [...current, emptyField()])}>
          Adicionar campo
        </Button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </Drawer>
  );
}
