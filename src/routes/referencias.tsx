import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Info,
  Target,
  Users,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import {
  ALMOCO_PADRAO,
  PAUSAS_PADRAO,
} from "@/lib/crono";

export const Route = createFileRoute("/referencias")({
  head: () => ({
    meta: [
      { title: "Referência para cálculos — CronoLeanMaua" },
      {
        name: "description",
        content: "Consulte as fórmulas, premissas operacionais e referências técnicas usadas nos cálculos do CronoLeanMaua.",
      },
      { property: "og:title", content: "Referência para cálculos — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Memória de cálculo completa da cronoanálise, dimensionamento e indicadores gerenciais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Referencias,
});

function Referencias() {
  return (
    <Shell>
      <div className="space-y-5">
        <section className="animate-rise border-b border-line pb-5">
          <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Memória técnica</div>
          <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">Referência para cálculos</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-dim">
            Esta página documenta o caminho completo dos dados, as fórmulas aplicadas e a origem de cada premissa do CronoLeanMaua.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Resumo icon={Calculator} numero="01" titulo="Dados medidos" texto="Dez ciclos cronometrados por atividade formam o banco de tempos da linha." />
          <Resumo icon={Target} numero="02" titulo="Dimensionamento" texto="O conteúdo de trabalho é comparado ao takt time para calcular a equipe." />
          <Resumo icon={Users} numero="03" titulo="Decisão operacional" texto="O resultado compara a equipe disponível com a necessidade calculada." />
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <CabecalhoSecao numero="01" titulo="Fluxo do cálculo" subtitulo="Da medição até a recomendação de pessoas" />
          <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-5">
            {["Ciclos observados", "Média por atividade", "Tempo total", "Takt time", "Pessoas necessárias"].map((item, index, lista) => (
              <div key={item} className="flex items-center gap-2 md:min-w-0">
                <div className="min-w-0 flex-1 rounded-lg bg-abyss px-3 py-4 text-center text-xs font-semibold ring-1 ring-line">{item}</div>
                {index < lista.length - 1 && <ArrowRight className="size-4 shrink-0 rotate-90 text-cyan md:rotate-0" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Bloco numero="02" titulo="Cronoanálise e tempo da linha" subtitulo="Tempos observados no banco de tempos">
            <Formula titulo="Média de uma atividade" expressao="Média (s) = soma dos ciclos válidos ÷ quantidade de ciclos válidos" />
            <p className="text-sm leading-relaxed text-dim">
              Cada atividade usa somente os ciclos preenchidos. O aplicativo não elimina automaticamente valores altos ou baixos: toda exclusão deve ser decidida na edição do banco de tempos.
            </p>
            <Formula titulo="Tempo total por separação" expressao="Tempo total (min) = soma das médias das atividades (s) ÷ 60" />
            <p className="text-sm leading-relaxed text-dim">O resultado representa o conteúdo médio de trabalho necessário para completar uma separação na linha escolhida.</p>
          </Bloco>

          <Bloco numero="03" titulo="Tempo efetivo e takt time" subtitulo="Capacidade real do período informado">
            <Formula titulo="Tempo efetivo" expressao="Tempo efetivo (min) = jornada (h) × 60 − pausas − almoço" />
            <p className="text-sm leading-relaxed text-dim">
              Os valores iniciais são {PAUSAS_PADRAO} minutos de pausas e {ALMOCO_PADRAO} minutos de almoço, conforme a lógica da planilha original. Eles podem ser alterados na análise diária.
            </p>
            <Formula titulo="Takt time" expressao="Takt (min/separação) = tempo efetivo (min) ÷ demanda de separações" />
            <p className="text-sm leading-relaxed text-dim">A demanda é a quantidade de separações que precisa ser concluída no período, não a quantidade de pedidos ou produtos.</p>
          </Bloco>

          <Bloco numero="04" titulo="Pessoas para separação" subtitulo="Equipe necessária para atender a demanda">
            <Formula titulo="Operadores teóricos" expressao="Operadores teóricos = tempo total por separação ÷ takt time" />
            <Formula titulo="Pessoas necessárias" expressao="Pessoas necessárias = operadores teóricos arredondados para cima" />
            <p className="text-sm leading-relaxed text-dim">O arredondamento é sempre para cima porque uma fração de pessoa não executa integralmente a carga prevista.</p>
            <Formula titulo="Situação da equipe" expressao="Diferença = pessoas disponíveis − pessoas necessárias" />
            <ul className="grid grid-cols-3 gap-2 text-center text-xs">
              <li className="rounded-lg bg-signal/10 p-2 text-signal ring-1 ring-signal/25">Negativo: faltam</li>
              <li className="rounded-lg bg-clear/10 p-2 text-clear ring-1 ring-clear/25">Zero: equipe exata</li>
              <li className="rounded-lg bg-cyan/10 p-2 text-cyan ring-1 ring-cyan/25">Positivo: sobram</li>
            </ul>
          </Bloco>

        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <CabecalhoSecao numero="05" titulo="Indicadores de custos" subtitulo="Conversão gerencial da capacidade operacional" />
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Formula titulo="Custo diário por pessoa" expressao="Custo diário = custo mensal completo ÷ dias trabalhados no mês" />
            <Formula titulo="Economia potencial" expressao="Economia = pessoas excedentes realocáveis × custo diário" />
          </div>
          <div className="mt-4 flex gap-3 rounded-lg bg-clear/10 p-4 text-sm leading-relaxed text-clear ring-1 ring-clear/25">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>Esses valores representam uma oportunidade de realocação. Não são redução automática de folha.</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <CabecalhoSecao numero="06" titulo="Exemplo de conferência" subtitulo="Exemplo didático com números arredondados" />
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1.3fr] lg:items-center">
            <div className="rounded-lg bg-abyss p-4 ring-1 ring-line">
              <div className="font-mono text-[10px] tracking-wider text-dim uppercase">Entradas</div>
              <ul className="mt-3 space-y-2 text-sm text-dim">
                <li>Jornada: 8 h</li><li>Pausas: 20 min</li><li>Almoço: 60 min</li><li>Demanda: 100 separações</li><li>Tempo total: 10 min/separação</li>
              </ul>
            </div>
            <ArrowRight className="mx-auto size-5 rotate-90 text-cyan lg:rotate-0" aria-hidden="true" />
            <div className="grid grid-cols-2 gap-3">
              <ResultadoExemplo label="Tempo efetivo" valor="400 min" conta="480 − 20 − 60" />
              <ResultadoExemplo label="Takt time" valor="4 min/sep." conta="400 ÷ 100" />
              <ResultadoExemplo label="Operadores teóricos" valor="2,50" conta="10 ÷ 4" />
              <ResultadoExemplo label="Pessoas necessárias" valor="3" conta="teto de 2,50" />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
          <CabecalhoSecao numero="07" titulo="Origem das regras e referências" subtitulo="O que veio da operação e o que possui base conceitual externa" />
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-clear" aria-hidden="true" /> Regras específicas da operação</h3>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-dim">
                <li>Tempos das atividades: planilha Excel e banco de tempos cadastrado.</li>
                <li>Pausas de {PAUSAS_PADRAO} min e almoço de {ALMOCO_PADRAO} min: lógica da planilha original.</li>
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="size-4 text-cyan" aria-hidden="true" /> Referências conceituais</h3>
              <div className="mt-3 space-y-3">
                <Referencia titulo="Takt Time" origem="Lean Enterprise Institute" descricao="Define takt como tempo disponível dividido pela demanda do cliente." href="https://www.lean.org/lexicon-terms/takt-time/" />
                <Referencia titulo="Standardized Work" origem="Lean Enterprise Institute" descricao="Relaciona takt time, sequência de trabalho e estoque padrão no trabalho padronizado." href="https://www.lean.org/lexicon-terms/standardized-work/" />
                <Referencia titulo="TPS Handbook" origem="Art of Lean" descricao="Apresenta fundamentos do Sistema Toyota, fluxo, takt e balanceamento do trabalho." href="https://artoflean.com/wp-content/uploads/2019/01/Basic_TPS_Handbook.pdf" />
                <Referencia titulo="Introdução ao Estudo do Trabalho" origem="Organização Internacional do Trabalho" descricao="Referência clássica para estudo de métodos e medição do trabalho." href="https://www.ilo.org/media/310396/download" />
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-xs leading-relaxed text-dim">
          As fontes externas sustentam os conceitos de estudo do trabalho, takt e balanceamento. As constantes de pausas, almoço e custos são premissas internas e devem ser revisadas quando a operação mudar.
        </p>
      </div>
    </Shell>
  );
}

function Resumo({ icon: Icon, numero, titulo, texto }: { icon: typeof Calculator; numero: string; titulo: string; texto: string }) {
  return <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-line"><div className="flex items-center justify-between"><span className="font-mono text-xs text-signal">{numero}</span><Icon className="size-4 text-cyan" aria-hidden="true" /></div><h2 className="mt-4 font-display text-xl tracking-wide">{titulo}</h2><p className="mt-1 text-xs leading-relaxed text-dim">{texto}</p></article>;
}

function CabecalhoSecao({ numero, titulo, subtitulo }: { numero: string; titulo: string; subtitulo: string }) {
  return <div className="flex items-start gap-3"><span className="font-mono text-xs text-signal">{numero}</span><div><h2 className="font-display text-xl tracking-wide">{titulo}</h2><p className="mt-1 text-xs text-dim">{subtitulo}</p></div></div>;
}

function Bloco({ numero, titulo, subtitulo, children }: { numero: string; titulo: string; subtitulo: string; children: React.ReactNode }) {
  return <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line"><CabecalhoSecao numero={numero} titulo={titulo} subtitulo={subtitulo} /><div className="mt-5 space-y-4">{children}</div></section>;
}

function Formula({ titulo, expressao }: { titulo: string; expressao: string }) {
  return <div className="rounded-lg bg-abyss p-3 ring-1 ring-line"><div className="font-mono text-[10px] tracking-wider text-cyan uppercase">{titulo}</div><div className="mt-2 overflow-x-auto whitespace-nowrap font-mono text-xs font-semibold text-ink sm:text-sm">{expressao}</div></div>;
}

function ResultadoExemplo({ label, valor, conta }: { label: string; valor: string; conta: string }) {
  return <div className="rounded-lg bg-cyan/10 p-3 ring-1 ring-cyan/25"><div className="font-mono text-[10px] tracking-wider text-dim uppercase">{label}</div><div className="mt-2 font-display text-2xl text-cyan">{valor}</div><div className="mt-1 font-mono text-[10px] text-dim">{conta}</div></div>;
}

function Referencia({ titulo, origem, descricao, href }: { titulo: string; origem: string; descricao: string; href: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="group block rounded-lg bg-abyss p-3 ring-1 ring-line transition-colors hover:ring-cyan/50"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-ink">{titulo}</div><div className="mt-0.5 font-mono text-[10px] tracking-wider text-cyan uppercase">{origem}</div></div><ExternalLink className="size-4 shrink-0 text-dim transition-colors group-hover:text-cyan" aria-hidden="true" /></div><p className="mt-2 text-xs leading-relaxed text-dim">{descricao}</p></a>;
}
