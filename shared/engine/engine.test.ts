import test from "node:test";
import assert from "node:assert/strict";
import { makeWorld } from "../testing/helpers.ts";
import { echoRobot } from "../testing/echo-robot.ts";
import { sendProactive } from "./proactive.ts";
import { FALLBACK_MESSAGE } from "../ai/knowledge.ts";
import { RateLimiter } from "../utils/rate-limit.ts";

const CLIENTE = "5511987654321";

test("responde pela FAQ e registra a conversa", async () => {
  const w = makeWorld(echoRobot);
  assert.equal(await w.say(CLIENTE, "Qual o horário de funcionamento?", { name: "Ana" }), "bot");
  assert.deepEqual(w.drain(), ["Das 9h às 18h."]);
  const c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  assert.equal(c.nome, "Ana");
  assert.deepEqual(w.env.repo.messages(w.tenant.id, c.id).map((m) => m.direction), ["in", "out"]);
});

test("mensagem repetida pela Meta (mesmo id) é processada uma única vez", async () => {
  const w = makeWorld(echoRobot);
  const msg = { id: "wamid.REPETIDA", from: CLIENTE, timestamp: 1, type: "text" as const, text: "horário de funcionamento", phoneNumberId: "100200300" };
  const { processInbound } = await import("./engine.ts");
  assert.equal(await processInbound(w.env, echoRobot, msg), "bot");
  assert.equal(await processInbound(w.env, echoRobot, msg), "duplicate");
  assert.equal(w.wa.sent.length, 1);
});

test("pergunta sem resposta na base: não inventa e encaminha ao humano", async () => {
  const w = makeWorld(echoRobot);
  await w.say(CLIENTE, "vocês vendem pizza?");
  assert.deepEqual(w.drain(), [FALLBACK_MESSAGE]);
  const row = w.env.repo.conversations(w.tenant.id)[0];
  assert.equal(row.mode, "human");
  assert.equal(row.handoff_reason, "sem resposta");
});

test("pedido de atendente muda para modo humano e o robô se cala", async () => {
  const w = makeWorld(echoRobot);
  assert.equal(await w.say(CLIENTE, "quero falar com um atendente"), "human_request");
  assert.equal(w.drain().length, 1);
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "human_mode");
  assert.equal(w.drain().length, 0);
  // mensagem do cliente continua registrada para o atendente ler
  const c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  assert.equal(w.env.repo.messages(w.tenant.id, c.id).filter((m) => m.direction === "in").length, 2);
});

test("robô volta sozinho depois de 12h sem atendimento humano", async () => {
  const w = makeWorld(echoRobot);
  await w.say(CLIENTE, "atendente");
  w.advance(13 * 3_600_000);
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "bot");
});

test("erro interno no fluxo vira handoff com mensagem educada", async () => {
  const w = makeWorld(echoRobot);
  assert.equal(await w.say(CLIENTE, "explodir"), "error");
  assert.match(w.drain()[0], /Já chamei um atendente/);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].handoff_reason, "erro interno");
});

test("falha ao enviar não derruba o processamento e fica marcada", async () => {
  const w = makeWorld(echoRobot);
  w.wa.failNext = 1;
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "bot");
  const c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  assert.equal(w.env.repo.messages(w.tenant.id, c.id).at(-1)!.status, "failed");
});

test("PARAR bloqueia mensagens proativas; REATIVAR libera", async () => {
  const w = makeWorld(echoRobot);
  await w.say(CLIENTE, "horário de funcionamento");
  assert.equal(await w.say(CLIENTE, "PARAR"), "optout");
  let c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  assert.equal(c.opt_out, 1);
  w.drain();
  assert.equal(await sendProactive(w.env, w.tenant, c, { text: "lembrete" }, w.env.clock()), "skipped_optout");
  assert.equal(w.drain().length, 0);
  assert.equal(await w.say(CLIENTE, "reativar"), "optin");
  c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  assert.equal(await sendProactive(w.env, w.tenant, c, { text: "lembrete" }, w.env.clock()), "sent");
});

test("proativa: dentro de 24h vai texto; fora, só template; sem template não envia", async () => {
  const w = makeWorld(echoRobot);
  await w.say(CLIENTE, "horário de funcionamento");
  w.drain();
  const c = () => w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  const tpl = { name: "lembrete_v1", language: "pt_BR", params: ["Ana", "10:00"] };

  assert.equal(await sendProactive(w.env, w.tenant, c(), { text: "Oi!", template: tpl }, w.env.clock()), "sent");
  assert.equal(w.wa.sent.at(-1)!.msg.kind, "text");

  w.advance(25 * 3_600_000);
  assert.equal(await sendProactive(w.env, w.tenant, c(), { text: "Oi!", template: tpl }, w.env.clock()), "sent_template");
  assert.equal(w.wa.sent.at(-1)!.msg.kind, "template");

  const before = w.wa.sent.length;
  assert.equal(await sendProactive(w.env, w.tenant, c(), { text: "Oi!" }, w.env.clock()), "skipped_no_template");
  assert.equal(w.wa.sent.length, before);
});

test("multiempresa: mensagens e contatos ficam isolados por tenant", async () => {
  const w = makeWorld(echoRobot);
  const t2 = w.env.repo.createTenant({ slug: "outra", nome: "Outra Empresa", phone_number_id: "999", settings: echoRobot.defaultSettings() }, w.env.clock());
  const { processInbound } = await import("./engine.ts");
  await w.say(CLIENTE, "horário de funcionamento");
  await processInbound(w.env, echoRobot, { id: "x1", from: CLIENTE, timestamp: 1, type: "text", text: "horário de funcionamento", phoneNumberId: "999" });
  const c1 = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  const c2 = w.env.repo.contactByWaId(t2.id, CLIENTE)!;
  assert.notEqual(c1.id, c2.id);
  assert.equal(w.env.repo.messages(w.tenant.id, c2.id).length, 0); // tenant 1 não enxerga contato do 2
  assert.equal(w.env.repo.contact(w.tenant.id, c2.id), undefined);
  assert.equal(w.env.repo.conversations(t2.id).length, 1);
});

test("webhook para número desconhecido é ignorado", async () => {
  const w = makeWorld(echoRobot);
  const { processInbound } = await import("./engine.ts");
  const out = await processInbound(w.env, echoRobot, { id: "z", from: CLIENTE, timestamp: 1, type: "text", text: "oi", phoneNumberId: "NAO-EXISTE" });
  assert.equal(out, "ignored");
  assert.equal(w.wa.sent.length, 0);
});

test("limite de mensagens por contato", async () => {
  const w = makeWorld(echoRobot);
  w.env.contactLimiter = new RateLimiter(2, 60_000);
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "bot");
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "bot");
  assert.equal(await w.say(CLIENTE, "horário de funcionamento"), "rate_limited");
});

test("LGPD: purge por retenção e exclusão em cascata", async () => {
  const w = makeWorld(echoRobot);
  await w.say(CLIENTE, "horário de funcionamento");
  const c = w.env.repo.contactByWaId(w.tenant.id, CLIENTE)!;
  w.advance(200 * 86_400_000);
  assert.equal(w.env.repo.purgeMessagesOlderThan(180, w.env.clock()), 2);
  assert.equal(w.env.repo.messages(w.tenant.id, c.id).length, 0);
  w.env.repo.deleteContact(w.tenant.id, c.id);
  assert.equal(w.env.repo.contactByWaId(w.tenant.id, CLIENTE), undefined);
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM conversations")!.n, 0);
});

test("migrações são idempotentes", () => {
  const w = makeWorld(echoRobot);
  w.env.db.migrate(echoRobot.migrations);
  assert.ok(w.env.db.get("SELECT 1 FROM _migrations WHERE id = 'shared-001-base'"));
});
