import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`hud-corners rounded-lg border border-border bg-surface p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-[var(--glow-primary)] ${className}`}
      {...props}
    />
  );
}
