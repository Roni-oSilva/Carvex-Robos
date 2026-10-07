// Gera market-research/opportunities.md a partir de opportunities.json + criterios.json.
// Uso: node market-research/gerar.ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface Criterio { chave: string; nome: string; peso: number }
export interface Evidencia { fonte: string; url: string; nota: string }
export interface Oportunidade {
  id: number; nome: string; segmento: string; problema: string; publico: string;
  evidencia: Evidencia[]; forcaEvidencia: string; comoResolvemHoje: string; porqueRobo: string;
  funcionalidades: string[]; complexidade: string; potencialComercial: string;
  concorrencia: string; diferencial: string; notas: Record<string, number>;
  status: string; robo: string | null; observacao?: string;
}

export function pontuar(o: Oportunidade, criterios: Criterio[]): number {
  const soma = criterios.reduce((s, c) => s + c.peso * (o.notas[c.chave] ?? 0), 0);
  return Math.round(soma) / 10;
}

export function validar(ops: Oportunidade[], criterios: Criterio[]): string[] {
  const erros: string[] = [];
  const pesos = criterios.reduce((s, c) => s + c.peso, 0);
  if (pesos !== 100) erros.push(`Soma dos pesos deve ser 100 (é ${pesos}).`);
  for (const o of ops) {
    if (!o.evidencia?.length) erros.push(`#${o.id}: sem evidência (proibido inventar necessidades).`);
    for (const e of o.evidencia ?? []) if (!/^https?:\/\//.test(e.url)) erros.push(`#${o.id}: URL inválida.`);
    for (const c of criterios) {
      const n = o.notas[c.chave];
      if (typeof n !== "number" || n < 0 || n > 10) erros.push(`#${o.id}: nota inválida em ${c.chave}.`);
    }
  }
  return erros;
}

export function gerarMarkdown(ops: Oportunidade[], criterios: Criterio[]): string {
  const ranked = ops.map((o) => ({ o, p: pontuar(o, criterios) })).sort((a, b) => b.p - a.p);
  const L: string[] = [];
  L.push("# Banco de oportunidades — Fábrica de Robôs WhatsApp", "");
  L.push("> Arquivo GERADO por `node market-research/gerar.ts` a partir de `opportunities.json`. Edite o JSON, não este arquivo.", "");
  L.push("## Aviso sobre as evidências", "");
  L.push("A maior parte das fontes encontradas são blogs de **fornecedores de software** (têm interesse comercial em destacar o problema). Os números citados **não foram verificados de forma independente**. Cada oportunidade traz a *força da evidência* (forte / média / fraca). Nenhuma foi classificada como *forte*: nenhuma tem pesquisa independente com amostra representativa. **Valide com 5–10 entrevistas de clientes reais antes de investir em vendas.**", "");
  L.push("## Como a pontuação é calculada", "");
  L.push(criterios.map((c) => `- ${c.nome}: peso ${c.peso}`).join("\n"), "");
  L.push("Pontuação = soma(peso × nota de 0 a 10) / 10 → escala 0–100. As notas são julgamento do autor, não medição.", "");
  L.push("## Ranking", "", "| # | Pontos | Oportunidade | Segmento | Evidência | Status | Robô |", "|---|---|---|---|---|---|---|");
  ranked.forEach(({ o, p }, i) => L.push(`| ${i + 1} | **${p.toFixed(1)}** | ${o.nome} | ${o.segmento} | ${o.forcaEvidencia} | ${o.status} | ${o.robo ?? "—"} |`));
  L.push("", "## Fichas", "");
  for (const { o, p } of ranked) {
    L.push(`### Oportunidade #${o.id} — ${o.nome}`, "");
    L.push(`**Nome:** ${o.nome}  `, `**Segmento:** ${o.segmento}  `, `**Problema:** ${o.problema}  `, `**Público:** ${o.publico}  `);
    L.push("**Evidência:**");
    for (const e of o.evidencia) L.push(`- [${e.fonte}](${e.url}) — ${e.nota}`);
    L.push(`- *Força da evidência:* ${o.forcaEvidencia}`, "");
    L.push(`**Como resolvem hoje:** ${o.comoResolvemHoje}  `, `**Por que um robô seria útil:** ${o.porqueRobo}  `);
    L.push(`**Solução / funcionalidades:** ${o.funcionalidades.join("; ")}  `);
    L.push(`**Complexidade:** ${o.complexidade}  `, `**Potencial comercial:** ${o.potencialComercial}  `, `**Pontuação:** ${p.toFixed(1)} / 100  `);
    L.push(`**Concorrentes:** ${o.concorrencia}  `, `**Diferencial:** ${o.diferencial}  `, `**Status:** ${o.status}${o.robo ? ` → \`robots/${o.robo}\`` : ""}  `);
    if (o.observacao) L.push(`**Observação:** ${o.observacao}  `);
    L.push("");
  }
  return L.join("\n");
}

const aqui = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const criterios = (JSON.parse(readFileSync(join(aqui, "criterios.json"), "utf8")) as { criterios: Criterio[] }).criterios;
  const ops = JSON.parse(readFileSync(join(aqui, "opportunities.json"), "utf8")) as Oportunidade[];
  const erros = validar(ops, criterios);
  if (erros.length) { console.error(erros.join("\n")); process.exit(1); }
  writeFileSync(join(aqui, "opportunities.md"), gerarMarkdown(ops, criterios));
  console.log(`opportunities.md gerado com ${ops.length} oportunidades.`);
}
