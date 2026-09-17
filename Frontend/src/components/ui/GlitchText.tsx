import type { ElementType, ReactNode } from "react";

interface GlitchTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  active?: boolean;
}

// El glitch de aberración cromática (ver .glitch en index.css) solo se ve en
// hover/focus por defecto — `active` lo fuerza para un disparo puntual (ej. al
// completar una acción), nunca queda encendido todo el tiempo.
export function GlitchText({ children, as: Tag = "span", className = "", active = false }: GlitchTextProps): ReactNode {
  return (
    <Tag data-text={children} className={`glitch ${active ? "glitch-active" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
