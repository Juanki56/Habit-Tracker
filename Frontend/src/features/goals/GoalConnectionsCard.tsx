import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/FormControls";
import * as goalsService from "../../services/goals.service";
import { listHabits } from "../../services/habits.service";
import * as habitMetricsService from "../../services/habit-metrics.service";
import { MetricForm } from "../habits/MetricForm";
import type { GoalWithRelations } from "../../types/goal";
import type { Habit } from "../../types/habit";
import type { HabitMetric } from "../../types/habit-metric";

interface GoalConnectionsCardProps {
  goal: GoalWithRelations;
  onChange: () => void;
}

// Conecta el goal con hábitos y sus métricas DESPUÉS de creado — al crearlo solo
// se puede elegir una vez; esto es lo que faltaba para poder ajustarlo después
// (ej. si la métrica se creó después que el goal).
export function GoalConnectionsCard({ goal, onChange }: GoalConnectionsCardProps) {
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [metricsByHabit, setMetricsByHabit] = useState<Record<string, HabitMetric[]>>({});
  const [busy, setBusy] = useState(false);
  const [creatingMetricHabitId, setCreatingMetricHabitId] = useState<string | null>(null);

  useEffect(() => {
    listHabits(true).then(setAllHabits);
  }, []);

  useEffect(() => {
    goal.habits.forEach((habit) => {
      if (metricsByHabit[habit.id]) return;
      habitMetricsService.listForHabit(habit.id).then((metrics) => {
        setMetricsByHabit((prev) => ({ ...prev, [habit.id]: metrics }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.habits]);

  const unlinkedHabits = allHabits.filter((h) => !goal.habits.some((gh) => gh.id === h.id));
  const linkedMetricIds = new Set(goal.metrics.map((m) => m.id));
  const availableMetrics = goal.habits.flatMap((h) => metricsByHabit[h.id] ?? []);
  const unlinkedMetrics = availableMetrics.filter((m) => !linkedMetricIds.has(m.id));

  async function handleAttachHabit(habitId: string) {
    if (!habitId) return;
    setBusy(true);
    try {
      await goalsService.attachHabit(goal.id, habitId);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function handleDetachHabit(habitId: string) {
    setBusy(true);
    try {
      await goalsService.detachHabit(goal.id, habitId);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function handleAttachMetric(metricId: string) {
    if (!metricId) return;

    // El goal no convierte unidades — solo suma lo que la métrica calcula.
    // Si las unidades no coinciden, el total mezclado no significa nada, así
    // que se avisa aquí en vez de dejar que pase en silencio.
    const metric = availableMetrics.find((m) => m.id === metricId);
    if (metric?.unit && goal.unit && metric.unit !== goal.unit) {
      const proceed = confirm(
        `Esta métrica mide en "${metric.unit}", pero el goal está en "${goal.unit}". Si las unidades no coinciden, el número no va a tener sentido. ¿Agregarla de todas formas?`
      );
      if (!proceed) return;
    }

    setBusy(true);
    try {
      await goalsService.attachMetric(goal.id, metricId);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function handleDetachMetric(metricId: string) {
    setBusy(true);
    try {
      await goalsService.detachMetric(goal.id, metricId);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function handleMetricCreated(metric: HabitMetric) {
    setMetricsByHabit((prev) => ({ ...prev, [metric.habit_id]: [...(prev[metric.habit_id] ?? []), metric] }));
    setCreatingMetricHabitId(null);
    await handleAttachMetric(metric.id);
  }

  return (
    <Card className="mt-6 max-w-md">
      <p className="flicker font-mono text-xs tracking-widest text-primary">CONTRIBUTING HABITS</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {goal.habits.map((habit) => (
          <span
            key={habit.id}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-sm text-primary"
          >
            <Link to={`/habits/${habit.id}`} className="hover:underline">
              {habit.name}
            </Link>
            <button onClick={() => handleDetachHabit(habit.id)} disabled={busy} className="hover:text-danger">
              ✕
            </button>
          </span>
        ))}
        {goal.habits.length === 0 && <p className="text-sm text-text-dim">Ninguno todavía.</p>}
      </div>
      {unlinkedHabits.length > 0 && (
        <Select
          value=""
          disabled={busy}
          onChange={(e) => handleAttachHabit(e.target.value)}
          className="mt-2 text-sm"
        >
          <option value="">+ Agregar hábito…</option>
          {unlinkedHabits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Select>
      )}

      <p className="mt-5 flicker font-mono text-xs tracking-widest text-primary">METRICS</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {goal.metrics.map((metric) => (
          <span
            key={metric.id}
            className="flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-sm text-text-muted"
          >
            {metric.name} {metric.unit ? `(${metric.unit})` : ""}
            <button onClick={() => handleDetachMetric(metric.id)} disabled={busy} className="hover:text-danger">
              ✕
            </button>
          </span>
        ))}
        {goal.metrics.length === 0 && (
          <p className="text-sm text-text-dim">
            Ninguna todavía — el progreso no se puede calcular sin al menos una.
          </p>
        )}
      </div>
      {unlinkedMetrics.length > 0 && (
        <Select
          value=""
          disabled={busy}
          onChange={(e) => handleAttachMetric(e.target.value)}
          className="mt-2 text-sm"
        >
          <option value="">+ Agregar métrica…</option>
          {unlinkedMetrics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.unit ? ` (${m.unit})` : ""}
            </option>
          ))}
        </Select>
      )}
      {goal.habits.length > 0 &&
        (creatingMetricHabitId ? (
          <div className="mt-3 rounded-md border border-border p-3">
            <MetricForm habitId={creatingMetricHabitId} onCreated={handleMetricCreated} />
          </div>
        ) : goal.habits.length === 1 ? (
          <button
            type="button"
            onClick={() => setCreatingMetricHabitId(goal.habits[0]!.id)}
            className="mt-2 font-mono text-xs text-text-muted hover:text-primary"
          >
            + Crear métrica nueva
          </button>
        ) : (
          <Select
            value=""
            disabled={busy}
            onChange={(e) => e.target.value && setCreatingMetricHabitId(e.target.value)}
            className="mt-2 text-sm"
          >
            <option value="">+ Crear métrica nueva para…</option>
            {goal.habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        ))}
    </Card>
  );
}
