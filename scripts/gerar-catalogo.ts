// Gera ROBOTS.md (painel interno da fábrica) e CATALOG.md (catálogo comercial). Uso: node scripts/gerar-catalogo.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pontuar, type Criterio, type Oportunidade } from "../market-research/gerar.ts";
import { raiz, robos } from "./gerar-docs.ts";

const R$ = (n: number): string => `R$ ${n.toLocaleString("pt-BR")}`;

function carregar() {
  const criterios = (JSON.parse(readFileSync(join(raiz, "market-research/criterios.json"), "utf8")) as { criterios: Criterio[] }).criterios;
  const ops = JSON.parse(readFileSync(join(raiz, "market-research/opportunities.json"), "utf8")) as Oportunidade[];
  return { criterios, ops };
}

export function gerarCatalogo(): { robotsMd: string; catalogMd: string } {
  const { criterios, ops } = carregar();
  const nota = (ids: number[]): number => Math.max(...ids.map((id) => pontuar(ops.find((o) => o.id === id)!, criterios)));
  const fila = ops.filter((o) => o.status === "selecionada" && !o.robo).sort((a, b) => pontuar(b, criterios) - pontuar(a, criterios));

  const robotsMd = `# Robôs da fábrica

> Gerado por \`node scripts/gerar-catalogo.ts\`. Status possíveis: IDEIA · PESQUISA · PLANEJADO · DESENVOLVIMENTO · TESTE · PRONTO · COMERCIAL · DESCONTINUADO.
> **PRONTO** = checklist técnico e documental completo e testes passando (verificado por \`npm test\`). **COMERCIAL** exige, além disso, piloto com credenciais reais da Meta e cliente pagante — veja as pendências de cada robô.

| Robô | Segmento | Problema | Status | Potencial | Pontuação | Pasta |
|---|---|---|---|---|---|---|
${robos.map((r) => `| **${r.nome}** | ${r.segmentos.slice(0, 3).join(", ")} | ${r.problema.split(". ")[0].replace(/\*\*/g, "")}. | ${r.status} | ${r.potencial} | ${nota(r.oportunidades).toFixed(1)} | [\`robots/${r.id}\`](robots/${r.id}) |`).join("\n")}

## Próximos da fila (oportunidades selecionadas, ainda sem robô)

| Oportunidade | Segmento | Pontuação | Evidência | Status |
|---|---|---|---|---|
${fila.map((o) => `| #${o.id} ${o.nome} | ${o.segmento} | ${pontuar(o, criterios).toFixed(1)} | ${o.forcaEvidencia} | ${o.status.toUpperCase()} → PLANEJADO |`).join("\n")}

Ranking completo (22 oportunidades, com fontes): [market-research/opportunities.md](market-research/opportunities.md).

## Componentes compartilhados
Todos os robôs usam a camada [\`shared/\`](shared): webhook assinado, cliente da Cloud API, janela de 24 h, banco multiempresa, IA restrita ao cadastro, motor de conversa (opt-out, atendente humano), painel, Pix e validação de configuração.

## Pendências por robô antes de COMERCIAL
${robos.map((r) => `### ${r.nome}\n${r.pendencias.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}
`;

  const catalogMd = `# Catálogo de robôs de WhatsApp

> Preços são **sugestões** a validar no mercado (veja \`sales/PRECIFICACAO.md\` de cada robô). Resultados dependem do negócio; nenhum percentual de ganho é prometido.
> Todos usam a **API oficial** do WhatsApp (WhatsApp Business Platform), seguem a regra de janela de 24 h e respeitam PARAR/LGPD.

${robos.map((r) => `## ${r.nome} — ${r.slogan}

**Para:** ${r.segmentos.join(", ")}
**Status:** ${r.status} · **Versão:** ${r.versao}

${r.resumo}

**O que ele faz**
${r.funcionalidades.slice(0, 6).map((f) => `- ${f.titulo}: ${f.descricao}`).join("\n")}

**O que ele não faz (ainda)**
${r.limites.slice(0, 4).map((l) => `- ${l}`).join("\n")}

**Investimento sugerido**

| Implantação | Mensalidade | Venda única | Personalização |
|---|---|---|---|
| ${R$(r.precos.implantacao)} | ${R$(r.precos.mensalidade)}/mês | ${R$(r.precos.venda_unica)} | ${R$(r.precos.personalizacao_hora)}/hora |

**Material:** [Página de vendas](robots/${r.id}/sales/SALES-PAGE.md) · [Pitch](robots/${r.id}/sales/PITCH.md) · [Funcionalidades](robots/${r.id}/sales/FEATURES.md) · [Objeções](robots/${r.id}/sales/OBJECTIONS.md) · [FAQ](robots/${r.id}/sales/FAQ.md) · [Roteiro de demonstração](robots/${r.id}/sales/DEMO-SCRIPT.md) · [Conversas de exemplo](robots/${r.id}/demo/CONVERSAS.md)
`).join("\n---\n\n")}

## Como contratar
1. Demonstração de 15 minutos com dados fictícios (\`demo/servidor-demo.ts\`).
2. Piloto com o seu número de teste e os seus dados.
3. Implantação (número na Meta, configuração, treinamento) e entrega do painel.
`;
  return { robotsMd, catalogMd };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { robotsMd, catalogMd } = gerarCatalogo();
  writeFileSync(join(raiz, "ROBOTS.md"), robotsMd);
  writeFileSync(join(raiz, "CATALOG.md"), catalogMd);
  console.log("ROBOTS.md e CATALOG.md gerados.");
}
