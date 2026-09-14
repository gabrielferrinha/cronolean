import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import {
  ALMOCO_PADRAO,
  PAUSAS_PADRAO,
  fmtMMSS,
  getAtividades,
  getLinhas,
  mediaSegundos,
  parseTempo,
  setAtividades,
  setLinhas,
  type Atividade,
} from "@/lib/crono";

export const Route = createFileRoute("/nova-linha")({
  head: () => ({
    meta: [
      { title: "Nova Linha — CronoLeanMaua" },
      {
        name: "description",
        content:
          "Cadastre uma nova linha de separação com suas atividades e ciclos cronometrados para o cálculo de mão de obra.",
      },
      { property: "og:title", content: "Nova Linha — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Cadastro completo de linha: atividades, ciclos e tempo total.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovaLinha,
});

type AtividadeForm = { nome: string; ciclos: string[] };

const ciclosVazios = () => Array<string>(10).fill("");

function NovaLinha() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [itens, setItens] = useState<AtividadeForm[]>([
    { nome: "", ciclos: ciclosVazios() },
  ]);
  const [erro, setErro] = useState("");

  function atualizarNome(idx: number, valor: string) {
    setItens(itens.map((it, i) => (i === idx ? { ...it, nome: valor } : it)));
  }

  function atualizarCiclo(idx: number, c: number, valor: string) {
    setItens(
      itens.map((it, i) =>
        i === idx
          ? { ...it, ciclos: it.ciclos.map((v, j) => (j === c ? valor : v)) }
          : it,
      ),
    );
  }

  function adicionarAtividade() {
    setItens([...itens, { nome: "", ciclos: ciclosVazios() }]);
  }

  function removerAtividade(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Informe o nome da linha.");
      return;
    }
    const validas = itens.filter((it) => it.nome.trim());
    if (!validas.length) {
      setErro("Cadastre ao menos uma atividade com nome.");
      return;
    }
    const semCiclo = validas.find((it) =>
      it.ciclos.every((c) => parseTempo(c) === null),
    );
    if (semCiclo) {
      setErro(`A atividade "${semCiclo.nome}" precisa de ao menos um ciclo cronometrado.`);
      return;
    }

    const linhaId = crypto.randomUUID();
    const linhas = getLinhas();
    setLinhas([...linhas, { id: linhaId, nome: nomeLimpo }]);

    const novas: Atividade[] = validas.map((it, i) => ({
      id: crypto.randomUUID(),
      linhaId,
      numero: i + 1,
      nome: it.nome.trim(),
      ciclos: it.ciclos.map((c) => parseTempo(c)),
    }));
    setAtividades([...getAtividades(), ...novas]);

    navigate({ to: "/banco" });
  }

  const totalSeg = itens.reduce((s, it) => {
    const ciclos = it.ciclos.map((c) => parseTempo(c));
    return s + mediaSegundos(ciclos);
  }, 0);

  return (
    <Shell>
      <section className="animate-rise rounded-2xl bg-white shadow-sm p-6 ring-1 ring-line backdrop-blur-md">
        <div className="mb-6">
          <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
            Nova linha de separação
          </div>
          <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">
            Cadastro completo
          </h1>
          <p className="mt-2 max-w-xl text-sm text-dim">
            Informe o nome da linha e cadastre cada atividade com os tempos
            cronometrados (aceita <span className="font-mono text-cyan">mm:ss</span> ou
            segundos). Pausas de {PAUSAS_PADRAO} min e almoço de {ALMOCO_PADRAO} min já
            são descontados automaticamente na análise diária.
          </p>
        </div>

        <label className="mb-6 block max-w-md">
          <span className="mb-1 block font-mono text-[10px] tracking-widest text-dim uppercase">
            Nome da linha
          </span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Linha 02 · Miudezas secas"
            className="ring-line w-full rounded-lg bg-abyss/50 px-3 py-2.5 text-sm ring-1 outline-none focus:ring-cyan/60"
          />
        </label>

        <div className="space-y-4">
          {itens.map((it, i) => {
            const media = mediaSegundos(it.ciclos.map((c) => parseTempo(c)));
            return (
              <div key={i} className="ring-line rounded-xl bg-mist/40 p-4 ring-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={it.nome}
                    onChange={(e) => atualizarNome(i, e.target.value)}
                    placeholder="Nome da atividade"
                    className="ring-line flex-1 rounded-lg bg-abyss/50 px-3 py-2 text-sm ring-1 outline-none focus:ring-cyan/60"
                  />
                  <span className="font-mono text-xs text-dim">
                    Média <span className="text-cyan">{fmtMMSS(media)}</span>
                  </span>
                  {itens.length > 1 && (
                    <button
                      onClick={() => removerAtividade(i)}
                      className="font-mono text-[10px] tracking-wider text-dim uppercase hover:text-signal"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {it.ciclos.map((c, j) => (
                    <label key={j} className="block">
                      <span className="mb-1 block text-center font-mono text-[9px] text-dim">
                        C{j + 1}
                      </span>
                      <input
                        value={c}
                        onChange={(e) => atualizarCiclo(i, j, e.target.value)}
                        placeholder="—"
                        className="ring-line w-full rounded bg-abyss/50 px-1 py-1.5 text-center font-mono text-[11px] ring-1 outline-none focus:ring-cyan/60"
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={adicionarAtividade}
          className="ring-line mt-4 rounded-lg bg-deep px-4 py-2 font-mono text-[11px] tracking-wider text-dim uppercase ring-1 transition-colors hover:text-cyan"
        >
          + Adicionar atividade
        </button>

        {erro && (
          <p className="mt-4 rounded-lg bg-signal/10 px-3 py-2 font-mono text-xs text-signal ring-1 ring-signal/30">
            {erro}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <span className="font-mono text-xs text-dim">
            Tempo total da linha: <span className="text-cyan">{fmtMMSS(totalSeg)}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/banco" })}
              className="ring-line rounded-lg bg-deep px-4 py-2 font-mono text-[11px] tracking-wider text-dim uppercase ring-1 hover:text-ink"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="rounded-lg bg-cyan px-6 py-2 font-mono text-[11px] font-semibold tracking-wider text-abyss uppercase transition-colors hover:bg-cyan/85"
            >
              Salvar linha
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
