// Gera a documentação de cada robô a partir de scripts/docs/. Uso: node scripts/gerar-docs.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { changelog, clientManual, configuracao, envExample, instalacao, lgpd, manual, readme, requisitos, seguranca, tecnico, vendas } from "./docs/comum.ts";
import { agendazap } from "./docs/conteudo/agendazap.ts";
import { cobrazap } from "./docs/conteudo/cobrazap.ts";
import { pedidozap } from "./docs/conteudo/pedidozap.ts";
import type { RobotDoc } from "./docs/tipos.ts";

export const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
export const robos: RobotDoc[] = [agendazap, cobrazap, pedidozap];

/** Todos os arquivos de documentação de todos os robôs: caminho relativo → conteúdo. */
export function gerarTudo(): Map<string, string> {
  const out = new Map<string, string>();
  for (const r of robos) {
    const base = `robots/${r.id}`;
    out.set(`${base}/README.md`, readme(r));
    out.set(`${base}/MANUAL.md`, manual(r));
    out.set(`${base}/INSTALACAO.md`, instalacao(r));
    out.set(`${base}/CONFIGURACAO.md`, configuracao(r));
    out.set(`${base}/CHANGELOG.md`, changelog(r));
    out.set(`${base}/.env.example`, envExample(r));
    out.set(`${base}/docs/TECHNICAL.md`, tecnico(r));
    out.set(`${base}/docs/CLIENT-MANUAL.md`, clientManual(r));
    out.set(`${base}/docs/FLUXOS.md`, r.fluxos);
    out.set(`${base}/docs/LGPD.md`, lgpd(r));
    out.set(`${base}/docs/SEGURANCA.md`, seguranca(r));
    out.set(`${base}/docs/REQUISITOS.md`, requisitos(r));
    for (const [nome, md] of Object.entries(vendas(r))) out.set(`${base}/sales/${nome}`, md);
    out.set(`${base}/robot.json`, JSON.stringify({
      id: r.id, nome: r.nome, versao: r.versao, status: r.status, slogan: r.slogan, segmentos: r.segmentos, publico: r.publico, problema: r.problema,
      oportunidades: r.oportunidades, potencial: r.potencial, funcionalidades: r.funcionalidades.map((f) => f.titulo), precos: r.precos, pendencias: r.pendencias,
    }, null, 2) + "\n");
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const [rel, conteudo] of gerarTudo()) {
    const p = join(raiz, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, conteudo);
  }
  console.log(`Documentação gerada para ${robos.map((r) => r.nome).join(", ")}.`);
}
