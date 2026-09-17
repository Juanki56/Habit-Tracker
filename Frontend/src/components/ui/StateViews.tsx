import type { ReactNode } from "react";
import { GlitchText } from "./GlitchText";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="hud-corners flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface/40 py-12 text-center">
      <p className="font-mono text-[10px] tracking-[0.3em] text-text-dim">NO DATA</p>
      <p className="font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="hud-corners flex flex-col items-center gap-3 rounded-lg border border-danger/40 bg-danger/5 py-10 text-center">
      <GlitchText as="p" className="font-mono text-[10px] tracking-[0.3em] text-danger">
        SYSTEM ERROR
      </GlitchText>
      <p className="max-w-sm text-sm text-text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-cyber rounded-md border border-danger/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-danger transition-all hover:border-danger hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-danger)_50%,transparent)]"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-elevated">
        <div className="h-full w-1/3 animate-[loading-scan_1.1s_ease-in-out_infinite] rounded-full bg-primary shadow-[var(--glow-primary)]" />
      </div>
      <p className="font-mono text-[10px] tracking-[0.3em] text-text-dim">
        LOADING<span className="animate-pulse">_</span>
      </p>
    </div>
  );
}
