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
  assert.ok(existsSync(join(raiz, "site/assets/logo-carvex.svg")));
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

test("número de WhatsApp é vazio ou só dígitos (DDI+DDD+número)", () => {
  assert.match(config().whatsapp, /^(\d{10,15})?$/);
});

test("não promete resultados: sem percentuais de ganho", () => {
  // só o texto que a pessoa lê: sem CSS, JS nem atributos das tags
  const visivel = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  assert.ok(!/\d\s?%/.test(visivel), "há percentual na copy");
  assert.match(visivel, /não prometemos percentuais/i);
});
