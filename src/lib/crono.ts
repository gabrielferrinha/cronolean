export type Atividade = {
  id: string;
  linhaId: string;
  numero: number;
  nome: string;
  /** ciclos em segundos; null = ciclo vazio (não entra na média) */
  ciclos: (number | null)[];
};

export type Linha = { id: string; nome: string };

export type Analise = {
  id: string;
  data: string;
  linhaId: string;
  linhaNome: string;
  demanda: number;
  pessoasDisponiveis: number;
  horasDisponiveis: number;
  pausasMin: number;
  almocoMin: number;
  tempoDisponivelMin: number;
  taktMin: number;
  tempoTotalMin: number;
  operadoresTeoricos: number;
  operadoresNecessarios: number;
  diferenca: number;
  resultado: string;
};

/** Padrões da planilha original */
export const PAUSAS_PADRAO = 20;
export const ALMOCO_PADRAO = 60;

const KEY_LINHAS = "crono.linhas";
const KEY_ATIVIDADES = "crono.atividades";
const KEY_HISTORICO = "crono.historico";

export const LINHA_PADRAO: Linha = { id: "l1", nome: "Linha 01 · Miudezas secas" };

const SEED: Atividade[] = [
  {
    id: "a1",
    linhaId: "l1",
    numero: 1,
    nome: "Pegar pallet e chapa de aço",
    ciclos: [95, 120, 139, 77, 63, 180, 131, 43, 83, 114],
  },
  {
    id: "a2",
    linhaId: "l1",
    numero: 2,
    nome: "Separação",
    ciclos: [460, 536, 520, 619, 552, 410, 632, 591, 543, 497],
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const getLinhas = () => read<Linha[]>(KEY_LINHAS, [LINHA_PADRAO]);
export const setLinhas = (l: Linha[]) => write(KEY_LINHAS, l);
export const getAtividades = () => read<Atividade[]>(KEY_ATIVIDADES, SEED);
export const setAtividades = (a: Atividade[]) => write(KEY_ATIVIDADES, a);
export const getHistorico = () => read<Analise[]>(KEY_HISTORICO, []);
export const setHistorico = (h: Analise[]) => write(KEY_HISTORICO, h);

export function mediaSegundos(ciclos: (number | null)[]): number {
  const vals = ciclos.filter((c): c is number => typeof c === "number" && !Number.isNaN(c));
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function tempoTotalMin(atividades: Atividade[]): number {
  return atividades.reduce((sum, a) => sum + mediaSegundos(a.ciclos), 0) / 60;
}

export function calcular(params: {
  demanda: number;
  pessoasDisponiveis: number;
  horasDisponiveis: number;
  atividades: Atividade[];
}) {
  const { demanda, pessoasDisponiveis, horasDisponiveis, atividades } = params;
  const tempoDisponivelMin = horasDisponiveis * 60;
  const taktMin = demanda > 0 ? tempoDisponivelMin / demanda : 0;
  const total = tempoTotalMin(atividades);
  const teoricos = taktMin > 0 ? total / taktMin : 0;
  const necessarios = Math.ceil(teoricos - 1e-9);
  const diferenca = pessoasDisponiveis - necessarios;
  const resultado =
    diferenca < 0
      ? `Faltam ${Math.abs(diferenca)} pessoa${Math.abs(diferenca) > 1 ? "s" : ""}`
      : diferenca > 0
        ? `Sobram ${diferenca} pessoa${diferenca > 1 ? "s" : ""}`
        : "Equipe exata";
  return {
    tempoDisponivelMin,
    taktMin,
    tempoTotalMin: total,
    operadoresTeoricos: teoricos,
    operadoresNecessarios: necessarios,
    diferenca,
    resultado,
  };
}

export function fmtMMSS(segundos: number): string {
  if (!segundos || segundos < 0) return "00:00";
  const s = Math.round(segundos);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Aceita "1:35", "95", "00:01:35" e devolve segundos (null se vazio) */
export function parseTempo(valor: string): number | null {
  const v = valor.trim();
  if (!v) return null;
  const partes = v.split(":").map((p) => Number(p.replace(",", ".")));
  if (partes.some((n) => Number.isNaN(n))) return null;
  return partes.reduce((acc, n) => acc * 60 + n, 0);
}

export function fmtNum(n: number, casas = 2): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
