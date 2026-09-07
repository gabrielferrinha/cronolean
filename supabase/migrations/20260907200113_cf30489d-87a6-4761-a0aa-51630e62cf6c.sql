CREATE TABLE public.analises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  turno text NOT NULL,
  linha_nome text NOT NULL,
  demanda integer NOT NULL,
  pessoas_disponiveis integer NOT NULL,
  horas_disponiveis numeric NOT NULL,
  pausas_min numeric NOT NULL DEFAULT 0,
  almoco_min numeric NOT NULL DEFAULT 0,
  tempo_disponivel_min numeric NOT NULL,
  takt_min numeric NOT NULL,
  tempo_total_min numeric NOT NULL,
  operadores_teoricos numeric NOT NULL,
  operadores_necessarios integer NOT NULL,
  diferenca integer NOT NULL,
  resultado text NOT NULL,
  observacao text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.analises TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analises TO authenticated;
GRANT ALL ON public.analises TO service_role;

ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analises_select_all" ON public.analises FOR SELECT USING (true);
CREATE POLICY "analises_insert_all" ON public.analises FOR INSERT WITH CHECK (true);
CREATE POLICY "analises_delete_all" ON public.analises FOR DELETE USING (true);

CREATE INDEX analises_created_at_idx ON public.analises (created_at DESC);