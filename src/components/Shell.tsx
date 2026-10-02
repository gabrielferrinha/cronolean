import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import logoMegaG from "@/assets/megag-logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const linkBase =
  "rounded-lg px-2 py-2 text-center font-mono text-xs text-dim transition-colors hover:text-ink sm:rounded-full sm:px-4 sm:py-1.5";
const linkActive = "bg-cyan/15 text-cyan ring-1 ring-cyan/40";

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-abyss font-sans text-ink">
      <div aria-hidden="true" className="no-print pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 size-[520px] rounded-full bg-cyan/10 blur-[110px]" />
        <div className="animate-rip absolute top-1/3 -right-32 size-[560px] rounded-full bg-clear/10 blur-[130px]" />
        <div className="animate-rip-slow absolute bottom-0 left-1/3 size-[420px] rounded-full bg-signal/10 blur-[120px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.04]" />
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
                MEGA G · NOW
              </div>
            </div>
          </Link>
          <nav className="no-print ring-line grid w-full grid-cols-3 items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 sm:flex sm:w-auto sm:rounded-full">
            <Link to="/" className={linkBase} activeProps={{ className: linkActive }} activeOptions={{ exact: true }}>
              Nova análise
            </Link>
            <Link to="/banco" className={linkBase} activeProps={{ className: linkActive }}>
              Banco de tempos
            </Link>
            <Link to="/indicadores" className={linkBase} activeProps={{ className: linkActive }}>
              Indicadores
            </Link>
            <Link to="/custos" className={linkBase} activeProps={{ className: linkActive }}>
              Custos
            </Link>
            <Link to="/historico" className={linkBase} activeProps={{ className: linkActive }}>
              Histórico
            </Link>
            <Link to="/referencias" className={linkBase} activeProps={{ className: linkActive }}>
              Referências
            </Link>
            <div className="col-span-2 flex items-center justify-center gap-2 border-t border-line pt-1 sm:col-auto sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-dim"><UserRound className="size-3.5" /> Operador 1</span>
              <Button type="button" variant="ghost" size="icon" onClick={signOut} aria-label="Sair" title="Sair" className="size-8 text-dim hover:text-ink"><LogOut /></Button>
            </div>
          </nav>
        </header>
        <main className="pb-16">{children}</main>
      </div>
    </div>
  );
}
