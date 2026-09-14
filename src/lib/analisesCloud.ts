import { supabase } from "@/integrations/supabase/client";
import type { Analise } from "@/lib/crono";

export const TURNOS = ["1º turno", "2º turno", "3º turno"] as const;
export type Turno = (typeof TURNOS)[number];

export type AnaliseSalva = Analise & { turno: string };

/** Sugere o turno pelo horário atual */
export function turnoSugerido(d = new Date()): Turno {
  const h = d.getHours();
  if (h >= 6 && h < 14) return "1º turno";
  if (h >= 14 && h < 22) return "2º turno";
  return "3º turno";
}

export async function salvarAnaliseNaNuvem(a: Analise, turno: string) {
  const { error } = await supabase.from("analises").insert({
    turno,
    linha_nome: a.linhaNome,
    demanda: Math.round(a.demanda),
    pessoas_disponiveis: Math.round(a.pessoasDisponiveis),
    horas_disponiveis: a.horasDisponiveis,
    pausas_min: a.pausasMin,
    almoco_min: a.almocoMin,
    tempo_disponivel_min: a.tempoDisponivelMin,
    takt_min: a.taktMin,
    tempo_total_min: a.tempoTotalMin,
    operadores_teoricos: a.operadoresTeoricos,
    operadores_necessarios: a.operadoresNecessarios,
    diferenca: a.diferenca,
    resultado: a.resultado,
    quantidade_missoes: a.quantidadeMissoes,
    tempo_missao_min: a.tempoMissaoMin,
    operadores_missoes: a.operadoresMissoes,
  });
  if (error) throw error;
}

export async function listarAnalises(): Promise<AnaliseSalva[]> {
  const { data, error } = await supabase
    .from("analises")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    data: r.created_at,
    turno: r.turno,
    linhaId: "",
    linhaNome: r.linha_nome,
    demanda: Number(r.demanda),
    pessoasDisponiveis: Number(r.pessoas_disponiveis),
    horasDisponiveis: Number(r.horas_disponiveis),
    pausasMin: Number(r.pausas_min),
    almocoMin: Number(r.almoco_min),
    tempoDisponivelMin: Number(r.tempo_disponivel_min),
    taktMin: Number(r.takt_min),
    tempoTotalMin: Number(r.tempo_total_min),
    operadoresTeoricos: Number(r.operadores_teoricos),
    operadoresNecessarios: Number(r.operadores_necessarios),
    diferenca: Number(r.diferenca),
    resultado: r.resultado,
    quantidadeMissoes: Number(r.quantidade_missoes ?? 0),
    tempoMissaoMin: Number(r.tempo_missao_min ?? 0),
    operadoresMissoes: Number(r.operadores_missoes ?? 0),
  }));
}

export async function excluirAnalise(id: string) {
  const { error } = await supabase.from("analises").delete().eq("id", id);
  if (error) throw error;
}
