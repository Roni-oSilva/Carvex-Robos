// Verificações da página de vendas (site/index.html).
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { raiz, robos } from "./gerar-docs.ts";
import { siteAtualizado } from "./gerar-site.ts";

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

test("todo robô da fábrica aparece no site, com os preços sugeridos de robot.json", () => {
  const robosSite = config().robos;
  assert.equal(robosSite.length, robos.length, "o site deve listar exatamente os robôs da fábrica");
  for (const doc of robos) {
    const r = robosSite.find((x) => x.id === doc.site.chave);
    assert.ok(r, `${doc.nome} não está no site (rode: npm run site:gerar)`);
    const j = JSON.parse(readFileSync(join(raiz, "robots", doc.id, "robot.json"), "utf8")) as { nome: string; precos: { implantacao: number; mensalidade: number; venda_unica: number } };
    assert.equal(r.nome, j.nome);
    assert.deepEqual([r.implantacao, r.mensalidade, r.unica], [j.precos.implantacao, j.precos.mensalidade, j.precos.venda_unica], r.nome);
  }
});

test("o site está em dia com os dados dos robôs (nada escrito à mão fora de sincronia)", () => {
  assert.equal(siteAtualizado(html), html, "site/index.html desatualizado: rode npm run site:gerar");
});

test("todo robô tem conversa de demonstração e ícone existente no site; chaves únicas", () => {
  const chaves = robos.map((r) => r.site.chave);
  assert.equal(new Set(chaves).size, chaves.length);
  for (const r of robos) {
    assert.ok(r.site.roteiro.length >= 5, `${r.nome}: conversa de demonstração curta demais`);
    assert.ok(r.site.roteiro.some((n) => n.fim), `${r.nome}: a conversa precisa de um passo final (fim: true)`);
    assert.ok(html.includes(`id="i-${r.site.icone}"`), `${r.nome}: ícone ${r.site.icone} não existe no sprite`);
    const setadas = new Set(r.site.roteiro.flatMap((n) => (n.ops ?? []).flatMap((o) => Object.keys(o.set ?? {}))));
    for (const n of r.site.roteiro) for (const v of (n.bot ?? "").matchAll(/\{(\w+)\}/g)) assert.ok(setadas.has(v[1]) || ["d", "h"].includes(v[1]), `${r.nome}: variável {${v[1]}} nunca é definida`);
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

test("vídeo dos robôs está na página e os arquivos existem", () => {
  assert.match(html, /<video[^>]+poster="assets\/carvex-robos-capa\.jpg"/);
  assert.match(html, /<source src="assets\/carvex-robos\.mp4"/);
  for (const f of ["carvex-robos.mp4", "carvex-robos-capa.jpg"]) assert.ok(existsSync(join(raiz, "site/assets", f)), f);
});
