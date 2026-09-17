import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Select, TextInput } from "../../components/ui/FormControls";
import { useApiQuery } from "../../hooks/useApiQuery";
import { createSchedule, getCurrentSchedule } from "../../services/habit-schedules.service";
import type { FrequencyType } from "../../types/habit-schedule";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: "Todos los días",
  weekly: "Veces por semana",
  monthly: "Veces por mes",
  interval: "Cada N días",
};

export function HabitScheduleCard({ habitId }: { habitId: string }) {
  const { data: schedule, loading, refetch } = useApiQuery(
    (signal) => getCurrentSchedule(habitId, signal),
    [habitId]
  );
  const [editing, setEditing] = useState(false);

  if (loading) return null;

  if (!editing && schedule) {
    return (
      <Card>
        <p className="flicker font-mono text-xs tracking-widest text-primary">SCHEDULE</p>
        <p className="mt-1 text-text">
          {FREQUENCY_LABELS[schedule.frequency_type]}
          {schedule.target_occurrences ? ` · ${schedule.target_occurrences}` : ""}
          {schedule.interval_days ? ` · cada ${schedule.interval_days} días` : ""}
        </p>
        {schedule.days.length > 0 && (
          <p className="mt-1 text-sm text-text-muted">
            {schedule.days.map((d) => DAY_LABELS[d - 1]).join(", ")}
          </p>
        )}
        <button onClick={() => setEditing(true)} className="mt-2 text-xs text-text-muted hover:text-primary">
          Cambiar horario
        </button>
      </Card>
    );
  }

  if (!editing) {
    return (
      <Card>
        <p className="flicker font-mono text-xs tracking-widest text-primary">SCHEDULE</p>
        <p className="mt-1 text-sm text-text-muted">Sin horario configurado.</p>
        <Button variant="ghost" className="mt-2" onClick={() => setEditing(true)}>
          Configurar horario
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <ScheduleForm
        habitId={habitId}
        onDone={() => {
          setEditing(false);
          refetch();
        }}
        onCancel={() => setEditing(false)}
      />
    </Card>
  );
}

function ScheduleForm({
  habitId,
  onDone,
  onCancel,
}: {
  habitId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [targetOccurrences, setTargetOccurrences] = useState("3");
  const [intervalDays, setIntervalDays] = useState("2");
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleDay(day: number) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await createSchedule(habitId, {
        frequency_type: frequencyType,
        target_occurrences:
          frequencyType === "weekly" || frequencyType === "monthly" ? Number(targetOccurrences) : undefined,
        interval_days: frequencyType === "interval" ? Number(intervalDays) : undefined,
        days: frequencyType === "weekly" && days.length > 0 ? days : undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el horario");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flicker font-mono text-xs tracking-widest text-primary">SCHEDULE</p>

      <Field label="Frecuencia">
        <Select value={frequencyType} onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}>
          {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      {(frequencyType === "weekly" || frequencyType === "monthly") && (
        <Field label="Cuántas veces">
          <TextInput
            type="number"
            min={1}
            max={frequencyType === "weekly" ? 7 : undefined}
            value={targetOccurrences}
            onChange={(e) => setTargetOccurrences(e.target.value)}
          />
        </Field>
      )}

      {frequencyType === "interval" && (
        <Field label="Cada cuántos días">
          <TextInput type="number" min={1} value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} />
        </Field>
      )}

      {frequencyType === "weekly" && (
        <div className="flex flex-wrap gap-1">
          {DAY_LABELS.map((label, index) => {
            const day = index + 1;
            const active = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-md px-2 py-1 text-xs ${
                  active ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
