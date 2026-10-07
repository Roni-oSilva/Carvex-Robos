import test from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { makeWorld, signedHeaders, TEST_ADMIN, TEST_VERIFY, webhookPayload, type TestWorld } from "../testing/helpers.ts";
import { echoRobot, type EchoSettings } from "../testing/echo-robot.ts";

async function boot(w: TestWorld<EchoSettings>) {
  const app = w.app();
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  return { app, base, close: () => new Promise<void>((r) => app.server.close(() => r())) };
}

async function login(base: string): Promise<string> {
  const r = await fetch(`${base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `token=${TEST_ADMIN}` });
  assert.equal(r.status, 303);
  return r.headers.get("set-cookie")!.split(";")[0];
}

test("health e verificação do webhook (GET)", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    assert.equal((await (await fetch(`${s.base}/health`)).json() as { status: string }).status, "ok");
    const ok = await fetch(`${s.base}/webhook?hub.mode=subscribe&hub.verify_token=${TEST_VERIFY}&hub.challenge=777`);
    assert.equal(await ok.text(), "777");
    assert.equal((await fetch(`${s.base}/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=777`)).status, 403);
  } finally { await s.close(); }
});

test("POST /webhook: sem assinatura 401; assinado processa e responde", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    const body = JSON.stringify(webhookPayload("5511987654321", "qual o horário de funcionamento?"));
    assert.equal((await fetch(`${s.base}/webhook`, { method: "POST", body, headers: { "content-type": "application/json" } })).status, 401);
    assert.equal((await fetch(`${s.base}/webhook`, { method: "POST", body, headers: { ...signedHeaders(body), "x-hub-signature-256": "sha256=00" } })).status, 401);
    assert.equal(w.wa.sent.length, 0);

    assert.equal((await fetch(`${s.base}/webhook`, { method: "POST", body, headers: signedHeaders(body) })).status, 200);
    await s.app.idle();
    assert.deepEqual(w.drain(), ["Das 9h às 18h."]);

    const bad = "{nao é json";
    assert.equal((await fetch(`${s.base}/webhook`, { method: "POST", body: bad, headers: signedHeaders(bad) })).status, 400);
  } finally { await s.close(); }
});

test("mesmo evento reenviado pela Meta não gera resposta duplicada", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    const body = JSON.stringify(webhookPayload("5511987654321", "horário de funcionamento", "wamid.FIXO"));
    for (let i = 0; i < 3; i++) await fetch(`${s.base}/webhook`, { method: "POST", body, headers: signedHeaders(body) });
    await s.app.idle();
    assert.equal(w.wa.sent.length, 1);
  } finally { await s.close(); }
});

test("status 'failed' da Meta atualiza a mensagem enviada", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    await w.say("5511987654321", "horário de funcionamento");
    const id = w.wa.sent[0].id;
    const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ changes: [{ value: { metadata: { phone_number_id: "100200300" }, statuses: [{ id, status: "failed", recipient_id: "5511987654321" }] } }] }] });
    await fetch(`${s.base}/webhook`, { method: "POST", body, headers: signedHeaders(body) });
    await s.app.idle();
    assert.equal(w.env.db.get<{ status: string }>("SELECT status FROM messages WHERE wa_message_id = ?", id)!.status, "failed");
  } finally { await s.close(); }
});

test("painel exige login; chave errada 401; certa abre o painel", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    const r0 = await fetch(`${s.base}/admin`, { redirect: "manual" });
    assert.equal(r0.status, 303);
    assert.equal(r0.headers.get("location"), "/admin/login");

    const bad = await fetch(`${s.base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "token=chave-errada-1234567890" });
    assert.equal(bad.status, 401);

    const cookie = await login(s.base);
    const page = await (await fetch(`${s.base}/admin`, { headers: { cookie } })).text();
    assert.match(page, /Olá Empresa Teste/);
    // cookie adulterado é rejeitado
    const r = await fetch(`${s.base}/admin`, { redirect: "manual", headers: { cookie: cookie.replace(/.$/, "x") } });
    assert.equal(r.status, 303);
  } finally { await s.close(); }
});

test("login: limite de tentativas contra força bruta", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    let last = 0;
    for (let i = 0; i < 12; i++) {
      last = (await fetch(`${s.base}/admin/login`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `token=tentativa-${i}-errada-123456` })).status;
    }
    assert.equal(last, 429);
  } finally { await s.close(); }
});

test("XSS: nome malicioso do contato aparece escapado no painel", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    await w.say("5511987654321", "horário de funcionamento", { name: `<script>alert('x')</script>` });
    const cookie = await login(s.base);
    for (const path of ["/admin/clientes", "/admin/conversas"]) {
      const html = await (await fetch(`${s.base}${path}`, { headers: { cookie } })).text();
      assert.ok(!html.includes("<script>alert"), path);
      assert.ok(html.includes("&lt;script&gt;"), path);
    }
  } finally { await s.close(); }
});

test("CSRF: POST de outra origem é recusado", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    const cookie = await login(s.base);
    const r = await fetch(`${s.base}/admin/config`, { method: "POST", redirect: "manual", headers: { cookie, origin: "https://site-malicioso.com", "content-type": "application/x-www-form-urlencoded" }, body: "json={}" });
    assert.equal(r.status, 403);
  } finally { await s.close(); }
});

test("configurações: JSON inválido ou fora do esquema não é salvo; válido é", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    const cookie = await login(s.base);
    const post = (json: string) => fetch(`${s.base}/admin/config`, { method: "POST", redirect: "manual", headers: { cookie, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ json }).toString() });
    assert.match((await post("{quebrado")).headers.get("location")!, /erro=/);
    assert.match((await post("{}")).headers.get("location")!, /erro=/);
    const novo = JSON.stringify({ empresa: { nome: "Nome Novo" }, faq: [] });
    assert.equal((await post(novo)).headers.get("location"), "/admin/config?ok=1");
    assert.match(w.env.repo.tenantById(w.tenant.id)!.settings, /Nome Novo/);
  } finally { await s.close(); }
});

test("atendente responde pelo painel só com a janela de 24h aberta", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    await w.say("5511987654321", "atendente");
    w.drain();
    let cookie = await login(s.base);
    const c = w.env.repo.contactByWaId(w.tenant.id, "5511987654321")!;
    const post = () => fetch(`${s.base}/admin/conversas/${c.id}/responder`, { method: "POST", redirect: "manual", headers: { cookie, "content-type": "application/x-www-form-urlencoded" }, body: "texto=Olá, aqui é a equipe" });
    await post();
    assert.deepEqual(w.drain(), ["Olá, aqui é a equipe"]);
    w.advance(25 * 3_600_000);
    // a sessão de 8h expirou junto: sem novo login o painel nega o acesso
    assert.equal((await post()).headers.get("location"), "/admin/login");
    cookie = await login(s.base);
    const r = await post();
    assert.match(r.headers.get("location")!, /erro=/);
    assert.equal(w.drain().length, 0);
  } finally { await s.close(); }
});

test("LGPD: excluir cliente pelo painel exige confirmação e apaga tudo", async () => {
  const w = makeWorld(echoRobot);
  const s = await boot(w);
  try {
    await w.say("5511987654321", "horário de funcionamento");
    const c = w.env.repo.contactByWaId(w.tenant.id, "5511987654321")!;
    const cookie = await login(s.base);
    const post = (body: string) => fetch(`${s.base}/admin/clientes/${c.id}/excluir`, { method: "POST", redirect: "manual", headers: { cookie, "content-type": "application/x-www-form-urlencoded" }, body });
    await post("");
    assert.ok(w.env.repo.contact(w.tenant.id, c.id));
    await post("confirmo=1");
    assert.equal(w.env.repo.contact(w.tenant.id, c.id), undefined);
  } finally { await s.close(); }
});
