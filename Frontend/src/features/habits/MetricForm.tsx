import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, Select, TextInput } from "../../components/ui/FormControls";
import { useApiQuery } from "../../hooks/useApiQuery";
import * as habitMetricsService from "../../services/habit-metrics.service";
import * as habitActivityTypesService from "../../services/habit-activity-types.service";
import { METRIC_AGGREGATION_LABELS, METRIC_SOURCE_LABELS } from "../../types/habit-metric";
import type { HabitMetric, MetricAggregation, MetricSourceType } from "../../types/habit-metric";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "m$1");
}

// Los conteos (activity_count / check_in_count) siempre son eso: un conteo.
// Mostrar "promedio"/"mínimo"/"máximo" ahí no significa nada útil, así que
// para esos dos source_type ni siquiera se muestra el selector de agregación.
const COUNT_SOURCE_TYPES: MetricSourceType[] = ["activity_count", "check_in_count"];

// Extraído de HabitMetricsCard para poder reusarlo dentro del formulario de
// Goal — así no hay que ir a otra pantalla a crear la métrica antes de poder
// usarla en un goal, que era la fricción que hacía sentir a "metrics" como
// una parada obligatoria aparte.
export function MetricForm({ habitId, onCreated }: { habitId: string; onCreated: (metric: HabitMetric) => void }) {
  const { data: assignedTypes } = useApiQuery(
    (signal) => habitActivityTypesService.listForHabit(habitId, signal),
    [habitId]
  );
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<MetricSourceType>("duration");
  const [aggregation, setAggregation] = useState<MetricAggregation>("sum");
  const [unit, setUnit] = useState("minutos");
  const [activityTypeId, setActivityTypeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCountSource = COUNT_SOURCE_TYPES.includes(sourceType);
  const isDuration = sourceType === "duration";

  function handleSourceChange(value: MetricSourceType) {
    setSourceType(value);
    if (value === "duration") setUnit("minutos");
    else if (COUNT_SOURCE_TYPES.includes(value)) setUnit("veces");
    else setUnit("");

    if (COUNT_SOURCE_TYPES.includes(value)) setAggregation("sum");
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const metric = await habitMetricsService.createHabitMetric(habitId, {
        key: slugify(name),
        name: name.trim(),
        source_type: sourceType,
        aggregation: isCountSource ? "sum" : aggregation,
        unit: isDuration ? "minutos" : unit.trim() || undefined,
        activity_type_id: activityTypeId || undefined,
      });
      onCreated(metric);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la métrica");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Nombre">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Minutos meditados" />
      </Field>

      <Field label="Qué mide">
        <Select value={sourceType} onChange={(e) => handleSourceChange(e.target.value as MetricSourceType)}>
          {Object.entries(METRIC_SOURCE_LABELS)
            .filter(([value]) => value !== "field_number")
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </Select>
      </Field>

      {!isCountSource && (
        <Field label="Cómo combinarlo">
          <Select value={aggregation} onChange={(e) => setAggregation(e.target.value as MetricAggregation)}>
            {Object.entries(METRIC_AGGREGATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Unidad">
        {isDuration ? (
          <TextInput value="minutos" disabled />
        ) : (
          <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="páginas, sesiones…" />
        )}
      </Field>

      <p className="-mt-2 text-xs text-text-dim">
        {isDuration && "La duración siempre se calcula en minutos, sin importar cómo la registres."}
        {isCountSource && "Cuenta cuántas veces pasó — sin promedio ni máximo, solo el número."}
        {sourceType === "quantity" &&
          "Suma el campo 'Cantidad' de tus actividades — asegúrate de usar siempre la misma unidad al registrar (ej. siempre páginas, nunca mezclar con km)."}
      </p>

      {assignedTypes && assignedTypes.length > 0 && (
        <Field label="Limitar a un tipo de actividad (opcional)">
          <Select value={activityTypeId} onChange={(e) => setActivityTypeId(e.target.value)}>
            <option value="">Todas las actividades del hábito</option>
            {assignedTypes.map((t) => (
              <option key={t.activity_type_id} value={t.activity_type_id}>
                {t.activity_types.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="button" onClick={handleSubmit} disabled={submitting || !name.trim()}>
        {submitting ? "Creando…" : "Crear métrica"}
      </Button>
    </div>
  );
}
