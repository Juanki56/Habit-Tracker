import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-bg hover:shadow-[var(--glow-primary)] focus-visible:outline-primary",
  ghost:
    "bg-transparent text-text border border-border hover:border-primary hover:text-primary hover:shadow-[var(--glow-primary)] focus-visible:outline-primary",
  danger:
    "bg-transparent text-danger border border-danger/40 hover:border-danger hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-danger)_50%,transparent)] focus-visible:outline-danger",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`btn-cyber inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-semibold tracking-wide uppercase transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
