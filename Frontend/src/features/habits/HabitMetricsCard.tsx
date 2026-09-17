import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { useApiQuery } from "../../hooks/useApiQuery";
import * as habitMetricsService from "../../services/habit-metrics.service";
import * as habitActivityTypesService from "../../services/habit-activity-types.service";
import { METRIC_SOURCE_LABELS } from "../../types/habit-metric";
import { MetricForm } from "./MetricForm";

// Esto NO es un dashboard — no muestra ningún número. Una métrica es solo la
// definición de "qué sumar" para que un Goal la use; los números de verdad
// (tiempo total, racha, actividades) ya están en el Dashboard y en el propio
// hábito. Tenerlos en dos lados confundía más de lo que ayudaba.
export function HabitMetricsCard({ habitId }: { habitId: string }) {
  const { data: metrics, loading, refetch } = useApiQuery(
    (signal) => habitMetricsService.listForHabit(habitId, signal),
    [habitId]
  );
  const { data: assignedTypes } = useApiQuery(
    (signal) => habitActivityTypesService.listForHabit(habitId, signal),
    [habitId]
  );
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(metricId: string) {
    await habitMetricsService.deleteHabitMetric(habitId, metricId);
    refetch();
  }

  function activityTypeName(activityTypeId: string | null): string | null {
    if (!activityTypeId) return null;
    return assignedTypes?.find((t) => t.activity_type_id === activityTypeId)?.activity_types.name ?? null;
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="flicker font-mono text-xs tracking-widest text-primary">GOAL METRICS</p>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs text-text-muted hover:text-primary">
          {showForm ? "Cerrar" : "+ Métrica"}
        </button>
      </div>
      <p className="mt-1 text-xs text-text-dim">
        No es un dashboard — solo define qué puede medir un Goal de este hábito.
      </p>

      {!loading && (metrics?.length ?? 0) === 0 && !showForm && (
        <p className="mt-2 text-sm text-text-muted">Sin métricas todavía.</p>
      )}

      {!loading && metrics && metrics.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {metrics.map((metric) => (
            <li key={metric.id} className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                {metric.name}
                <span className="text-text-dim">
                  {" "}
                  · {METRIC_SOURCE_LABELS[metric.source_type]}
                  {metric.unit ? ` (${metric.unit})` : ""}
                  {activityTypeName(metric.activity_type_id) && ` · solo "${activityTypeName(metric.activity_type_id)}"`}
                </span>
              </span>
              <button onClick={() => handleDelete(metric.id)} className="text-xs text-text-dim hover:text-danger">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="mt-3 border-t border-border pt-3">
          <MetricForm
            habitId={habitId}
            onCreated={() => {
              setShowForm(false);
              refetch();
            }}
          />
        </div>
      )}
    </Card>
  );
}
