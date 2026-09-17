import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GlitchText } from "./GlitchText";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      style={{ animation: "backdrop-in 0.15s ease-out" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="glitch-surface hud-corners max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-primary/30 bg-surface p-6 shadow-[var(--glow-primary)]"
        style={{ animation: "modal-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <GlitchText as="h2" className="font-mono text-sm font-semibold tracking-wide text-text uppercase">
            {title}
          </GlitchText>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-danger"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
