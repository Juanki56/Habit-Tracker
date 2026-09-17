import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { deleteCheckIn, upsertCheckIn } from "../../services/check-ins.service";
import { todayLocalDate } from "../../utils/dates";
import type { HabitCheckIn } from "../../types/check-in";

interface QuickCheckActionsProps {
  habitId: string;
  todayCheckIn: HabitCheckIn | null;
  hasActivityToday: boolean;
  onChange: () => void;
}

export function QuickCheckActions({ habitId, todayCheckIn, hasActivityToday, onChange }: QuickCheckActionsProps) {
  const [submitting, setSubmitting] = useState<"completed" | "skipped" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mark(status: "completed" | "skipped") {
    setSubmitting(status);
    setError(null);
    try {
      await upsertCheckIn(habitId, { status, local_date: todayLocalDate() });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar tu progreso");
    } finally {
      setSubmitting(null);
    }
  }

  async function remove() {
    setSubmitting("remove");
    setError(null);
    try {
      await deleteCheckIn(habitId, todayLocalDate());
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos quitar el registro");
    } finally {
      setSubmitting(null);
    }
  }

  const busy = submitting !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {todayCheckIn?.status === "completed" && <p className="text-sm text-success">✓ Ya registraste hoy</p>}
        {todayCheckIn?.status === "skipped" && <p className="text-sm text-text-muted">Hoy lo saltaste — sin problema.</p>}

        {todayCheckIn?.status !== "completed" && (
          <Button onClick={() => mark("completed")} disabled={busy}>
            {submitting === "completed" ? "Guardando…" : "✓ Hecho hoy"}
          </Button>
        )}
        {todayCheckIn?.status !== "skipped" && (
          <Button variant="ghost" onClick={() => mark("skipped")} disabled={busy}>
            {submitting === "skipped" ? "Guardando…" : "Saltar hoy"}
          </Button>
        )}

        {todayCheckIn &&
          (hasActivityToday ? (
            <p className="text-xs text-text-dim">
              Tiene actividades registradas hoy — bórralas primero si quieres quitar el check-in.
            </p>
          ) : (
            <button onClick={remove} disabled={busy} className="text-xs text-text-dim hover:text-danger">
              {submitting === "remove" ? "Quitando…" : "Quitar registro de hoy"}
            </button>
          ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
