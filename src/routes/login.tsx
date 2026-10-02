import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import logoMegaG from "@/assets/megag-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signInOperator } from "@/lib/operator-auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso do operador — CronoLeanMaua" },
      { name: "description", content: "Acesso reservado ao sistema de cronoanálise e dimensionamento CronoLeanMaua." },
      { property: "og:title", content: "Acesso do operador — CronoLeanMaua" },
      { property: "og:description", content: "Área de acesso ao sistema operacional CronoLeanMaua." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const authenticate = useServerFn(signInOperator);
  const [username, setUsername] = useState("Operador 1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authenticate({ data: { username, password } });
      if (!result.ok) {
        setError("Usuário ou senha incorretos.");
        return;
      }
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: result.email,
        token: result.accessToken,
        type: "magiclink",
      });
      if (verifyError || !data.session) throw verifyError ?? new Error("Sessão não iniciada");
      await navigate({ to: "/", replace: true });
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-5 py-10 font-sans text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-[0.035]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-cyan" />
      </div>
      <section className="animate-rise relative w-full max-w-md rounded-lg border border-line bg-deep p-7 shadow-xl sm:p-9">
        <div className="mb-8 flex items-center gap-4 border-b border-line pb-6">
          <img src={logoMegaG} alt="Mega G" className="h-14 w-auto rounded-md bg-white p-1.5 ring-1 ring-line" />
          <div>
            <div className="font-display text-2xl tracking-[0.12em]">CRONO<span className="text-cyan">LEAN</span><span className="text-signal">MAUÁ</span></div>
            <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Acesso operacional</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-3xl">Entrar no sistema</h1>
          <p className="mt-2 text-sm text-dim">Identifique-se para acessar as análises da operação.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-mono text-[11px] tracking-[0.16em] text-dim uppercase">Usuário</Label>
            <div className="relative">
              <UserRound aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" />
              <Input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="h-11 bg-background pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-[11px] tracking-[0.16em] text-dim uppercase">Senha</Label>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" />
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 bg-background pr-11 pl-10" autoFocus />
              <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} title={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((current) => !current)} className="absolute top-1/2 right-1 -translate-y-1/2 text-dim">
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          <div aria-live="polite" className="min-h-5">
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>

          <Button type="submit" disabled={loading || !username.trim() || !password} className="h-11 w-full bg-cyan font-semibold text-primary-foreground hover:bg-cyan/90">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="mt-7 border-t border-line pt-5 text-center font-mono text-[10px] tracking-[0.14em] text-dim uppercase">Mega G · Ambiente interno</p>
      </section>
    </main>
  );
}