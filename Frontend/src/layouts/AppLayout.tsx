import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { GlitchText } from "../components/ui/GlitchText";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/habits", label: "Hábitos" },
  { to: "/resources", label: "Recursos" },
  { to: "/goals", label: "Goals" },
  { to: "/notes", label: "Notas" },
  { to: "/vocabulary", label: "Vocabulario" },
  { to: "/tags", label: "Tags" },
];

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col lg:flex-row">
      <aside className="glitch-surface relative flex shrink-0 flex-row items-center justify-between border-b border-border bg-surface px-4 py-3 lg:w-56 lg:flex-col lg:items-stretch lg:justify-start lg:border-r lg:border-b-0 lg:px-5 lg:py-6 lg:shadow-[4px_0_24px_-8px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
        <div className="mb-0 lg:mb-8">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <p className="flicker font-mono text-xs tracking-widest text-primary">SYSTEM ONLINE</p>
          </div>
          <GlitchText as="p" className="mt-1 font-semibold text-text">
            Habit Tracker
          </GlitchText>
        </div>

        <nav className="flex gap-1 lg:flex-col">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `group relative overflow-hidden rounded-md px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 bg-primary transition-all duration-200 ${
                      isActive ? "opacity-100 shadow-[var(--glow-primary)]" : "opacity-0 group-hover:opacity-60"
                    }`}
                  />
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:mt-auto lg:block">
          <p className="truncate font-mono text-[10px] text-text-dim">{user?.email}</p>
          <button
            onClick={() => void signOut()}
            className="mt-2 font-mono text-[10px] tracking-wide text-text-muted uppercase underline-offset-2 hover:text-danger hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
