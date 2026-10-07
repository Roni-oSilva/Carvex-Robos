import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gerarMarkdown, pontuar, validar, type Criterio, type Oportunidade } from "./gerar.ts";

const aqui = (f: string) => fileURLToPath(new URL(f, import.meta.url));
const criterios = (JSON.parse(readFileSync(aqui("./criterios.json"), "utf8")) as { criterios: Criterio[] }).criterios;
const ops = JSON.parse(readFileSync(aqui("./opportunities.json"), "utf8")) as Oportunidade[];

test("banco de oportunidades: pelo menos 20, todas com evidência e notas válidas", () => {
  assert.ok(ops.length >= 20, `só ${ops.length}`);
  assert.deepEqual(validar(ops, criterios), []);
  assert.equal(new Set(ops.map((o) => o.id)).size, ops.length);
});

test("nenhuma oportunidade é marcada com evidência 'forte' sem pesquisa independente", () => {
  assert.ok(ops.every((o) => ["média", "fraca"].includes(o.forcaEvidencia)));
});

test("pontuação fica entre 0 e 100 e respeita os pesos", () => {
  for (const o of ops) { const p = pontuar(o, criterios); assert.ok(p >= 0 && p <= 100, `${o.id}: ${p}`); }
  const maximo = { ...ops[0], notas: Object.fromEntries(criterios.map((c) => [c.chave, 10])) };
  const minimo = { ...ops[0], notas: Object.fromEntries(criterios.map((c) => [c.chave, 0])) };
  assert.equal(pontuar(maximo, criterios), 100);
  assert.equal(pontuar(minimo, criterios), 0);
});

test("validar rejeita oportunidade sem fonte e nota fora da faixa", () => {
  const ruim = [{ ...ops[0], evidencia: [] }, { ...ops[1], notas: { ...ops[1].notas, tamanho: 11 } }];
  const erros = validar(ruim, criterios);
  assert.ok(erros.some((e) => /sem evidência/.test(e)));
  assert.ok(erros.some((e) => /nota inválida/.test(e)));
});

test("opportunities.md em disco está atualizado em relação ao JSON", () => {
  assert.equal(readFileSync(aqui("./opportunities.md"), "utf8"), gerarMarkdown(ops, criterios));
});

test("toda oportunidade 'concluída' aponta para um robô que existe", () => {
  for (const o of ops.filter((x) => x.robo)) assert.ok(existsSync(aqui(`../robots/${o.robo}`)), `${o.id} → ${o.robo}`);
});
