// Verificações da página de vendas (site/index.html).
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { raiz } from "./gerar-docs.ts";

const html = readFileSync(join(raiz, "site/index.html"), "utf8");

function config(): { marca: string; whatsapp: string; robos: { id: string; nome: string; implantacao: number; mensalidade: number; unica: number }[] } {
  const m = /const CONFIG = (\{[\s\S]*?\n\});/.exec(html);
  assert.ok(m, "CONFIG não encontrado");
  return vm.runInNewContext(`(${m[1]})`);
}

test("página usa o nome Carvex Tecnologia, tem botão de compra e a logo existe", () => {
  assert.match(html, /<title>Carvex Tecnologia/);
  assert.ok((html.match(/data-comprar/g) ?? []).length >= 4);
  assert.match(html, /Comprar um robô/);
  for (const f of ["carvex-logo-azul.png", "carvex-logo-branco.png", "carvex-simbolo-azul.png", "carvex-simbolo-branco.png"]) assert.ok(existsSync(join(raiz, "site/assets", f)), f);
  assert.ok(!html.includes("logo-carvex.svg"), "ainda referencia a logo provisória");
  assert.equal(config().marca, "Carvex Tecnologia");
});

test("preços da página = preços sugeridos de cada robô (robot.json)", () => {
  const ids: Record<string, string> = { agenda: "robot-001-agendazap", cobra: "robot-002-cobrazap", pedido: "robot-003-pedidozap" };
  for (const r of config().robos) {
    const j = JSON.parse(readFileSync(join(raiz, "robots", ids[r.id], "robot.json"), "utf8")) as { nome: string; precos: { implantacao: number; mensalidade: number; venda_unica: number } };
    assert.equal(r.nome, j.nome);
    assert.deepEqual([r.implantacao, r.mensalidade, r.unica], [j.precos.implantacao, j.precos.mensalidade, j.precos.venda_unica], r.nome);
  }
});

test("página é autocontida: sem scripts/estilos/imagens de terceiros e sem dados pessoais", () => {
  const externos = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(externos, []);
  assert.ok(!/<script[^>]+src=/.test(html));
});

test("botão Comprar leva ao WhatsApp 55 91 98190-2529", () => {
  assert.equal(config().whatsapp, "5591981902529");
  assert.match(html, /https:\/\/wa\.me\/\$\{CONFIG\.whatsapp\}\?text=/);
});

test("sem emojis em nenhum texto da página (nem nas conversas de demonstração)", () => {
  const achados = [...html.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]).filter((c) => !"©®™".includes(c));
  assert.deepEqual(achados, []);
  assert.ok(!/\bemoji\b/.test(html.replace(/sem emoji/g, "")), "sobrou campo emoji no código");
});

test("Vercel: vercel.json serve a pasta site/ e os dois arquivos têm os mesmos cabeçalhos", () => {
  const raizCfg = JSON.parse(readFileSync(join(raiz, "vercel.json"), "utf8")) as { outputDirectory: string; framework: null; headers: unknown };
  const siteCfg = JSON.parse(readFileSync(join(raiz, "site/vercel.json"), "utf8")) as { headers: unknown };
  assert.equal(raizCfg.outputDirectory, "site");
  assert.equal(raizCfg.framework, null);
  assert.ok(existsSync(join(raiz, raizCfg.outputDirectory, "index.html")));
  assert.deepEqual(siteCfg.headers, raizCfg.headers);
  const csp = JSON.stringify(raizCfg.headers);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.ok(existsSync(join(raiz, ".vercelignore")));
});

test("não promete resultados: sem percentuais de ganho", () => {
  // só o texto que a pessoa lê: sem CSS, JS nem atributos das tags
  const visivel = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  assert.ok(!/\d\s?%/.test(visivel), "há percentual na copy");
  assert.match(visivel, /não prometemos percentuais/i);
});
