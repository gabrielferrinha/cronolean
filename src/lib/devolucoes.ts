export const DEVOLUCOES_PERIODO = "jul–set/2026";

export const DEVOLUCOES_RESUMO = {
  valorTotal: 51438.93,
  linhasProduto: 174,
  notas: 111,
};

export const DEVOLUCOES_POR_MES = [
  { periodo: "Jul", valor: 26147.55 },
  { periodo: "Ago", valor: 9623.3 },
  { periodo: "Set", valor: 15668.08 },
];

export const DEVOLUCOES_POR_TURNO = [
  { turno: "Dia", valor: 28829.39, linhasProduto: 113, notas: 73 },
  { turno: "Noite", valor: 22609.54, linhasProduto: 61, notas: 38 },
] as const;

export const DEVOLUCOES_POR_LINHA = [
  { linha: "Resfriado padrão", valor: 7975.77, linhasProduto: 10, notas: 10 },
  { linha: "Peso variável", valor: 7525.87, linhasProduto: 17, notas: 15 },
  { linha: "Grandeza", valor: 6580.33, linhasProduto: 21, notas: 18 },
  { linha: "Congelados — coletor", valor: 5426.76, linhasProduto: 8, notas: 8 },
  { linha: "Miudeza frágil resfriado", valor: 4930.21, linhasProduto: 21, notas: 20 },
  { linha: "Miudeza", valor: 4347.89, linhasProduto: 26, notas: 22 },
  { linha: "Fracionado — mapa", valor: 3040.6, linhasProduto: 34, notas: 29 },
] as const;

export const DEVOLUCOES_SEM_LINHA = 6789.55;

export const DEVOLUCOES_FONTE =
  "Planilha Devolução.xlsx, aba BASE, 174 itens emitidos de julho a setembro de 2026.";