import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Shell } from "@/components/Shell";
import {
  fmtMMSS,
  getAtividades,
  getLinhas,
  mediaSegundos,
  parseTempo,
  setAtividades,
  type Atividade,
  type Linha,
} from "@/lib/crono";

export const Route = createFileRoute("/banco")({
  head: () => ({
    meta: [
      { title: "Banco de Tempos — CronoLeanMaua" },
      {
        name: "description",
        content:
          "Cadastre atividades, ciclos cronometrados e importe a planilha de cronoanálise. As médias são recalculadas automaticamente.",
      },
      { property: "og:title", content: "Banco de Tempos — CronoLeanMaua" },
      {
        property: "og:description",
        content: "Atividades, ciclos e tempos médios da operação de separação.",
      },
    ],
  }),
  component: Banco,
});

function Banco() {
  const navigate = useNavigate();
  const [linhas, setLinhasS] = useState<Linha[]>([]);
  const [linhaId, setLinhaId] = useState("");
  const [atividades, setAtividadesS] = useState<Atividade[]>([]);
  const [aviso, setAviso] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ls = getLinhas();
    setLinhasS(ls);
    setLinhaId(ls[0]?.id ?? "");
    setAtividadesS(getAtividades());
  }, []);

  function salvar(next: Atividade[]) {
    setAtividadesS(next);
    setAtividades(next);
  }

  function atualizarCiclo(id: string, idx: number, valor: string) {
    salvar(
      atividades.map((a) =>
        a.id === id
          ? { ...a, ciclos: a.ciclos.map((c, i) => (i === idx ? parseTempo(valor) : c)) }
          : a,
      ),
    );
  }

  function renomear(id: string, nome: string) {
    salvar(atividades.map((a) => (a.id === id ? { ...a, nome } : a)));
  }

  function adicionar() {
    const daLinha = atividades.filter((a) => a.linhaId === linhaId);
    salvar([
      ...atividades,
      {
        id: crypto.randomUUID(),
        linhaId,
        numero: daLinha.length + 1,
        nome: "Nova atividade",
        ciclos: Array<number | null>(10).fill(null),
      },
    ]);
  }

  function remover(id: string) {
    salvar(atividades.filter((a) => a.id !== id));
  }

  function novaLinha() {
    navigate({ to: "/nova-linha" });
  }

  async function importar(file: File) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: false });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return;
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });

    const importadas: Atividade[] = [];
    for (const row of rows) {
      const num = Number(row[0]);
      const nome = typeof row[1] === "string" ? row[1].trim() : "";
      if (!Number.isFinite(num) || num <= 0 || !nome) continue;
      const ciclos: (number | null)[] = [];
      for (let i = 2; i <= 11; i++) {
        ciclos.push(celulaParaSegundos(row[i]));
      }
      if (ciclos.every((c) => c === null)) continue;
      importadas.push({
        id: crypto.randomUUID(),
        linhaId,
        numero: importadas.length + 1,
        nome,
        ciclos,
      });
    }

    if (!importadas.length) {
      setAviso("Nenhuma atividade encontrada na planilha.");
      return;
    }
    salvar([...atividades.filter((a) => a.linhaId !== linhaId), ...importadas]);
    setAviso(`${importadas.length} atividade(s) importada(s) para esta linha.`);
  }

  const daLinha = atividades.filter((a) => a.linhaId === linhaId);
  const totalSeg = daLinha.reduce((s, a) => s + mediaSegundos(a.ciclos), 0);

  return (
    <Shell>
      <section className="animate-rise rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
              Banco de tempos
            </div>
            <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">
              Atividades e ciclos
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={linhaId}
              onChange={(e) => setLinhaId(e.target.value)}
              className="ring-line rounded-lg bg-abyss/40 px-3 py-2 text-sm ring-1 outline-none"
            >
              {linhas.map((l) => (
                <option key={l.id} value={l.id} className="bg-abyss">
                  {l.nome}
                </option>
              ))}
            </select>
            <Botao onClick={novaLinha}>+ Linha</Botao>
            <Botao onClick={adicionar}>+ Atividade</Botao>
            <Botao onClick={() => fileRef.current?.click()}>Importar Excel</Botao>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {aviso && <p className="mb-3 font-mono text-xs text-cyan">{aviso}</p>}

        <div className="ring-line overflow-x-auto rounded-xl ring-1">
          <table className="w-full min-w-[900px] border-collapse font-mono text-xs tabular-nums">
            <thead>
              <tr className="bg-deep text-[10px] tracking-wider text-dim uppercase">
                <th className="px-2 py-2 text-center font-normal">Nº</th>
                <th className="min-w-[200px] px-2 py-2 text-left font-normal">Atividade</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="px-1 py-2 text-center font-normal">
                    C{i + 1}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-normal">Média</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {daLinha.map((a) => (
                <tr key={a.id} className="border-t border-white/10 bg-deep/40">
                  <td className="px-2 py-1.5 text-center text-cyan">
                    {String(a.numero).padStart(2, "0")}
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={a.nome}
                      onChange={(e) => renomear(a.id, e.target.value)}
                      className="w-full bg-transparent font-sans text-sm text-ink outline-none focus:text-cyan"
                    />
                  </td>
                  {a.ciclos.map((c, i) => (
                    <td key={i} className="px-1 py-1.5">
                      <input
                        defaultValue={c === null ? "" : fmtMMSS(c)}
                        placeholder="—"
                        onBlur={(e) => atualizarCiclo(a.id, i, e.target.value)}
                        className="ring-line w-14 rounded bg-abyss/50 px-1 py-1 text-center text-[11px] ring-1 outline-none focus:ring-cyan/60"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right text-cyan">{fmtMMSS(mediaSegundos(a.ciclos))}</td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      onClick={() => remover(a.id)}
                      className="text-[10px] tracking-wider text-dim uppercase hover:text-signal"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {!daLinha.length && (
                <tr>
                  <td colSpan={14} className="px-3 py-6 text-center font-sans text-sm text-dim">
                    Nenhuma atividade nesta linha. Importe a planilha ou adicione uma atividade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-xs">
          <span className="text-dim">Ciclos vazios não entram na média.</span>
          <span className="text-ink">
            Tempo total das atividades: <span className="text-cyan">{fmtMMSS(totalSeg)}</span>
          </span>
        </div>
      </section>
    </Shell>
  );
}

function celulaParaSegundos(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") {
    // Excel guarda horários como fração do dia
    return v < 1 ? Math.round(v * 86400) : v;
  }
  if (typeof v === "string") return parseTempo(v);
  return null;
}

function Botao({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="ring-line rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] tracking-wider text-dim uppercase ring-1 transition-colors hover:text-cyan"
    >
      {children}
    </button>
  );
}
