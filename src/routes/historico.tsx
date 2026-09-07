import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { fmtMMSS, fmtNum, getHistorico, setHistorico, type Analise } from "@/lib/crono";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de Análises — CronoLab" },
      {
        name: "description",
        content:
          "Acompanhe a evolução do dimensionamento de mão de obra: demanda, pessoas disponíveis e pessoas necessárias por dia.",
      },
      { property: "og:title", content: "Histórico de Análises — CronoLab" },
      {
        property: "og:description",
        content: "Registro de todas as análises de dimensionamento realizadas.",
      },
    ],
  }),
  component: Historico,
});

function Historico() {
  const [itens, setItens] = useState<Analise[]>([]);

  useEffect(() => setItens(getHistorico()), []);

  function limpar() {
    if (!window.confirm("Apagar todo o histórico?")) return;
    setHistorico([]);
    setItens([]);
  }

  return (
    <Shell>
      <section className="animate-rise rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Histórico</div>
            <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">
              Análises realizadas
            </h1>
          </div>
          {itens.length > 0 && (
            <button
              onClick={limpar}
              className="ring-line rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] tracking-wider text-dim uppercase ring-1 hover:text-signal"
            >
              Limpar
            </button>
          )}
        </div>

        {!itens.length ? (
          <p className="py-10 text-center text-sm text-dim">
            Nenhuma análise salva ainda. Cada cálculo feito na tela inicial aparece aqui.
          </p>
        ) : (
          <div className="ring-line overflow-x-auto rounded-xl ring-1">
            <table className="w-full min-w-[900px] border-collapse font-mono text-xs tabular-nums">
              <thead>
                <tr className="bg-deep text-[10px] tracking-wider text-dim uppercase">
                  {[
                    "Data",
                    "Linha",
                    "Demanda",
                    "Disp.",
                    "T. efetivo",
                    "Takt",
                    "T. total",
                    "Teóricos",
                    "Necess.",
                    "Dif.",
                    "Resultado",
                  ].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itens.map((a) => (
                  <tr key={a.id} className="border-t border-white/10 bg-deep/40">
                    <td className="px-2 py-2 whitespace-nowrap text-dim">
                      {new Date(a.data).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-2 py-2 font-sans text-ink">{a.linhaNome}</td>
                    <td className="px-2 py-2">{a.demanda.toLocaleString("pt-BR")}</td>
                    <td className="px-2 py-2">{a.pessoasDisponiveis}</td>
                    <td className="px-2 py-2">
                      {fmtNum(a.tempoDisponivelMin ?? a.horasDisponiveis * 60, 0)} min
                    </td>
                    <td className="px-2 py-2">{fmtMMSS(a.taktMin * 60)}</td>
                    <td className="px-2 py-2">{fmtMMSS(a.tempoTotalMin * 60)}</td>
                    <td className="px-2 py-2">{fmtNum(a.operadoresTeoricos)}</td>
                    <td className="px-2 py-2 text-cyan">{a.operadoresNecessarios}</td>
                    <td className={`px-2 py-2 ${a.diferenca < 0 ? "text-signal" : "text-clear"}`}>
                      {a.diferenca > 0 ? `+${a.diferenca}` : a.diferenca}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] ${
                          a.diferenca < 0 ? "bg-signal/15 text-signal" : "bg-clear/15 text-clear"
                        }`}
                      >
                        {a.resultado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}
