import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import {
  ALMOCO_PADRAO,
  PAUSAS_PADRAO,
  calcular,
  fmtMMSS,
  fmtNum,
  getAtividades,
  getHistorico,
  getLinhas,
  setHistorico,
  type Analise,
  type Atividade,
  type Linha,
} from "@/lib/crono";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova Análise — CronoLab | Dimensionamento de Operadores" },
      {
        name: "description",
        content:
          "Calcule em segundos quantas pessoas são necessárias para separar a demanda do dia, usando os tempos médios da cronoanálise.",
      },
      { property: "og:title", content: "CronoLab — Dimensionamento de mão de obra" },
      {
        property: "og:description",
        content: "Cronoanálise e dimensionamento de operadores para separação de pedidos.",
      },
    ],
  }),
  component: NovaAnalise,
});

function NovaAnalise() {
  const [linhas, setLinhasState] = useState<Linha[]>([]);
  const [atividades, setAtividadesState] = useState<Atividade[]>([]);
  const [linhaId, setLinhaId] = useState("");
  const [demanda, setDemanda] = useState("1200");
  const [pessoas, setPessoas] = useState("6");
  const [horas, setHoras] = useState("8");
  const [pausas, setPausas] = useState(String(PAUSAS_PADRAO));
  const [almoco, setAlmoco] = useState(String(ALMOCO_PADRAO));
  const [resultado, setResultado] = useState<Analise | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const ls = getLinhas();
    setLinhasState(ls);
    setLinhaId(ls[0]?.id ?? "");
    setAtividadesState(getAtividades());
  }, []);

  const atividadesLinha = useMemo(
    () => atividades.filter((a) => a.linhaId === linhaId),
    [atividades, linhaId],
  );

  const num = (v: string) => Number(v.replace(",", ".")) || 0;
  const tempoEfetivo = Math.max(0, num(horas) * 60 - num(pausas) - num(almoco));

  function onCalcular() {
    const d = Number(demanda);
    const p = Number(pessoas);
    const h = num(horas);
    const pa = num(pausas);
    const al = num(almoco);
    if (!d || d <= 0) return setErro("Informe a demanda de separações do período.");
    if (!h || h <= 0) return setErro("Informe a jornada disponível em horas.");
    if (h * 60 - pa - al <= 0) return setErro("Pausas e almoço maiores que a jornada.");
    if (!atividadesLinha.length) return setErro("Esta linha ainda não tem atividades no banco de tempos.");
    setErro("");

    const calc = calcular({
      demanda: d,
      pessoasDisponiveis: p,
      horasDisponiveis: h,
      pausasMin: pa,
      almocoMin: al,
      atividades: atividadesLinha,
    });
    const linha = linhas.find((l) => l.id === linhaId);
    const analise: Analise = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      linhaId,
      linhaNome: linha?.nome ?? "—",
      demanda: d,
      pessoasDisponiveis: p,
      horasDisponiveis: h,
      pausasMin: pa,
      almocoMin: al,
      tempoDisponivelMin: calc.tempoDisponivelMin,
      taktMin: calc.taktMin,
      tempoTotalMin: calc.tempoTotalMin,
      operadoresTeoricos: calc.operadoresTeoricos,
      operadoresNecessarios: calc.operadoresNecessarios,
      diferenca: calc.diferenca,
      resultado: calc.resultado,
    };
    setResultado(analise);
    setHistorico([analise, ...getHistorico()].slice(0, 200));
  }


  const falta = resultado ? resultado.diferenca < 0 : false;

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="animate-rise rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-md lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
                (a) Análise do dia
              </div>
              <h1 className="mt-2 font-display text-3xl leading-none tracking-tight text-balance">
                Dimensionamento de operadores
              </h1>
            </div>
            <div className="font-mono text-[11px] text-dim">
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Linha</label>
              <select
                value={linhaId}
                onChange={(e) => setLinhaId(e.target.value)}
                className="ring-line mt-1.5 w-full appearance-none rounded-lg bg-abyss/40 px-3 py-2.5 text-sm font-medium text-ink ring-1 outline-none focus:ring-cyan/60"
              >
                {linhas.map((l) => (
                  <option key={l.id} value={l.id} className="bg-abyss">
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Campo label="Demanda" value={demanda} onChange={setDemanda} sufixo="sep." />
              <Campo label="Pessoas disp." value={pessoas} onChange={setPessoas} />
              <Campo label="Jornada" value={horas} onChange={setHoras} sufixo="h" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Campo label="Pausas" value={pausas} onChange={setPausas} sufixo="min" />
              <Campo label="Almoço" value={almoco} onChange={setAlmoco} sufixo="min" />
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  Tempo efetivo
                </label>
                <div className="ring-line mt-1.5 flex items-center justify-between rounded-lg bg-cyan/10 px-3 py-2.5 ring-1 ring-cyan/30">
                  <span className="text-sm font-semibold tabular-nums text-cyan">
                    {fmtNum(tempoEfetivo, 0)}
                  </span>
                  <span className="font-mono text-xs text-dim">min</span>
                </div>
              </div>
            </div>
          </div>


          {erro && <p className="mt-3 font-mono text-xs text-signal">{erro}</p>}

          <button
            onClick={onCalcular}
            className="mt-5 w-full rounded-lg bg-cyan py-3 font-display text-lg tracking-[0.2em] text-abyss uppercase transition-colors duration-200 hover:bg-cyan/85"
          >
            Calcular
          </button>

          {resultado && (
            <div className="animate-rise mt-6 overflow-hidden rounded-2xl bg-abyss/70 ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-2">
                <span className="font-mono text-[10px] tracking-[0.24em] text-dim uppercase">Resultado</span>
                <span
                  className={`font-mono text-[10px] tracking-[0.18em] uppercase ${falta ? "text-signal" : "text-clear"}`}
                >
                  ● {resultado.resultado}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-5">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">Disponíveis</div>
                  <div className="mt-1 font-display text-4xl tabular-nums">{resultado.pessoasDisponiveis}</div>
                </div>
                <div className="flex flex-col justify-center border-x border-white/10 text-center">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-cyan uppercase">Necessárias</div>
                  <div className="font-display text-6xl leading-none tabular-nums text-cyan">
                    {resultado.operadoresNecessarios}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">Demanda</div>
                  <div className="mt-1 font-display text-4xl tabular-nums">
                    {resultado.demanda.toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 text-center font-mono text-[11px] sm:grid-cols-4">
                <Mini titulo="TAKT" valor={fmtMMSS(resultado.taktMin * 60)} />
                <Mini titulo="T. TOTAL" valor={fmtMMSS(resultado.tempoTotalMin * 60)} />
                <Mini titulo="OPER. TEÓR." valor={fmtNum(resultado.operadoresTeoricos)} />
                <Mini
                  titulo="DIFERENÇA"
                  valor={resultado.diferenca > 0 ? `+${resultado.diferenca}` : String(resultado.diferenca)}
                  destaque={falta}
                />
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <section className="animate-rise rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-md">
            <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
              (b) Tempos usados no cálculo
            </div>
            <div className="ring-line overflow-hidden rounded-xl ring-1">
              <div className="grid grid-cols-[2.4rem_1fr_3rem_3.6rem] gap-px bg-white/10 font-mono text-[10px] tracking-wider text-dim uppercase">
                <div className="bg-deep px-2 py-2 text-center">Nº</div>
                <div className="bg-deep px-2 py-2">Atividade</div>
                <div className="bg-deep px-2 py-2 text-right">Ciclos</div>
                <div className="bg-deep px-2 py-2 text-right">Média</div>
              </div>
              <div className="grid grid-cols-[2.4rem_1fr_3rem_3.6rem] gap-px bg-white/10 font-mono text-xs tabular-nums">
                {atividadesLinha.map((a) => {
                  const validos = a.ciclos.filter((c) => typeof c === "number").length;
                  const media = a.ciclos.filter((c): c is number => typeof c === "number");
                  const avg = media.length ? media.reduce((x, y) => x + y, 0) / media.length : 0;
                  return (
                    <div key={a.id} className="contents">
                      <div className="bg-deep/60 px-2 py-2 text-center text-cyan">
                        {String(a.numero).padStart(2, "0")}
                      </div>
                      <div className="bg-deep/60 px-2 py-2 font-sans text-ink">{a.nome}</div>
                      <div
                        className={`bg-deep/60 px-2 py-2 text-right ${validos < 10 ? "text-signal" : "text-dim"}`}
                      >
                        {validos}
                      </div>
                      <div className="bg-deep/60 px-2 py-2 text-right text-ink">{fmtMMSS(avg)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="animate-rise rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-md">
            <div className="mb-3 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
              (c) Como o cálculo é feito
            </div>
            <ul className="space-y-1.5 font-mono text-[11px] text-dim">
              <li>Tempo efetivo = (jornada × 60) − pausas − almoço</li>
              <li>Takt Time = tempo efetivo ÷ separações do dia</li>
              <li>Tempo total = soma das médias das atividades</li>
              <li>Operadores teóricos = tempo total ÷ takt</li>
              <li>Pessoas necessárias = arredondado para cima</li>
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function Campo({
  label,
  value,
  onChange,
  sufixo,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sufixo?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">{label}</label>
      <div className="ring-line mt-1.5 flex items-center rounded-lg bg-abyss/40 px-3 py-2.5 ring-1 focus-within:ring-cyan/60">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none"
        />
        {sufixo && <span className="ml-1 font-mono text-xs text-dim">{sufixo}</span>}
      </div>
    </div>
  );
}

function Mini({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="bg-abyss/40 py-2.5">
      <div className="text-dim">{titulo}</div>
      <div className={`mt-0.5 tabular-nums ${destaque ? "text-signal" : "text-ink"}`}>{valor}</div>
    </div>
  );
}
