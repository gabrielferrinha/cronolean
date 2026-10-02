import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, CheckCircle2, Printer, RefreshCw, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/Shell";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { TURNOS, listarAnalises, type AnaliseSalva } from "@/lib/analisesCloud";
import { fmtNum } from "@/lib/crono";

export const Route = createFileRoute("/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores operacionais — CronoLeanMaua" },
      {
        name: "description",
        content: "Painel de demanda, dimensionamento e disponibilidade por período e turno.",
      },
      { property: "og:title", content: "Indicadores operacionais — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Acompanhe os principais indicadores da operação de separação de pedidos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Indicadores,
});

type ResumoTurno = {
  turno: string;
  analises: number;
  demanda: number;
  disponiveis: number;
  necessarios: number;
  cobertura: number;
};

const chartColors = {
  primary: "var(--color-cyan)",
  warning: "var(--color-signal)",
  success: "var(--color-clear)",
  muted: "var(--color-dim)",
  grid: "var(--color-line)",
};

function Indicadores() {
  const [itens, setItens] = useState<AnaliseSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [turno, setTurno] = useState("Todos");
  const [linha, setLinha] = useState("Todas");
  const [dataRelatorio, setDataRelatorio] = useState(dataLocalHoje);
  const [erroRelatorio, setErroRelatorio] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await listarAnalises();
      setItens(dados);
      setErro("");
    } catch {
      setErro("Não foi possível carregar os indicadores agora.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const linhas = useMemo(
    () => [...new Set(itens.map((item) => item.linhaNome))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [itens],
  );

  const filtrados = useMemo(
    () =>
      itens.filter((item) => {
        const dia = item.data.slice(0, 10);
        return (
          (!inicio || dia >= inicio) &&
          (!fim || dia <= fim) &&
          (turno === "Todos" || item.turno === turno) &&
          (linha === "Todas" || item.linhaNome === linha)
        );
      }),
    [fim, inicio, itens, linha, turno],
  );

  const indicadores = useMemo(() => {
    const total = filtrados.length;
    const demanda = filtrados.reduce((soma, item) => soma + item.demanda, 0);
    const mediaNecessaria = total
      ? filtrados.reduce((soma, item) => soma + item.operadoresNecessarios, 0) / total
      : 0;
    const suficientes = filtrados.filter((item) => item.diferenca >= 0).length;
    const cobertura = total ? (suficientes / total) * 100 : 0;
    return { total, demanda, mediaNecessaria, cobertura };
  }, [filtrados]);

  const evolucao = useMemo(() => {
    const mapa = new Map<string, { demanda: number; disponiveis: number; necessarios: number; total: number }>();
    for (const item of filtrados) {
      const dia = item.data.slice(0, 10);
      const atual = mapa.get(dia) ?? { demanda: 0, disponiveis: 0, necessarios: 0, total: 0 };
      atual.demanda += item.demanda;
      atual.disponiveis += item.pessoasDisponiveis;
      atual.necessarios += item.operadoresNecessarios;
      atual.total += 1;
      mapa.set(dia, atual);
    }
    return [...mapa.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dia, valor]) => ({
        dia: formatarDia(dia),
        demanda: valor.demanda,
        disponiveis: Number((valor.disponiveis / valor.total).toFixed(1)),
        necessarios: Number((valor.necessarios / valor.total).toFixed(1)),
      }));
  }, [filtrados]);

  const porTurno = useMemo<ResumoTurno[]>(
    () =>
      TURNOS.map((nomeTurno) => {
        const registros = filtrados.filter((item) => item.turno === nomeTurno);
        const total = registros.length;
        return {
          turno: nomeTurno,
          analises: total,
          demanda: registros.reduce((soma, item) => soma + item.demanda, 0),
          disponiveis: total
            ? registros.reduce((soma, item) => soma + item.pessoasDisponiveis, 0) / total
            : 0,
          necessarios: total
            ? registros.reduce((soma, item) => soma + item.operadoresNecessarios, 0) / total
            : 0,
          cobertura: total ? (registros.filter((item) => item.diferenca >= 0).length / total) * 100 : 0,
        };
      }),
    [filtrados],
  );

  const distribuicao = useMemo(() => {
    const falta = filtrados.filter((item) => item.diferenca < 0).length;
    const exata = filtrados.filter((item) => item.diferenca === 0).length;
    const sobra = filtrados.filter((item) => item.diferenca > 0).length;
    return [
      { nome: "Falta", valor: falta, cor: chartColors.warning },
      { nome: "Equipe exata", valor: exata, cor: chartColors.primary },
      { nome: "Sobra", valor: sobra, cor: chartColors.success },
    ].filter((item) => item.valor > 0);
  }, [filtrados]);

  function imprimirRelatorioDiario() {
    if (!dataRelatorio) {
      setErroRelatorio("Selecione a data do relatório diário.");
      return;
    }
    const possuiRegistros = itens.some((item) => item.data.slice(0, 10) === dataRelatorio);
    if (!possuiRegistros) {
      setErroRelatorio("Não há análises salvas na data selecionada.");
      return;
    }

    setErroRelatorio("");
    setInicio(dataRelatorio);
    setFim(dataRelatorio);
    setTurno("Todos");
    setLinha("Todas");
    window.setTimeout(() => window.print(), 150);
  }

  return (
    <AuthGate><Shell>
      <div className="indicadores-page space-y-5">
        <section className="animate-rise border-b border-line pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Painel operacional</div>
              <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">Indicadores de dimensionamento</h1>
              <p className="mt-2 text-sm text-dim">Visão consolidada das análises realizadas nos turnos.</p>
              {inicio && inicio === fim && (
                <p className="print-report-date mt-2 hidden text-sm font-semibold text-cyan">
                  Relatório diário · {formatarDataCompleta(inicio)}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={() => void carregar()}
              aria-label="Atualizar indicadores"
              title="Atualizar indicadores"
              variant="outline"
              size="icon"
              className="no-print text-dim hover:text-cyan"
            >
              <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="no-print grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          <FiltroData label="Data inicial" value={inicio} onChange={setInicio} />
          <FiltroData label="Data final" value={fim} onChange={setFim} />
          <FiltroSelect label="Turno" value={turno} onChange={setTurno} options={["Todos", ...TURNOS]} />
          <FiltroSelect label="Linha" value={linha} onChange={setLinha} options={["Todas", ...linhas]} />
        </section>

        <section className="no-print flex flex-col gap-3 rounded-xl bg-cyan/10 p-4 ring-1 ring-cyan/25 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-cyan uppercase">Relatório diário</div>
            <p className="mt-1 text-sm text-dim">Selecione o dia para imprimir os indicadores dos três turnos.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <FiltroData label="Data do relatório" value={dataRelatorio} onChange={setDataRelatorio} />
            <Button type="button" onClick={imprimirRelatorioDiario} className="bg-cyan text-primary-foreground hover:bg-cyan/90">
              <Printer aria-hidden="true" />
              Imprimir relatório diário
            </Button>
          </div>
        </section>

        {erroRelatorio && <p className="no-print rounded-lg bg-signal/10 p-3 font-mono text-xs text-signal ring-1 ring-signal/30">{erroRelatorio}</p>}

        {erro && <p className="no-print rounded-lg bg-signal/10 p-3 font-mono text-xs text-signal ring-1 ring-signal/30">{erro}</p>}

        {carregando && !itens.length ? (
          <div className="py-20 text-center text-sm text-dim">Carregando indicadores...</div>
        ) : !filtrados.length ? (
          <div className="rounded-xl bg-white py-20 text-center shadow-sm ring-1 ring-line">
            <CalendarRange className="mx-auto size-7 text-dim" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">Nenhuma análise encontrada</p>
            <p className="mt-1 text-xs text-dim">Altere os filtros para visualizar outros períodos.</p>
          </div>
        ) : (
          <>
            <section className="print-kpis grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Indicador icon={BarChart3} label="Análises" value={indicadores.total.toLocaleString("pt-BR")} detail="cálculos no período" />
              <Indicador icon={Target} label="Demanda acumulada" value={indicadores.demanda.toLocaleString("pt-BR")} detail="separações planejadas" />
              <Indicador icon={Users} label="Média necessária" value={fmtNum(indicadores.mediaNecessaria, 1)} detail="pessoas por análise" />
              <Indicador icon={CheckCircle2} label="Equipe suficiente" value={`${fmtNum(indicadores.cobertura, 0)}%`} detail="das análises realizadas" positive={indicadores.cobertura >= 80} />
            </section>

            <section className="print-charts-main grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Painel titulo="Evolução diária" subtitulo="Demanda total e média de pessoas" className="xl:col-span-2">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucao} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="demanda" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="pessoas" orientation="right" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="demanda" type="monotone" dataKey="demanda" name="Demanda" stroke={chartColors.primary} strokeWidth={3} dot={{ r: 3 }} />
                      <Line yAxisId="pessoas" type="monotone" dataKey="necessarios" name="Pessoas necessárias" stroke={chartColors.warning} strokeWidth={2} />
                      <Line yAxisId="pessoas" type="monotone" dataKey="disponiveis" name="Pessoas disponíveis" stroke={chartColors.success} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Painel>

              <Painel titulo="Situação das equipes" subtitulo="Distribuição das análises">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="82%">
                    <PieChart>
                      <Pie data={distribuicao} dataKey="valor" nameKey="nome" innerRadius={58} outerRadius={88} paddingAngle={3}>
                        {distribuicao.map((item) => <Cell key={item.nome} fill={item.cor} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-dim">
                    {distribuicao.map((item) => (
                      <span key={item.nome} className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${corDistribuicao(item.nome)}`} aria-hidden="true" />
                        {item.nome}: {item.valor}
                      </span>
                    ))}
                  </div>
                </div>
              </Painel>
            </section>

            <section className="print-charts-bottom grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Painel titulo="Comparativo por turno" subtitulo="Média de pessoas por análise">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porTurno} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="turno" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(valor) => fmtNum(Number(valor), 1)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="disponiveis" name="Disponíveis" fill={chartColors.success} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="necessarios" name="Necessárias" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Painel>

              <Painel titulo="Resumo dos turnos" subtitulo="Consolidado do período selecionado">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm tabular-nums">
                    <thead>
                      <tr className="border-b border-line font-mono text-[10px] tracking-wider text-dim uppercase">
                        <th className="px-2 py-3 text-left font-normal">Turno</th>
                        <th className="px-2 py-3 text-right font-normal">Análises</th>
                        <th className="px-2 py-3 text-right font-normal">Demanda</th>
                        <th className="px-2 py-3 text-right font-normal">Cobertura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porTurno.map((item) => (
                        <tr key={item.turno} className="border-b border-line last:border-0">
                          <td className="px-2 py-4 font-medium text-cyan">{item.turno}</td>
                          <td className="px-2 py-4 text-right">{item.analises}</td>
                          <td className="px-2 py-4 text-right">{item.demanda.toLocaleString("pt-BR")}</td>
                          <td className={`px-2 py-4 text-right font-semibold ${item.cobertura >= 80 ? "text-clear" : "text-signal"}`}>
                            {fmtNum(item.cobertura, 0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Painel>
            </section>
          </>
        )}
      </div>
    </Shell></AuthGate>
  );
}

function Indicador({ icon: Icon, label, value, detail, positive }: { icon: typeof BarChart3; label: string; value: string; detail: string; positive?: boolean }) {
  return (
    <article className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
        <Icon className={`size-4 shrink-0 ${positive ? "text-clear" : "text-cyan"}`} aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-3xl leading-none tabular-nums text-ink sm:text-4xl">{value}</div>
      <p className="mt-2 truncate text-xs text-dim">{detail}</p>
    </article>
  );
}

function Painel({ titulo, subtitulo, className = "", children }: { titulo: string; subtitulo: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-line ${className}`}>
      <h2 className="font-display text-xl tracking-wide">{titulo}</h2>
      <p className="mt-1 mb-4 text-xs text-dim">{subtitulo}</p>
      {children}
    </section>
  );
}

function FiltroData({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg bg-abyss/40 px-3 py-2.5 font-mono text-xs text-ink ring-1 ring-line outline-none focus:ring-cyan/60" />
    </label>
  );
}

function FiltroSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label>
      <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg bg-abyss/40 px-3 py-2.5 text-sm text-ink ring-1 ring-line outline-none focus:ring-cyan/60">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function formatarDia(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatarDataCompleta(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function dataLocalHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function corDistribuicao(nome: string) {
  if (nome === "Falta") return "bg-signal";
  if (nome === "Equipe exata") return "bg-cyan";
  return "bg-clear";
}

const tooltipStyle = {
  backgroundColor: "var(--color-deep)",
  border: "1px solid var(--color-line)",
  borderRadius: "8px",
  color: "var(--color-ink)",
  fontSize: "12px",
};