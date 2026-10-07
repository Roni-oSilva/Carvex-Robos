import test from "node:test";
import assert from "node:assert/strict";
import { makeWorld } from "../testing/helpers.ts";
import { echoRobot } from "../testing/echo-robot.ts";
import { criarEmpresa } from "./tenants.ts";
import { processInbound } from "./engine.ts";

const cfg = { empresa: { nome: "Loja Nova" }, faq: [{ pergunta: "Qual o horário?", resposta: "Das 8h às 12h." }] };

test("cria empresa nova, gera chave forte e isola dados da primeira", async () => {
  const w = makeWorld(echoRobot);
  const { tenant, adminToken } = criarEmpresa(w.env, echoRobot, { slug: "loja-nova", config: cfg, phoneNumberId: "555" });
  assert.ok(adminToken.length >= 30);
  assert.equal(w.env.repo.tenantByAdminToken(adminToken)!.id, tenant.id);
  assert.equal(JSON.stringify(w.env.repo.tenantById(tenant.id)).includes(adminToken), false, "a chave não pode ficar em texto puro no banco");
  // o robô passa a atender o número da nova empresa com a configuração dela
  await processInbound(w.env, echoRobot, { id: "n1", from: "5511999", timestamp: 1, type: "text", text: "qual o horário?", phoneNumberId: "555" });
  assert.equal(w.wa.sent.at(-1)!.msg.kind === "text" && (w.wa.sent.at(-1)!.msg as { body: string }).body, "Das 8h às 12h.");
});

test("recusa slug repetido, phone_number_id repetido, config inválida e chave fraca", () => {
  const w = makeWorld(echoRobot);
  criarEmpresa(w.env, echoRobot, { slug: "a1", config: cfg, phoneNumberId: "1" });
  assert.throws(() => criarEmpresa(w.env, echoRobot, { slug: "a1", config: cfg }), /Já existe/);
  assert.throws(() => criarEmpresa(w.env, echoRobot, { slug: "b2", config: cfg, phoneNumberId: "1" }), /já está em uso/);
  assert.throws(() => criarEmpresa(w.env, echoRobot, { slug: "c3", config: { empresa: {} } }), /Configuração inválida/);
  assert.throws(() => criarEmpresa(w.env, echoRobot, { slug: "d4", config: cfg, adminToken: "curta" }), /16 caracteres/);
  assert.throws(() => criarEmpresa(w.env, echoRobot, { slug: "Slug Ruim", config: cfg }), /slug inválido/);
});
