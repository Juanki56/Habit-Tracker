import { useState } from "react";
import { Field, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { updateGoal } from "../../services/goals.service";
import type { GoalWithRelations } from "../../types/goal";

export function GoalEditForm({ goal, onDone, onCancel }: { goal: GoalWithRelations; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description ?? "");
  const [targetValue, setTargetValue] = useState(goal.target_value?.toString() ?? "");
  const [minimumValue, setMinimumValue] = useState(goal.minimum_value?.toString() ?? "");
  const [maximumValue, setMaximumValue] = useState(goal.maximum_value?.toString() ?? "");
  const [unit, setUnit] = useState(goal.unit ?? "");
  const [endDate, setEndDate] = useState(goal.end_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await updateGoal(goal.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        target_value: goal.direction === "maintain" ? undefined : targetValue ? Number(targetValue) : null,
        minimum_value: minimumValue ? Number(minimumValue) : null,
        maximum_value: maximumValue ? Number(maximumValue) : null,
        unit: unit.trim() || undefined,
        end_date: endDate || undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar los cambios");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Nombre">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Descripción">
        <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      {goal.direction !== "maintain" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label={goal.direction === "increase" ? "Meta — número a alcanzar" : "Máximo permitido"}>
              <TextInput type="number" min={0} value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
            </Field>
            <Field label="Unidad de esa meta">
              <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} />
            </Field>
          </div>
          {targetValue && (
            <p className="-mt-2 text-xs text-text-dim">
              Se leerá como: "{targetValue} {unit || "(sin unidad)"}"
            </p>
          )}
        </>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Field label="Mínimo aceptable">
            <TextInput type="number" min={0} value={minimumValue} onChange={(e) => setMinimumValue(e.target.value)} />
          </Field>
          <Field label="Máximo aceptable">
            <TextInput type="number" min={0} value={maximumValue} onChange={(e) => setMaximumValue(e.target.value)} />
          </Field>
          <Field label="Unidad">
            <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} />
          </Field>
        </div>
      )}

      <Field label="Fecha límite (opcional)">
        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
