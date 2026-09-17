import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { GlitchText } from "../components/ui/GlitchText";
import { Field, TextInput } from "../components/ui/FormControls";

export function LoginPage() {
  const { session, loading, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "sign-in") {
        await signInWithPassword(email, password);
      } else {
        const { needsEmailConfirmation } = await signUpWithPassword(email, password);
        if (needsEmailConfirmation) {
          setInfo("Cuenta creada. Revisa tu correo y confirma el enlace para poder entrar.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <p className="flicker font-mono text-xs tracking-[0.3em] text-primary">HABIT.SYS</p>
          </div>
          <GlitchText as="h1" active className="text-3xl font-bold text-text">
            HABIT TRACKER
          </GlitchText>
        </div>

        <Card className="glitch-surface">
          <p className="font-mono text-xs tracking-widest text-secondary">SYSTEM ACCESS</p>
          <h2 className="mt-1 mb-6 text-xl font-semibold text-text">
            {mode === "sign-in" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Correo">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Contraseña">
              <TextInput
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {info && <p className="text-sm text-success">{info}</p>}
            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={submitting} className="mt-1 w-full">
              {submitting ? "Un momento…" : mode === "sign-in" ? "Entrar" : "Registrarme"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            className="mt-4 font-mono text-xs text-text-muted hover:text-primary"
          >
            {mode === "sign-in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </Card>
      </div>
    </div>
  );
}
