import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Clock3, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/Shell";
import {
  DEVOLUCOES_FONTE,
  DEVOLUCOES_PERIODO,
  DEVOLUCOES_POR_LINHA,
  DEVOLUCOES_POR_MES,
  DEVOLUCOES_POR_TURNO,
  DEVOLUCOES_RESUMO,
  DEVOLUCOES_SEM_LINHA,
} from "@/lib/devolucoes";

export const Route = createFileRoute("/custos")({
  head: () => ({
    meta: [
      { title: "Custos por devolução — CronoLeanMaua" },
      {
        name: "description",
        content: "Custo observado de devoluções por atraso logístico e de transporte, por mês, turno e linha de separação.",
      },
      { property: "og:title", content: "Custos por devolução — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Painel do custo de devoluções por atraso, com recortes por mês, turno e linha de separação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Custos,
});

const chartColors = {
  warning: "var(--color-signal)",
  muted: "var(--color-dim)",
  grid: "var(--color-line)",
};

function Custos() {
  return (
    <Shell>
      <div className="space-y-5">
        <section className="animate-rise border-b border-line pb-5">
          <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Visão gerencial</div>
          <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">Custos por devolução</h1>
          <p className="mt-2 max-w-2xl text-sm text-dim">
            O custo observado de devoluções por atraso, com recorte por mês, turno e linha de separação.
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <h2 className="font-display text-xl tracking-wide">O que é esse custo</h2>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            É o valor de mercadorias <strong className="text-ink">devolvidas por atraso</strong> — pedidos que não
            saíram no prazo e voltaram, gerando perda para a operação. É um custo <strong className="text-ink">observado</strong>,
            registrado na base de devoluções de <strong className="text-ink">{DEVOLUCOES_PERIODO}</strong> (fonte: {DEVOLUCOES_FONTE}).
          </p>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            Não é uma economia estimada pelo CronoLeanMaua. A relação entre o dimensionamento de equipe e a redução
            dessas devoluções precisa ser comprovada comparando, por linha e turno, o número real de pessoas com o
            recomendado pelo app e o horário de saída da carga.
          </p>
        </section>

        <section className="space-y-4 border-b border-line pb-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] tracking-[0.24em] text-signal uppercase">Custo do atraso</div>
              <h2 className="mt-2 font-display text-2xl leading-none tracking-tight">Devoluções por atraso</h2>
            </div>
            <span className="font-mono text-xs text-dim">{DEVOLUCOES_PERIODO}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Indicador icon={AlertTriangle} label="Valor devolvido" value={moeda(DEVOLUCOES_RESUMO.valorTotal)} detail={`${DEVOLUCOES_RESUMO.notas} notas com atraso`} />
            <Indicador icon={Clock3} label="Turno noite" value={percentual(DEVOLUCOES_POR_TURNO[1].valor, DEVOLUCOES_RESUMO.valorTotal)} detail={`${moeda(DEVOLUCOES_POR_TURNO[1].valor)} do valor devolvido`} />
            <Indicador icon={TrendingDown} label="Maior linha" value={moeda(DEVOLUCOES_POR_LINHA[0].valor)} detail={`${DEVOLUCOES_POR_LINHA[0].linha} · ${DEVOLUCOES_POR_LINHA[0].notas} notas`} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Painel titulo="Devoluções por mês" subtitulo="Valor devolvido por atrasos logísticos e de transporte">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEVOLUCOES_POR_MES} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={valorAbreviado} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(valor) => moeda(Number(valor))} />
                  <Bar dataKey="valor" name="Valor devolvido" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Painel>

          <Painel titulo="Recorte por turno" subtitulo="Turnos cadastrados na planilha de devoluções">
            <div className="space-y-4">
              {DEVOLUCOES_POR_TURNO.map((item) => (
                <div key={item.turno} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.turno}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">{moeda(item.valor)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-xs text-dim">
                    <span>{item.notas} notas · {item.linhasProduto} itens</span>
                    <span>{percentual(item.valor, DEVOLUCOES_RESUMO.valorTotal)} do valor</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-abyss/40">
                    <div className="h-full rounded-full bg-signal" style={{ width: larguraPercentual(item.valor, DEVOLUCOES_RESUMO.valorTotal) }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-lg bg-signal/10 p-3 text-xs leading-relaxed text-signal ring-1 ring-signal/25">
              A planilha usa Dia e Noite. Eles não foram convertidos automaticamente para 1º, 2º e 3º turnos do CronoLeanMaua.
            </p>
          </Painel>
        </div>

        <Painel titulo="Linhas com maior valor devolvido" subtitulo="Prioridade sugerida para comparar equipe real, equipe recomendada e saída da carga">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] tracking-wider text-dim uppercase">
                  <th className="px-2 py-3 text-left font-normal">Linha de separação</th>
                  <th className="px-2 py-3 text-right font-normal">Notas</th>
                  <th className="px-2 py-3 text-right font-normal">Itens</th>
                  <th className="px-2 py-3 text-right font-normal">Valor devolvido</th>
                  <th className="px-2 py-3 text-right font-normal">Participação</th>
                </tr>
              </thead>
              <tbody>
                {DEVOLUCOES_POR_LINHA.map((item, indice) => (
                  <tr key={item.linha} className="border-b border-line last:border-0">
                    <td className="px-2 py-3 font-medium"><span className="mr-3 font-mono text-xs text-dim">{String(indice + 1).padStart(2, "0")}</span>{item.linha}</td>
                    <td className="px-2 py-3 text-right">{item.notas}</td>
                    <td className="px-2 py-3 text-right">{item.linhasProduto}</td>
                    <td className="px-2 py-3 text-right font-semibold">{moeda(item.valor)}</td>
                    <td className="px-2 py-3 text-right text-dim">{percentual(item.valor, DEVOLUCOES_RESUMO.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-dim">
            <span>Sem linha identificada: {moeda(DEVOLUCOES_SEM_LINHA)}</span>
            <span>{DEVOLUCOES_FONTE}</span>
          </div>
        </Painel>

        <div className="rounded-lg bg-cyan/10 p-4 text-sm leading-relaxed text-cyan ring-1 ring-cyan/25">
          <strong>Como comprovar o ganho:</strong> compare, por linha e turno, o número real de pessoas com o recomendado pelo app e registre se a carga saiu no horário. Só depois dessa comparação a redução de devoluções poderá ser atribuída ao dimensionamento.
        </div>
      </div>
    </Shell>
  );
}

function Indicador({ icon: Icon, label, value, detail }: { icon: typeof AlertTriangle; label: string; value: string; detail: string }) {
  return (
    <article className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
        <Icon className="size-4 shrink-0 text-cyan" aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-3xl leading-none tabular-nums text-ink sm:text-4xl">{value}</div>
      <p className="mt-2 text-xs text-dim">{detail}</p>
    </article>
  );
}

function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
      <h2 className="font-display text-xl tracking-wide">{titulo}</h2>
      <p className="mt-1 mb-4 text-xs text-dim">{subtitulo}</p>
      {children}
    </section>
  );
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorAbreviado(valor: number) {
  return Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(valor);
}

function percentual(valor: number, total: number) {
  return `${percentualNumero(valor, total)}%`;
}

function percentualNumero(valor: number, total: number) {
  return total > 0 ? ((valor / total) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "0,0";
}

function larguraPercentual(valor: number, total: number) {
  return total > 0 ? `${((valor / total) * 100).toFixed(1)}%` : "0%";
}

const tooltipStyle = {
  backgroundColor: "var(--color-deep)",
  border: "1px solid var(--color-line)",
  borderRadius: "8px",
  color: "var(--color-ink)",
  fontSize: "12px",
};
