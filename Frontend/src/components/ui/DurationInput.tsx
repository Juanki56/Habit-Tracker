import { Field, TextInput } from "./FormControls";

interface DurationInputProps {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}

// Nadie piensa su tiempo en minutos totales — "programé 2 horas" no debería
// obligarte a calcular "120" de cabeza. Horas + minutos por separado, y el
// componente hace la conversión, no tú.
export function DurationInput({ hours, minutes, onHoursChange, onMinutesChange }: DurationInputProps) {
  return (
    <Field label="Duración (opcional)">
      <div className="flex items-center gap-2">
        <TextInput
          type="number"
          min={0}
          placeholder="0"
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          className="w-full"
          aria-label="Horas"
        />
        <span className="shrink-0 text-xs text-text-dim">horas</span>
        <TextInput
          type="number"
          min={0}
          max={59}
          placeholder="0"
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          className="w-full"
          aria-label="Minutos"
        />
        <span className="shrink-0 text-xs text-text-dim">min</span>
      </div>
    </Field>
  );
}

export function durationToSeconds(hours: string, minutes: string): number | undefined {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return undefined;
  return h * 3600 + m * 60;
}

export function secondsToDuration(seconds: number | null | undefined): { hours: string; minutes: string } {
  if (!seconds) return { hours: "", minutes: "" };
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return { hours: h ? String(h) : "", minutes: m ? String(m) : "" };
}
