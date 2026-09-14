ALTER TABLE public.analises
  ADD COLUMN quantidade_missoes integer NOT NULL DEFAULT 0,
  ADD COLUMN tempo_missao_min numeric NOT NULL DEFAULT 0,
  ADD COLUMN operadores_missoes integer NOT NULL DEFAULT 0;