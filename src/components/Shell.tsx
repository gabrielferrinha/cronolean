import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoMegaG from "@/assets/megag-logo.png";

const linkBase =
  "rounded-full px-4 py-1.5 font-mono text-xs text-dim transition-colors hover:text-ink";
const linkActive = "bg-cyan/15 text-cyan ring-1 ring-cyan/40";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-abyss font-sans text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 size-[520px] rounded-full bg-cyan/20 blur-[110px]" />
        <div className="animate-rip absolute top-1/3 -right-32 size-[560px] rounded-full bg-cyan/10 blur-[130px]" />
        <div className="animate-rip-slow absolute bottom-0 left-1/3 size-[420px] rounded-full bg-clear/10 blur-[120px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.05]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <header className="flex flex-wrap items-center justify-between gap-4 py-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoMegaG}
              alt="Mega G"
              className="h-10 w-auto rounded-md bg-white/90 p-1"
            />
            <div className="leading-none">
              <div className="font-display text-lg tracking-[0.18em]">
                CRONO<span className="text-cyan">LEAN</span>
                <span className="text-signal">MAUÁ</span>
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.28em] text-dim uppercase">
                mega g · miudezas secas
              </div>
            </div>
          </Link>
          <nav className="ring-line flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 backdrop-blur-sm">
            <Link to="/" className={linkBase} activeProps={{ className: linkActive }} activeOptions={{ exact: true }}>
              Nova análise
            </Link>
            <Link to="/banco" className={linkBase} activeProps={{ className: linkActive }}>
              Banco de tempos
            </Link>
            <Link to="/historico" className={linkBase} activeProps={{ className: linkActive }}>
              Histórico
            </Link>
          </nav>
        </header>
        <main className="pb-16">{children}</main>
      </div>
    </div>
  );
}
