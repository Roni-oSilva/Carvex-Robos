import test from "node:test";
import assert from "node:assert/strict";
import { parseWebhook, signBody, verifyChallenge, verifySignature } from "./webhook.ts";
import { buildPayload, CloudApiClient } from "./cloud-api.ts";
import { inServiceWindow } from "./window.ts";
import { webhookPayload } from "../testing/helpers.ts";

const SECRET = "app-secret";

test("assinatura válida passa; corpo adulterado, header ausente ou segredo errado falham", () => {
  const body = Buffer.from('{"a":1}');
  const good = signBody(body, SECRET);
  assert.ok(verifySignature(body, good, SECRET));
  assert.ok(!verifySignature(Buffer.from('{"a":2}'), good, SECRET));
  assert.ok(!verifySignature(body, undefined, SECRET));
  assert.ok(!verifySignature(body, good, "outro"));
  assert.ok(!verifySignature(body, "sha256=abc", SECRET));
  assert.ok(!verifySignature(body, good, ""));
});

test("verifyChallenge devolve o challenge só com token correto", () => {
  const q = (t: string) => new URLSearchParams({ "hub.mode": "subscribe", "hub.verify_token": t, "hub.challenge": "12345" });
  assert.equal(verifyChallenge(q("tok"), "tok"), "12345");
  assert.equal(verifyChallenge(q("errado"), "tok"), null);
  assert.equal(verifyChallenge(new URLSearchParams({ "hub.mode": "subscribe" }), "tok"), null);
  assert.equal(verifyChallenge(q(""), ""), null);
});

test("parseWebhook entende texto, botão, lista, mídia e status", () => {
  const payload = {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ value: {
      metadata: { phone_number_id: "PN1" },
      contacts: [{ wa_id: "5511999", profile: { name: "Ana" } }],
      messages: [
        { id: "m1", from: "5511999", timestamp: "10", type: "text", text: { body: "oi" } },
        { id: "m2", from: "5511999", timestamp: "11", type: "interactive", interactive: { type: "button_reply", button_reply: { id: "sim", title: "Sim" } } },
        { id: "m3", from: "5511999", timestamp: "12", type: "interactive", interactive: { type: "list_reply", list_reply: { id: "svc_1", title: "Corte" } } },
        { id: "m4", from: "5511999", timestamp: "13", type: "image", image: { id: "media9", caption: "foto" } },
        { id: "m5", from: "5511999", timestamp: "14", type: "sticker" },
      ],
      statuses: [{ id: "w1", status: "delivered", recipient_id: "5511999" }, { id: "w2", status: "failed", recipient_id: "5511999", errors: [{ code: 131047 }] }],
    } }] }],
  };
  const r = parseWebhook(payload);
  assert.deepEqual(r.messages.map((m) => [m.type, m.text, m.replyId]), [["text", "oi", undefined], ["button", "Sim", "sim"], ["list", "Corte", "svc_1"], ["image", "foto", undefined], ["other", undefined, undefined]]);
  assert.equal(r.messages[0].name, "Ana");
  assert.equal(r.messages[0].phoneNumberId, "PN1");
  assert.equal(r.statuses[1].errorCode, 131047);
});

test("parseWebhook ignora lixo sem lançar erro", () => {
  for (const x of [null, undefined, 1, "x", {}, { object: "page" }, { object: "whatsapp_business_account", entry: "x" }]) {
    assert.deepEqual(parseWebhook(x), { messages: [], statuses: [] });
  }
  assert.equal(parseWebhook(webhookPayload("5511", "oi")).messages.length, 1);
});

test("buildPayload respeita limites do WhatsApp", () => {
  const b = buildPayload("55", { kind: "buttons", body: "x".repeat(2000), buttons: [1, 2, 3, 4].map((i) => ({ id: `b${i}`, title: "Título muito longo para botão" })) }) as any;
  assert.equal(b.interactive.action.buttons.length, 3);
  assert.ok(b.interactive.action.buttons[0].reply.title.length <= 20);
  assert.ok(b.interactive.body.text.length <= 1024);
  const l = buildPayload("55", { kind: "list", body: "x", button: "Ver opções de horários", rows: Array.from({ length: 15 }, (_, i) => ({ id: `r${i}`, title: "t".repeat(40), description: "d".repeat(100) })) }) as any;
  assert.equal(l.interactive.action.sections[0].rows.length, 10);
  assert.ok(l.interactive.action.sections[0].rows[0].title.length <= 24);
  assert.ok(l.interactive.action.sections[0].rows[0].description.length <= 72);
  const t = buildPayload("55", { kind: "template", name: "lembrete", language: "pt_BR", params: ["Ana", "10:00"] }) as any;
  assert.deepEqual(t.template.components[0].parameters.map((p: any) => p.text), ["Ana", "10:00"]);
});

function fakeFetch(responses: { status: number; body: unknown }[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const f = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const r = responses.shift()!;
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { f, calls };
}

test("CloudApiClient envia com Bearer e devolve o id", async () => {
  const { f, calls } = fakeFetch([{ status: 200, body: { messages: [{ id: "wamid.X" }] } }]);
  const c = new CloudApiClient({ token: "TKN", phoneNumberId: "PN", fetchImpl: f, sleep: async () => {} });
  const r = await c.send("5511", { kind: "text", body: "oi" });
  assert.equal(r.id, "wamid.X");
  assert.match(calls[0].url, /\/v21\.0\/PN\/messages$/);
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer TKN");
});

test("CloudApiClient tenta de novo em 5xx/429 mas não em 4xx", async () => {
  const ok = { status: 200, body: { messages: [{ id: "w" }] } };
  const a = fakeFetch([{ status: 500, body: {} }, { status: 429, body: {} }, ok]);
  const c1 = new CloudApiClient({ token: "T", phoneNumberId: "P", fetchImpl: a.f, sleep: async () => {} });
  assert.equal((await c1.send("1", { kind: "text", body: "x" })).id, "w");
  assert.equal(a.calls.length, 3);
  const b = fakeFetch([{ status: 400, body: { error: { message: "inválido", code: 100 } } }, ok]);
  const c2 = new CloudApiClient({ token: "T", phoneNumberId: "P", fetchImpl: b.f, sleep: async () => {} });
  await assert.rejects(c2.send("1", { kind: "text", body: "x" }), /inválido/);
  assert.equal(b.calls.length, 1);
});

test("exige token", () => assert.throws(() => new CloudApiClient({ token: "", phoneNumberId: "P" })));

test("janela de 24h", () => {
  const now = new Date("2026-10-07T12:00:00Z");
  assert.ok(inServiceWindow("2026-10-06T13:00:00Z", now));
  assert.ok(!inServiceWindow("2026-10-06T11:59:00Z", now));
  assert.ok(!inServiceWindow(null, now));
  assert.ok(!inServiceWindow("lixo", now));
});
