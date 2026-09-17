import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, Select, TextArea, TextInput } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { listHabits } from "../../services/habits.service";
import * as habitMetricsService from "../../services/habit-metrics.service";
import { createGoal } from "../../services/goals.service";
import { MetricForm } from "../habits/MetricForm";
import { GOAL_DIRECTION_LABELS, GOAL_PERIOD_LABELS } from "../../types/goal";
import type { GoalDirection, GoalPeriodType, GoalWithRelations } from "../../types/goal";
import type { HabitMetric } from "../../types/habit-metric";

interface GoalFormModalProps {
  onClose: () => void;
  onCreated: (goal: GoalWithRelations) => void;
}

export function GoalFormModal({ onClose, onCreated }: GoalFormModalProps) {
  const { data: habits } = useApiQuery((signal) => listHabits(true, signal), []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState<GoalDirection>("increase");
  const [periodType, setPeriodType] = useState<GoalPeriodType>("monthly");
  const [targetValue, setTargetValue] = useState("");
  const [minimumValue, setMinimumValue] = useState("");
  const [maximumValue, setMaximumValue] = useState("");
  const [unit, setUnit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [habitIds, setHabitIds] = useState<string[]>([]);
  const [metricsByHabit, setMetricsByHabit] = useState<Record<string, HabitMetric[]>>({});
  const [metricIds, setMetricIds] = useState<string[]>([]);
  const [creatingMetric, setCreatingMetric] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    habitIds.forEach((habitId) => {
      if (metricsByHabit[habitId]) return;
      habitMetricsService.listForHabit(habitId).then((metrics) => {
        setMetricsByHabit((prev) => ({ ...prev, [habitId]: metrics }));
      });
    });
  }, [habitIds]);

  function toggleHabit(habitId: string) {
    setHabitIds((prev) => (prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]));
  }

  function toggleMetric(metricId: string) {
    const alreadySelected = metricIds.includes(metricId);
    if (!alreadySelected) {
      const metric = availableMetrics.find((m) => m.id === metricId);
      // El goal no convierte unidades — si la métrica mide algo distinto a la
      // unidad que ya escribiste, el total mezclado no va a tener sentido.
      if (metric?.unit && unit && metric.unit !== unit) {
        const proceed = confirm(
          `Esta métrica mide en "${metric.unit}", pero pusiste "${unit}" como unidad del goal. Si no coinciden, el número no va a tener sentido. ¿Agregarla de todas formas?`
        );
        if (!proceed) return;
      }
      // Si todavía no escribiste una unidad, la tomamos de la métrica — así
      // queda visible de una vez qué es lo que en verdad vas a medir, en vez
      // de que "Unidad" se quede vacía y parezca que no importa cuál elijas.
      if (!unit && metric?.unit) setUnit(metric.unit);
    }
    setMetricIds((prev) => (alreadySelected ? prev.filter((id) => id !== metricId) : [...prev, metricId]));
  }

  function handleMetricCreated(metric: HabitMetric) {
    setMetricsByHabit((prev) => ({ ...prev, [metric.habit_id]: [...(prev[metric.habit_id] ?? []), metric] }));
    setMetricIds((prev) => [...prev, metric.id]);
    if (!unit && metric.unit) setUnit(metric.unit);
    setCreatingMetric(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const goal = await createGoal({
        name: name.trim(),
        description: description.trim() || undefined,
        direction,
        period_type: periodType,
        target_value: direction !== "maintain" && targetValue ? Number(targetValue) : undefined,
        minimum_value: minimumValue ? Number(minimumValue) : undefined,
        maximum_value: maximumValue ? Number(maximumValue) : undefined,
        unit: unit.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        habit_ids: habitIds.length > 0 ? habitIds : undefined,
        metric_ids: metricIds.length > 0 ? metricIds : undefined,
      });
      onCreated(goal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el goal");
    } finally {
      setSubmitting(false);
    }
  }

  const availableMetrics = habitIds.flatMap((id) => metricsByHabit[id] ?? []);

  return (
    <Modal title="Nuevo goal" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre">
          <TextInput required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Descripción (opcional)">
          <TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dirección">
            <Select value={direction} onChange={(e) => setDirection(e.target.value as GoalDirection)}>
              {Object.entries(GOAL_DIRECTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Periodo">
            <Select value={periodType} onChange={(e) => setPeriodType(e.target.value as GoalPeriodType)}>
              {Object.entries(GOAL_PERIOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {direction !== "maintain" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label={direction === "increase" ? "Meta — número a alcanzar" : "Máximo permitido"}>
                <TextInput
                  type="number"
                  min={0}
                  placeholder="30"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </Field>
              <Field label="Unidad de esa meta">
                <TextInput placeholder="horas, libros, km…" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </Field>
            </div>
            <p className="-mt-2 text-xs text-text-dim">
              {targetValue
                ? `Se leerá como: "${targetValue} ${unit || "(sin unidad)"}" — ${
                    direction === "increase" ? "quieres llegar a esto" : "no quieres pasarte de esto"
                  }.`
                : direction === "increase"
                  ? 'Ej: Meta "30" + Unidad "horas" = quieres llegar a 30 horas este periodo.'
                  : 'Ej: Meta "60" + Unidad "min" = no quieres pasarte de 60 minutos.'}
            </p>
          </>
        ) : (
          <>
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
            <p className="-mt-2 text-xs text-text-dim">
              "Mantener" no tiene una sola meta — define un rango que está bien. Ej: mantener el peso entre
              "70" y "75" kg.
            </p>
          </>
        )}

        {periodType === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Hasta">
              <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        )}

        {habits && habits.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-sm text-text-muted">Hábitos que contribuyen (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    habitIds.includes(habit.id) ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
                  }`}
                >
                  {habit.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {habitIds.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-text-muted">Métricas que miden el progreso</p>

            {availableMetrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableMetrics.map((metric) => (
                  <button
                    key={metric.id}
                    type="button"
                    onClick={() => toggleMetric(metric.id)}
                    className={`rounded-md px-2 py-1 text-xs ${
                      metricIds.includes(metric.id) ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
                    }`}
                  >
                    {metric.name}
                    {metric.unit && <span className="text-text-dim"> ({metric.unit})</span>}
                  </button>
                ))}
              </div>
            )}

            {creatingMetric && habitIds.length === 1 ? (
              <div className="mt-2 rounded-md border border-border p-3">
                <MetricForm habitId={habitIds[0]!} onCreated={handleMetricCreated} />
              </div>
            ) : habitIds.length === 1 ? (
              <button
                type="button"
                onClick={() => setCreatingMetric(true)}
                className="mt-2 font-mono text-xs text-text-muted hover:text-primary"
              >
                + Crear métrica nueva para este hábito
              </button>
            ) : (
              availableMetrics.length === 0 && (
                <p className="text-xs text-text-dim">
                  Elige un solo hábito para poder crear una métrica nueva aquí mismo, o créala desde su
                  detalle.
                </p>
              )
            )}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Creando…" : "Crear goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
