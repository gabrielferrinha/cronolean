import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) navigate({ to: "/login", replace: true });
      else setAllowed(true);
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (!allowed) {
    return <div className="flex min-h-screen items-center justify-center bg-abyss font-mono text-xs text-dim">Verificando acesso…</div>;
  }
  return children;
}