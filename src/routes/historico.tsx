import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { fmtMMSS, fmtNum } from "@/lib/crono";
import {
  TURNOS,
  excluirAnalise,
  listarAnalises,
  type AnaliseSalva,
} from "@/lib/analisesCloud";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico por dia e turno — CronoLeanMaua" },
      {
        name: "description",
        content:
          "Todos os dimensionamentos já realizados, organizados por data e turno, salvos na nuvem e acessíveis de qualquer computador.",
      },
      { property: "og:title", content: "Histórico por dia e turno — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Registro em nuvem de todas as análises de dimensionamento por turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Historico,
});

function Historico() {
  const [itens, setItens] = useState<AnaliseSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("Todos");
  const [filtroData, setFiltroData] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      setItens(await listarAnalises());
      setErro("");
    } catch {
      setErro("Não foi possível carregar o histórico agora.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function remover(id: string) {
    if (!window.confirm("Excluir este registro?")) return;
    await excluirAnalise(id);
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  const filtrados = useMemo(
    () =>
      itens.filter((a) => {
        const okTurno = filtroTurno === "Todos" || a.turno === filtroTurno;
        const okData = !filtroData || a.data.slice(0, 10) === filtroData;
        return okTurno && okData;
      }),
    [itens, filtroTurno, filtroData],
  );

  const grupos = useMemo(() => {
    const mapa = new Map<string, AnaliseSalva[]>();
    for (const a of filtrados) {
      const dia = a.data.slice(0, 10);
      mapa.set(dia, [...(mapa.get(dia) ?? []), a]);
    }
    return [...mapa.entries()];
  }, [filtrados]);

  return (
    <Shell>
      <section className="animate-rise rounded-2xl bg-white shadow-sm p-6 ring-1 ring-line backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Histórico</div>
            <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">
              Análises por dia e turno
            </h1>
            <p className="mt-1 text-xs text-dim">
              Salvo na nuvem — visível para todos os turnos, em qualquer computador.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="ring-line rounded-lg bg-abyss/40 px-3 py-2 font-mono text-xs text-ink ring-1 outline-none focus:ring-cyan/60"
            />
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="ring-line rounded-lg bg-abyss/40 px-3 py-2 font-mono text-xs text-ink ring-1 outline-none focus:ring-cyan/60"
            >
              <option value="Todos">Todos os turnos</option>
              {TURNOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={() => void carregar()}
              className="ring-line rounded-lg bg-deep px-3 py-2 font-mono text-[11px] tracking-wider text-dim uppercase ring-1 hover:text-cyan"
            >
              Atualizar
            </button>
          </div>
        </div>

        {erro && <p className="mb-4 font-mono text-xs text-signal">{erro}</p>}

        {carregando ? (
          <p className="py-10 text-center text-sm text-dim">Carregando...</p>
        ) : !filtrados.length ? (
          <p className="py-10 text-center text-sm text-dim">
            Nenhuma análise encontrada para este filtro.
          </p>
        ) : (
          <div className="space-y-6">
            {grupos.map(([dia, registros]) => (
              <div key={dia}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-display text-lg tracking-tight">
                    {new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-dim uppercase">
                    {registros.length} registro{registros.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="ring-line overflow-x-auto rounded-xl ring-1">
                  <table className="w-full min-w-[1120px] border-collapse font-mono text-xs tabular-nums">
                    <thead>
                      <tr className="bg-deep text-[10px] tracking-wider text-dim uppercase">
                        {[
                          "Hora",
                          "Turno",
                          "Linha",
                          "Demanda",
                          "Disp.",
                          "T. efetivo",
                          "Takt",
                          "T. total",
                          "Teóricos",
                          "Necess.",
                           "Missões",
                           "P/ missões",
                          "Dif.",
                          "Resultado",
                          "",
                        ].map((h) => (
                          <th key={h} className="px-2 py-2 text-left font-normal whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((a) => (
                        <tr key={a.id} className="border-t border-line bg-mist/40">
                          <td className="px-2 py-2 whitespace-nowrap text-dim">
                            {new Date(a.data).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-cyan">{a.turno}</td>
                          <td className="px-2 py-2 font-sans text-ink">{a.linhaNome}</td>
                          <td className="px-2 py-2">{a.demanda.toLocaleString("pt-BR")}</td>
                          <td className="px-2 py-2">{a.pessoasDisponiveis}</td>
                          <td className="px-2 py-2">{fmtNum(a.tempoDisponivelMin, 0)} min</td>
                          <td className="px-2 py-2">{fmtMMSS(a.taktMin * 60)}</td>
                          <td className="px-2 py-2">{fmtMMSS(a.tempoTotalMin * 60)}</td>
                          <td className="px-2 py-2">{fmtNum(a.operadoresTeoricos)}</td>
                          <td className="px-2 py-2 text-cyan">{a.operadoresNecessarios}</td>
                           <td className="px-2 py-2">{a.quantidadeMissoes}</td>
                           <td className="px-2 py-2 text-signal">{a.operadoresMissoes}</td>
                          <td
                            className={`px-2 py-2 ${a.diferenca < 0 ? "text-signal" : "text-clear"}`}
                          >
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
                          <td className="px-2 py-2">
                            <button
                              onClick={() => void remover(a.id)}
                              className="text-dim hover:text-signal"
                              title="Excluir"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
