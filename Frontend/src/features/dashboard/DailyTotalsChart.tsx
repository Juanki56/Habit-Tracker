import type { DailyTotal } from "../../types/dashboard";

// Barras simples y sin librería de charts — con pocos días esto es más que suficiente
// y evita sumar una dependencia solo para esto (regla del proyecto: nada de deps innecesarias).
export function DailyTotalsChart({ dailyTotals }: { dailyTotals: DailyTotal[] }) {
  if (dailyTotals.length === 0) return null;

  const max = Math.max(...dailyTotals.map((d) => d.total_duration_seconds), 1);

  return (
    <div className="flex h-24 items-end gap-1">
      {dailyTotals.map((day) => {
        const height = Math.max(4, Math.round((day.total_duration_seconds / max) * 96));
        return (
          <div key={day.local_date} className="flex flex-1 flex-col items-center gap-1" title={day.local_date}>
            <div className="w-full rounded-t bg-primary/60" style={{ height }} />
          </div>
        );
      })}
    </div>
  );
}
