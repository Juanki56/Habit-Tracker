import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Select, TextInput } from "../../components/ui/FormControls";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import * as habitActivityTypesService from "../../services/habit-activity-types.service";
import * as activityTypesService from "../../services/activity-types.service";

export function HabitActivityTypesCard({ habitId }: { habitId: string }) {
  const { user } = useAuth();
  const {
    data: types,
    loading,
    refetch,
  } = useApiQuery((signal) => habitActivityTypesService.listForHabit(habitId, signal), [habitId]);
  const { data: allTypes, refetch: refetchAllTypes } = useApiQuery(
    (signal) => activityTypesService.listActivityTypes(signal),
    []
  );

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  async function handleDetach(activityTypeId: string) {
    await habitActivityTypesService.detach(habitId, activityTypeId);
    refetch();
  }

  async function handleAttach(typeId: string) {
    if (!typeId) return;
    setBusy(true);
    try {
      await habitActivityTypesService.attach(habitId, typeId);
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateType() {
    const name = newTypeName.trim();
    if (!name) {
      setCreatingType(false);
      return;
    }
    setBusy(true);
    try {
      const type = await activityTypesService.createActivityType({ name });
      await habitActivityTypesService.attach(habitId, type.id);
      setNewTypeName("");
      setCreatingType(false);
      refetchAllTypes();
      refetch();
    } finally {
      setBusy(false);
    }
  }

  function startRename(activityTypeId: string, currentName: string) {
    setRenamingId(activityTypeId);
    setRenameValue(currentName);
  }

  async function confirmRename() {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setBusy(true);
    try {
      await activityTypesService.updateActivityType(renamingId, { name: renameValue.trim() });
      setRenamingId(null);
      refetch();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  const unassignedTypes = (allTypes ?? []).filter(
    (type) => !types?.some((t) => t.activity_type_id === type.id)
  );

  return (
    <Card>
      <p className="flicker font-mono text-xs tracking-widest text-primary">ACTIVITY TYPES</p>

      {(types?.length ?? 0) === 0 && <p className="mt-2 text-sm text-text-muted">Sin tipos habilitados todavía.</p>}

      {types && types.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {types.map((t) => {
            const isOwn = t.activity_types.user_id === user?.id;
            const isRenaming = renamingId === t.activity_type_id;
            return (
              <li key={t.activity_type_id} className="flex items-center justify-between text-sm">
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    disabled={busy}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={confirmRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="w-32 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-text outline-none focus:border-primary"
                  />
                ) : (
                  <span
                    className={`text-text-muted ${isOwn ? "cursor-pointer hover:text-primary" : ""}`}
                    onClick={() => isOwn && startRename(t.activity_type_id, t.activity_types.name)}
                    title={isOwn ? "Click para renombrar" : "Tipo global — no editable"}
                  >
                    {t.activity_types.name}
                  </span>
                )}
                <button
                  onClick={() => handleDetach(t.activity_type_id)}
                  className="text-xs text-text-dim hover:text-danger"
                >
                  Quitar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {unassignedTypes.length > 0 && (
        <Field label="Habilitar un tipo existente">
          <Select value="" disabled={busy} onChange={(e) => handleAttach(e.target.value)} className="mt-1 text-sm">
            <option value="">Elegir tipo…</option>
            {unassignedTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {creatingType ? (
        <div className="mt-2 flex gap-2">
          <TextInput
            autoFocus
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Nombre del tipo…"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateType();
              }
            }}
          />
          <Button type="button" onClick={handleCreateType} disabled={busy || !newTypeName.trim()}>
            {busy ? "…" : "Crear"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setCreatingType(false)} disabled={busy}>
            ✕
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setCreatingType(true)}
          className="mt-2 font-mono text-xs text-text-muted hover:text-primary"
        >
          + Crear tipo nuevo
        </button>
      )}
    </Card>
  );
}
