// Atualiza site/index.html a partir dos dados de cada robô (scripts/docs/conteudo/*.ts → campo `site` e `precos`).
// Cada robô novo entra no site sozinho: cartão, preços, conversa de demonstração e opção do botão "Comprar um robô".
// Uso: node scripts/gerar-site.ts   (ou: npm run site:gerar)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, robos } from "./gerar-docs.ts";

const q = (s: string): string => JSON.stringify(s);

export function blocoRobos(): string {
  return robos.map((r) =>
    `    { id: ${q(r.site.chave)}, icone: ${q(r.site.icone)}, nome: ${q(r.nome)}, titulo: ${q(r.site.titulo)}, resumo: ${q(r.site.resumo)},\n` +
    `      tags: ${JSON.stringify(r.site.tags)}, implantacao: ${r.precos.implantacao}, mensalidade: ${r.precos.mensalidade}, unica: ${r.precos.venda_unica}, para: ${q(r.site.para)} },`).join("\n");
}

export function blocoRoteiros(): string {
  return robos.map((r) => `  ${r.site.chave}: [\n${r.site.roteiro.map((n) => `    ${JSON.stringify(n)},`).join("\n")}\n  ],`).join("\n");
}

function troca(html: string, nome: string, conteudo: string, indent: string): string {
  const re = new RegExp(`(/\\* @${nome}-inicio \\*/\\n)[\\s\\S]*?(\\n${indent}/\\* @${nome}-fim \\*/)`);
  if (!re.test(html)) throw new Error(`marcador @${nome} não encontrado em site/index.html`);
  return html.replace(re, (_m, a: string, b: string) => `${a}${conteudo}${b}`);
}

export function siteAtualizado(html: string): string {
  return troca(troca(html, "robos", blocoRobos(), "    "), "roteiros", blocoRoteiros(), "  ");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const p = join(raiz, "site/index.html");
  writeFileSync(p, siteAtualizado(readFileSync(p, "utf8")));
  console.log(`Site atualizado com ${robos.length} robôs: ${robos.map((r) => r.nome).join(", ")}.`);
}
