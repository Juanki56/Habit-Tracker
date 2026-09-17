interface ProgressBarProps {
  value: number;
  max: number;
  tone?: "primary" | "success";
}

// El progreso es puramente informativo: nunca bloquea ni marca "fallo" al no llegar al 100%.
export function ProgressBar({ value, max, tone = "primary" }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = tone === "success" ? "bg-success" : "bg-primary";
  const glow = tone === "success" ? "var(--glow-secondary)" : "var(--glow-primary)";

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full border border-border bg-surface-elevated"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-shimmer h-full rounded-full transition-[width] duration-700 ease-out ${barColor}`}
        style={{ width: `${percent}%`, boxShadow: percent > 0 ? glow : undefined }}
      />
    </div>
  );
}
