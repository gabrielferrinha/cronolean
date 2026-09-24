import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Clock3, RefreshCw, ShieldCheck, TrendingDown, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { TURNOS, listarAnalises, type AnaliseSalva } from "@/lib/analisesCloud";
import { fmtNum } from "@/lib/crono";

export const Route = createFileRoute("/custos")({
  head: () => ({
    meta: [
      { title: "Custos e economia — CronoLeanMaua" },
      {
        name: "description",
        content: "Painel gerencial de economia com dimensionamento e capacidade preservada por uma pessoa dedicada às missões.",
      },
      { property: "og:title", content: "Custos e economia — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Visualize oportunidades de economia e o ganho operacional de uma pessoa dedicada às missões.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Custos,
});

const chartColors = {
  primary: "var(--color-cyan)",
  warning: "var(--color-signal)",
  success: "var(--color-clear)",
  muted: "var(--color-dim)",
  grid: "var(--color-line)",
};

type ResumoTurno = {
  turno: string;
  analises: number;
  economia: number;
  valorProtegido: number;
  horasProtegidas: number;
  cobertura: number;
};

function Custos() {
  const [itens, setItens] = useState<AnaliseSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [turno, setTurno] = useState("Todos");
  const [custoMensal, setCustoMensal] = useState("");
  const [diasTrabalhados, setDiasTrabalhados] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      setItens(await listarAnalises());
      setErro("");
    } catch {
      setErro("Não foi possível carregar os dados de custos agora.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const custoSalvo = window.localStorage.getItem("crono.custoMensalOperador");
    const diasSalvos = window.localStorage.getItem("crono.diasTrabalhadosMes");
    if (custoSalvo) setCustoMensal(custoSalvo);
    if (diasSalvos) setDiasTrabalhados(diasSalvos);
    void carregar();
  }, []);

  function atualizarPremissa(chave: "custo" | "dias", valor: string) {
    if (chave === "custo") {
      setCustoMensal(valor);
      window.localStorage.setItem("crono.custoMensalOperador", valor);
      return;
    }
    setDiasTrabalhados(valor);
    window.localStorage.setItem("crono.diasTrabalhadosMes", valor);
  }

  const custo = numero(custoMensal);
  const dias = numero(diasTrabalhados);
  const custoDia = custo > 0 && dias > 0 ? custo / dias : 0;
  const premissasValidas = custoDia > 0;

  const filtrados = useMemo(
    () =>
      itens.filter((item) => {
        const dia = item.data.slice(0, 10);
        return (
          (!inicio || dia >= inicio) &&
          (!fim || dia <= fim) &&
          (turno === "Todos" || item.turno === turno)
        );
      }),
    [fim, inicio, itens, turno],
  );

  const custos = useMemo(
    () =>
      filtrados.map((item) => {
        const sobraRealocavel = Math.max(0, item.diferenca);
        const minutosProtegidos = Math.min(item.tempoMissaoMin, item.tempoDisponivelMin);
        const custoMinuto = item.tempoDisponivelMin > 0 ? custoDia / item.tempoDisponivelMin : 0;
        const cobertura = item.tempoMissaoMin > 0 ? Math.min(100, (minutosProtegidos / item.tempoMissaoMin) * 100) : 0;
        return {
          ...item,
          economia: sobraRealocavel * custoDia,
          minutosProtegidos,
          valorProtegido: minutosProtegidos * custoMinuto,
          cobertura,
        };
      }),
    [custoDia, filtrados],
  );

  const indicadores = useMemo(() => {
    const economia = custos.reduce((soma, item) => soma + item.economia, 0);
    const minutosProtegidos = custos.reduce((soma, item) => soma + item.minutosProtegidos, 0);
    const valorProtegido = custos.reduce((soma, item) => soma + item.valorProtegido, 0);
    const comMissoes = custos.filter((item) => item.tempoMissaoMin > 0);
    const cobertura = comMissoes.length
      ? comMissoes.reduce((soma, item) => soma + item.cobertura, 0) / comMissoes.length
      : 0;
    return { economia, minutosProtegidos, valorProtegido, cobertura };
  }, [custos]);

  const evolucao = useMemo(() => {
    const mapa = new Map<string, { economia: number; valorProtegido: number }>();
    for (const item of custos) {
      const dia = item.data.slice(0, 10);
      const atual = mapa.get(dia) ?? { economia: 0, valorProtegido: 0 };
      atual.economia += item.economia;
      atual.valorProtegido += item.valorProtegido;
      mapa.set(dia, atual);
    }
    return [...mapa.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dia, valor]) => ({ dia: formatarDia(dia), ...valor }));
  }, [custos]);

  const porTurno = useMemo<ResumoTurno[]>(
    () =>
      TURNOS.map((nomeTurno) => {
        const registros = custos.filter((item) => item.turno === nomeTurno);
        const comMissoes = registros.filter((item) => item.tempoMissaoMin > 0);
        return {
          turno: nomeTurno,
          analises: registros.length,
          economia: registros.reduce((soma, item) => soma + item.economia, 0),
          valorProtegido: registros.reduce((soma, item) => soma + item.valorProtegido, 0),
          horasProtegidas: registros.reduce((soma, item) => soma + item.minutosProtegidos, 0) / 60,
          cobertura: comMissoes.length
            ? comMissoes.reduce((soma, item) => soma + item.cobertura, 0) / comMissoes.length
            : 0,
        };
      }),
    [custos],
  );

  return (
    <Shell>
      <div className="space-y-5">
        <section className="animate-rise border-b border-line pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Visão gerencial</div>
              <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">Custos e economia operacional</h1>
              <p className="mt-2 max-w-2xl text-sm text-dim">
                Converta o dimensionamento em valores e veja a capacidade preservada por uma pessoa dedicada às missões.
              </p>
            </div>
            <Button type="button" onClick={() => void carregar()} variant="outline" size="icon" aria-label="Atualizar custos" title="Atualizar custos">
              <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line md:grid-cols-5">
          <Entrada label="Custo mensal por pessoa" value={custoMensal} onChange={(valor) => atualizarPremissa("custo", valor)} prefixo="R$" />
          <Entrada label="Dias trabalhados no mês" value={diasTrabalhados} onChange={(valor) => atualizarPremissa("dias", valor)} sufixo="dias" />
          <FiltroData label="Data inicial" value={inicio} onChange={setInicio} />
          <FiltroData label="Data final" value={fim} onChange={setFim} />
          <FiltroSelect label="Turno" value={turno} onChange={setTurno} options={["Todos", ...TURNOS]} />
        </section>

        {!premissasValidas && (
          <p className="rounded-lg bg-signal/10 p-3 text-sm text-signal ring-1 ring-signal/30">
            Informe o custo mensal completo por pessoa e os dias trabalhados para visualizar os valores financeiros.
          </p>
        )}
        {erro && <p className="rounded-lg bg-signal/10 p-3 text-sm text-signal ring-1 ring-signal/30">{erro}</p>}

        {carregando && !itens.length ? (
          <div className="py-20 text-center text-sm text-dim">Carregando custos...</div>
        ) : !filtrados.length ? (
          <div className="rounded-xl bg-white py-20 text-center shadow-sm ring-1 ring-line">
            <Banknote className="mx-auto size-7 text-dim" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">Nenhuma análise encontrada</p>
            <p className="mt-1 text-xs text-dim">Altere o período ou o turno selecionado.</p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Indicador icon={TrendingDown} label="Economia por dimensionamento" value={premissasValidas ? moeda(indicadores.economia) : "—"} detail="valor de pessoas excedentes realocáveis" />
              <Indicador icon={Clock3} label="Capacidade preservada" value={`${fmtNum(indicadores.minutosProtegidos / 60, 1)} h`} detail="tempo de separação protegido das missões" />
              <Indicador icon={UserRoundCheck} label="Valor da capacidade" value={premissasValidas ? moeda(indicadores.valorProtegido) : "—"} detail="equivalente financeiro do tempo protegido" />
              <Indicador icon={ShieldCheck} label="Cobertura por 1 pessoa" value={`${fmtNum(indicadores.cobertura, 0)}%`} detail="média da carga de missões atendida" positive={indicadores.cobertura >= 80} />
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Painel titulo="Economia ao longo do período" subtitulo="Valores por dia, conforme as premissas informadas" className="xl:col-span-2">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evolucao} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={valorAbreviado} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(valor) => moeda(Number(valor))} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="economia" name="Dimensionamento" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="valorProtegido" name="Capacidade protegida" fill={chartColors.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Painel>

              <Painel titulo="Leitura do ganho" subtitulo="O que uma pessoa dedicada representa">
                <div className="space-y-4 text-sm text-dim">
                  <Leitura numero="01" texto="Uma pessoa dedicada absorve missões até o limite do tempo efetivo do turno." />
                  <Leitura numero="02" texto="Esse tempo deixa de interromper a equipe e volta a ficar disponível para separação." />
                  <Leitura numero="03" texto="O valor exibido é capacidade preservada; não é redução direta de folha." />
                </div>
                <div className="mt-5 rounded-lg bg-cyan/10 p-3 text-xs leading-relaxed text-cyan ring-1 ring-cyan/25">
                  Considera realocação de uma pessoa da equipe, sem nova contratação. Quando a cobertura fica abaixo de 100%, uma pessoa não atende toda a carga prevista.
                </div>
              </Painel>
            </section>

            <Painel titulo="Resultado por turno" subtitulo="Economia e proteção da operação no período selecionado">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] tracking-wider text-dim uppercase">
                      <th className="px-2 py-3 text-left font-normal">Turno</th>
                      <th className="px-2 py-3 text-right font-normal">Análises</th>
                      <th className="px-2 py-3 text-right font-normal">Economia dimensionamento</th>
                      <th className="px-2 py-3 text-right font-normal">Horas protegidas</th>
                      <th className="px-2 py-3 text-right font-normal">Valor protegido</th>
                      <th className="px-2 py-3 text-right font-normal">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porTurno.map((item) => (
                      <tr key={item.turno} className="border-b border-line last:border-0">
                        <td className="px-2 py-4 font-medium text-cyan">{item.turno}</td>
                        <td className="px-2 py-4 text-right">{item.analises}</td>
                        <td className="px-2 py-4 text-right">{premissasValidas ? moeda(item.economia) : "—"}</td>
                        <td className="px-2 py-4 text-right">{fmtNum(item.horasProtegidas, 1)} h</td>
                        <td className="px-2 py-4 text-right">{premissasValidas ? moeda(item.valorProtegido) : "—"}</td>
                        <td className={`px-2 py-4 text-right font-semibold ${item.cobertura >= 80 ? "text-clear" : "text-signal"}`}>
                          {fmtNum(item.cobertura, 0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Painel>
          </>
        )}
      </div>
    </Shell>
  );
}

function Indicador({ icon: Icon, label, value, detail, positive }: { icon: typeof Banknote; label: string; value: string; detail: string; positive?: boolean }) {
  return (
    <article className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
        <Icon className={`size-4 shrink-0 ${positive ? "text-clear" : "text-cyan"}`} aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-3xl leading-none tabular-nums text-ink sm:text-4xl">{value}</div>
      <p className="mt-2 text-xs text-dim">{detail}</p>
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

function Leitura({ numero, texto }: { numero: string; texto: string }) {
  return (
    <div className="flex gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
      <span className="font-mono text-xs text-signal">{numero}</span>
      <p className="leading-relaxed">{texto}</p>
    </div>
  );
}

function Entrada({ label, value, onChange, prefixo, sufixo }: { label: string; value: string; onChange: (value: string) => void; prefixo?: string; sufixo?: string }) {
  return (
    <label>
      <span className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</span>
      <span className="mt-1.5 flex items-center rounded-lg bg-abyss/40 px-3 py-2.5 ring-1 ring-line focus-within:ring-cyan/60">
        {prefixo && <span className="mr-1 font-mono text-xs text-dim">{prefixo}</span>}
        <input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold tabular-nums outline-none" />
        {sufixo && <span className="ml-1 font-mono text-xs text-dim">{sufixo}</span>}
      </span>
    </label>
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

function numero(valor: string) {
  const normalizado = valor.trim().replace(/\./g, "").replace(",", ".");
  const resultado = Number(normalizado);
  return Number.isFinite(resultado) ? resultado : 0;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDia(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function valorAbreviado(valor: number) {
  return Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(valor);
}

const tooltipStyle = {
  backgroundColor: "var(--color-deep)",
  border: "1px solid var(--color-line)",
  borderRadius: "8px",
  color: "var(--color-ink)",
  fontSize: "12px",
};