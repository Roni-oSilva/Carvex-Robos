import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { makeWorld, type TestWorld } from "../../../shared/testing/helpers.ts";
import { pixIsValid } from "../../../shared/payments/pix.ts";
import { pedidoRobot } from "../src/robot.ts";
import { defaultSettings, validateSettings, type PedidoSettings } from "../src/settings.ts";
import { cardapioTexto, resolverCarrinho } from "../src/flow.ts";
import { PedidoStore } from "../src/store.ts";

const exemplo = JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")) as unknown;
const mk = (mut?: (s: PedidoSettings) => void): PedidoSettings => {
  const v = validateSettings(structuredClone(exemplo));
  if (!v.ok) throw new Error(v.error);
  mut?.(v.value);
  return v.value;
};
// Hoje = quarta 2026-10-07, 20:00 em São Paulo (loja aberta 18h–23h30).
const NOITE = new Date("2026-10-07T23:00:00Z");
const world = (mut?: (s: PedidoSettings) => void) => makeWorld(pedidoRobot, { settings: mk(mut), now: NOITE });
const ANA = "5511987654321";
type W = TestWorld<PedidoSettings>;

const tap = (w: W, id: string, label = id, who = ANA) => w.say(who, label, { replyId: id });
const last = (w: W, who = ANA) => w.drain(who).join("\n");
const pedidos = (w: W) => w.env.db.all<Record<string, any>>("SELECT * FROM orders ORDER BY id");
const itensDe = (w: W, id: number) => w.env.db.all<Record<string, any>>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", id);

/** 2 pizzas calabresa grandes com "sem cebola" até o carrinho. */
async function ateCarrinho(w: W, who = ANA) {
  await w.say(who, "oi", { name: "Ana Paula" });
  await tap(w, "m_pedir", "Fazer pedido", who);
  await tap(w, "c_pizzas", "Pizzas", who);
  await tap(w, "i_calabresa", "Pizza Calabresa", who);
  await tap(w, "v_grande", "Grande", who);
  await tap(w, "q_2", "2", who);
  await w.say(who, "sem cebola, por favor");
}
async function ateConfirmar(w: W, who = ANA) {
  await ateCarrinho(w, who);
  await tap(w, "k_fim", "Finalizar pedido", who);
  await tap(w, "t_entrega", "Entrega", who);
  await tap(w, "b_0", "Centro", who);
  await w.say(who, "Rua das Palmeiras, 123, apto 4");
  await tap(w, "p_pix", "Pix", who);
}

test("configuração de exemplo e padrão são válidas", () => {
  assert.ok(validateSettings(exemplo).ok);
  assert.ok(validateSettings(defaultSettings()).ok);
});

test("configuração inválida gera mensagens claras", () => {
  const a = structuredClone(exemplo) as any; a.cardapio[1].itens[0].preco = "12";
  assert.match((validateSettings(a) as any).error, /preco: deve ser número/);
  const b = structuredClone(exemplo) as any; b.cardapio[1].itens[1].id = "coca2l";
  assert.match((validateSettings(b) as any).error, /único em todo o cardápio|repetidos/);
  const c = structuredClone(exemplo) as any; c.pagamento.pix.chave = "";
  assert.match((validateSettings(c) as any).error, /exige chave/);
  const d = structuredClone(exemplo) as any; d.entrega.bairros = [];
  assert.match((validateSettings(d) as any).error, /pelo menos 1 bairro/);
  const e = structuredClone(exemplo) as any; e.cardapio[0].itens[0].id = "Calabresa Grande";
  assert.match((validateSettings(e) as any).error, /sem espaços ou acentos/);
});

test("cardápio em texto mostra só o que está disponível, com preços", () => {
  const s = mk((x) => { x.cardapio[1].itens[1].disponivel = false; });
  const t = cardapioTexto(s).join("\n");
  assert.match(t, /Pizza Calabresa — a partir de R\$ 42,00/);
  assert.match(t, /Coca-Cola 2L — R\$ 12,00/);
  assert.ok(!t.includes("Guaraná"));
});

test("pedido completo de entrega com Pix: totais, itens, Pix válido e confirmação", async () => {
  const w = world();
  await ateConfirmar(w);
  const resumo = last(w);
  assert.match(resumo, /2x Pizza Calabresa \(Grande \(8 fatias\)\) — R\$ 104,00\n\s+_obs: sem cebola, por favor_/);
  assert.match(resumo, /Entrega \(Centro\): R\$ 5,00/);
  assert.match(resumo, /\*Total: R\$ 109,00\*/);
  assert.match(resumo, /Rua das Palmeiras, 123, apto 4 — Centro/);
  await tap(w, "f_sim", "Confirmar");
  const [o] = pedidos(w);
  assert.deepEqual([o.numero, o.tipo, o.status, o.subtotal_cents, o.taxa_cents, o.total_cents, o.pagamento, o.pago, o.eta_min], [1, "entrega", "novo", 10400, 500, 10900, "pix", 0, 40]);
  assert.equal(o.nome, "Ana Paula");
  assert.deepEqual(itensDe(w, o.id).map((i) => [i.nome, i.variacao, i.qty, i.unit_cents, i.obs]), [["Pizza Calabresa", "Grande (8 fatias)", 2, 5200, "sem cebola, por favor"]]);
  const msgs = w.wa.sent.map((s) => ("body" in s.msg ? s.msg.body : ""));
  assert.match(msgs.find((m) => m.includes("recebido"))!, /Pedido \*#1\* recebido/);
  const pix = msgs.find((m) => m.startsWith("000201"))!;
  assert.ok(pixIsValid(pix));
  assert.ok(pix.includes("5406109.00"));
  // carrinho foi limpo: confirmar de novo não cria outro pedido
  await tap(w, "f_sim", "Confirmar");
  assert.equal(pedidos(w).length, 1);
});

test("preço e disponibilidade vêm sempre do cardápio ATUAL, nunca do cliente", async () => {
  const w = world();
  await ateCarrinho(w);
  // dono muda o preço e esgota a Coca enquanto o cliente decide
  const s = mk((x) => { x.cardapio[0].itens[0].variacoes![1].preco = 60; });
  w.env.repo.updateTenantSettings(w.tenant.id, s);
  await tap(w, "k_fim", "Finalizar pedido");
  await tap(w, "t_retirada", "Retirada");
  await tap(w, "p_cartao_entrega", "Cartão");
  const r = last(w);
  assert.match(r, /R\$ 120,00/); // 2 × 60
  const r2 = resolverCarrinho(mk(), [{ itemId: "calabresa", varId: "inexistente", qty: 1 }, { itemId: "nao-existe", qty: 1 }, { itemId: "coca2l", qty: 999 }]);
  assert.deepEqual(r2.removidos.sort(), ["Pizza Calabresa", "nao-existe"].sort());
  assert.equal(r2.linhas[0].qty, 20); // quantidade máxima por linha
});

test("item que esgota antes de finalizar sai do carrinho com aviso", async () => {
  const w = world();
  await ateCarrinho(w);
  w.env.repo.updateTenantSettings(w.tenant.id, mk((x) => { x.cardapio[0].itens[0].disponivel = false; }));
  await tap(w, "k_fim", "Finalizar pedido");
  const r = last(w);
  assert.match(r, /ficaram indisponíveis[\s\S]*Pizza Calabresa/);
  assert.match(r, /Seu carrinho ficou vazio/);
});

test("loja fechada: mostra o horário, deixa ver o cardápio e não deixa pedir", async () => {
  const w = makeWorld(pedidoRobot, { settings: mk(), now: new Date("2026-10-05T15:00:00Z") }); // segunda 12h
  await w.say(ANA, "oi");
  await tap(w, "m_pedir", "Fazer pedido");
  assert.match(last(w), /No momento estamos fechados[\s\S]*Terça a domingo/);
  await tap(w, "m_cardapio", "Ver cardápio");
  assert.match(last(w), /PIZZAS[\s\S]*Calabresa/);
});

test("fecha no meio do pedido: não confirma e avisa", async () => {
  const w = world();
  await ateConfirmar(w);
  w.setNow(new Date("2026-10-08T03:00:00Z")); // 00:00 de quinta: fechado
  w.drain();
  await tap(w, "f_sim", "Confirmar");
  assert.match(last(w), /estamos fechados/);
  assert.equal(pedidos(w).length, 0);
});

test("pedido mínimo na entrega: bloqueia e oferece retirada", async () => {
  const w = world();
  await w.say(ANA, "oi");
  await tap(w, "m_pedir"); await tap(w, "c_bebidas", "Bebidas"); await tap(w, "i_guarana", "Guaraná"); await tap(w, "q_1", "1"); await tap(w, "o_nao", "Sem observação");
  await tap(w, "k_fim", "Finalizar"); w.drain();
  await tap(w, "t_entrega", "Entrega");
  const r = last(w);
  assert.match(r, /pedido mínimo para entrega é R\$ 30,00 \(seu subtotal: R\$ 6,00\)/);
  await tap(w, "t_retirada", "Retirada");
  assert.ok(!/bairro/i.test(last(w)));
});

test("bairro fora da área é recusado com a lista de bairros atendidos", async () => {
  const w = world();
  await ateCarrinho(w);
  await tap(w, "k_fim", "Finalizar pedido"); await tap(w, "t_entrega", "Entrega"); w.drain();
  await w.say(ANA, "Bairro Distante");
  assert.match(last(w), /Não encontrei esse bairro[\s\S]*Centro, Jardim América, Vila Nova[\s\S]*RETIRADA/);
});

test("dinheiro: troco menor que o total é recusado; nota válida é registrada", async () => {
  const w = world();
  await ateCarrinho(w);
  await tap(w, "k_fim"); await tap(w, "t_entrega"); await tap(w, "b_1", "Jardim América");
  await w.say(ANA, "Av. Brasil, 500 - casa"); await tap(w, "p_dinheiro", "Dinheiro"); w.drain();
  await w.say(ANA, "50");
  assert.match(last(w), /maior ou igual ao total \(R\$ 111,00\)/);
  await w.say(ANA, "troco para 200,00");
  assert.match(last(w), /Dinheiro \(troco para R\$ 200,00\)/);
  await tap(w, "f_sim");
  assert.equal(pedidos(w)[0].troco_para_cents, 20000);
  assert.equal(pedidos(w)[0].total_cents, 11100); // 104 + taxa 7
});

test("quantidade e observação são validadas/sanitizadas", async () => {
  const w = world();
  await w.say(ANA, "oi");
  await tap(w, "m_pedir"); await tap(w, "c_bebidas"); await tap(w, "i_coca2l", "Coca");
  for (const ruim of ["0", "21", "muitas", "-2"]) { await w.say(ANA, ruim); assert.match(last(w), /quantidade de 1 a 20/); }
  await w.say(ANA, "3");
  await w.say(ANA, "<script>alert(1)</script>\n  bem gelada");
  const conv = JSON.parse(w.env.db.get<{ data: string }>("SELECT data FROM conversations")!.data) as { cart: { itemId: string; qty: number; obs?: string }[] };
  const o = resolverCarrinho(mk(), conv.cart);
  assert.equal(o.linhas[0].qty, 3);
  assert.ok(!o.linhas[0].obs!.includes("<"));
  assert.match(o.linhas[0].obs!, /bem gelada/);
});

test("status pelo painel avisa o cliente; entrega em dinheiro marca como pago", async () => {
  const w = world();
  await ateCarrinho(w);
  await tap(w, "k_fim"); await tap(w, "t_retirada", "Retirada"); await tap(w, "p_dinheiro", "Dinheiro"); await tap(w, "tr_nao", "Sem troco"); await tap(w, "f_sim");
  w.drain();
  const app = w.app();
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  try {
    const cookie = (await fetch(`${base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "token=chave-admin-de-teste-123456" })).headers.get("set-cookie")!.split(";")[0];
    const post = (p: string, body: string, ck = cookie) => fetch(`${base}${p}`, { method: "POST", redirect: "manual", headers: { cookie: ck, "content-type": "application/x-www-form-urlencoded" }, body });
    const id = pedidos(w)[0].id;
    await post(`/admin/pedidos/${id}/acao`, "acao=aceito");
    assert.match(last(w), /Seu pedido #1 foi aceito ✅ Fica pronto em cerca de 30 min para retirada/);
    await post(`/admin/pedidos/${id}/acao`, "acao=preparando");
    assert.match(last(w), /está sendo preparado/);
    await post(`/admin/pedidos/${id}/acao`, "acao=pronto");
    assert.match(last(w), /pronto para retirada 🛍️ — Rua das Acácias, 88/);
    await post(`/admin/pedidos/${id}/acao`, "acao=entregue");
    assert.match(last(w), /concluído\. Bom apetite/);
    assert.equal(pedidos(w)[0].pago, 1);
    // pedido encerrado não muda mais
    await post(`/admin/pedidos/${id}/acao`, "acao=cancelado");
    assert.equal(pedidos(w)[0].status, "entregue");
    assert.equal(w.drain(ANA).length, 0);

    // painel: quadro, histórico e home
    assert.match(await (await fetch(`${base}/admin`, { headers: { cookie } })).text(), /pedidos hoje/);
    assert.match(await (await fetch(`${base}/admin/historico`, { headers: { cookie } })).text(), /#1/);
  } finally { await new Promise<void>((r) => app.server.close(() => r())); }
});

test("aviso de status fora da janela de 24h usa o modelo aprovado (ou não envia sem ele)", async () => {
  const w = world((x) => { x.template = { nome: "pedido_status", idioma: "pt_BR" }; });
  await ateConfirmar(w);
  await tap(w, "f_sim");
  w.drain();
  w.advance(30 * 3_600_000);
  const { avisarStatus } = await import("../src/notify.ts");
  const st = new PedidoStore(w.env.db);
  const id = pedidos(w)[0].id;
  st.setStatus(w.tenant.id, id, "saiu", w.env.clock());
  const comModelo = mk((x) => { x.template = { nome: "pedido_status", idioma: "pt_BR" }; });
  assert.equal(await avisarStatus(w.env, w.tenant, comModelo, st.get(w.tenant.id, id)!, w.env.clock()), "sent_template");
  const m = w.wa.sent.at(-1)!.msg;
  assert.equal(m.kind, "template");
  if (m.kind === "template") assert.deepEqual([m.name, m.params[0], m.params[1]], ["pedido_status", "Ana", "1"]);
  assert.equal(await avisarStatus(w.env, w.tenant, mk(), st.get(w.tenant.id, id)!, w.env.clock()), "skipped_no_template");
});

test("meu pedido e cancelamento: só cancela sozinho enquanto está 'novo'", async () => {
  const w = world();
  await ateConfirmar(w); await tap(w, "f_sim"); w.drain();
  await w.say(ANA, "meu pedido");
  assert.match(last(w), /Pedido #1[\s\S]*Recebemos o seu pedido[\s\S]*CANCELAR PEDIDO/);
  new PedidoStore(w.env.db).setStatus(w.tenant.id, pedidos(w)[0].id, "preparando", w.env.clock());
  await w.say(ANA, "cancelar pedido");
  assert.match(last(w), /já está em andamento/);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
  const w2 = world();
  await ateConfirmar(w2); await tap(w2, "f_sim"); w2.drain();
  await w2.say(ANA, "cancelar pedido");
  assert.match(last(w2), /Pedido #1 cancelado/);
  assert.equal(pedidos(w2)[0].status, "cancelado");
});

test("numeração é sequencial por empresa e independente entre empresas", async () => {
  const w = world();
  await ateConfirmar(w); await tap(w, "f_sim");
  await ateConfirmar(w, "5511911112222"); await tap(w, "f_sim", "Confirmar", "5511911112222");
  assert.deepEqual(pedidos(w).map((o) => o.numero), [1, 2]);
  const t2 = w.env.repo.createTenant({ slug: "b", nome: "B", phone_number_id: "B", settings: mk() }, w.env.clock());
  const c = w.env.repo.upsertContact(t2.id, ANA, "Ana", w.env.clock());
  const o = new PedidoStore(w.env.db).criar({ tenantId: t2.id, contactId: c.id, tipo: "retirada", nome: "Ana", endereco: null, bairro: null, taxaCents: 0, pagamento: "pix", trocoParaCents: null, etaMin: 20, itens: [{ itemId: "x", nome: "X", variacao: null, qty: 1, unitCents: 100, obs: null }] }, w.env.clock());
  assert.equal(o.numero, 1);
});

test("dúvidas: taxa de entrega vem do cadastro; fora da base vai para humano", async () => {
  const w = world();
  await w.say(ANA, "qual a taxa de entrega?");
  assert.match(last(w), /Centro: taxa R\$ 5,00, 40 min/);
  await w.say(ANA, "vocês fazem sushi?");
  assert.match(last(w), /Não tenho essa informação no momento/);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
});

test("painel: marcar esgotado tira do robô; XSS escapado; outra empresa não mexe nos pedidos", async () => {
  const w = world();
  await w.say(ANA, "oi", { name: "<img src=x onerror=alert(1)>" });
  await tap(w, "m_pedir"); await tap(w, "c_bebidas"); await tap(w, "i_coca2l"); await tap(w, "q_3"); await tap(w, "o_nao");
  await tap(w, "k_fim"); await tap(w, "t_retirada"); await tap(w, "p_cartao_entrega"); await tap(w, "f_sim");
  const app = w.app();
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  const login = async (t: string) => (await fetch(`${base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `token=${t}` })).headers.get("set-cookie")!.split(";")[0];
  try {
    const cookie = await login("chave-admin-de-teste-123456");
    const post = (p: string, body: string, ck = cookie) => fetch(`${base}${p}`, { method: "POST", redirect: "manual", headers: { cookie: ck, "content-type": "application/x-www-form-urlencoded" }, body });
    const quadro = await (await fetch(`${base}/admin/pedidos`, { headers: { cookie } })).text();
    assert.ok(!quadro.includes("<img src=x"));
    assert.ok(quadro.includes("&lt;img"));

    await post("/admin/cardapio/alternar", "item=coca2l");
    assert.ok(!cardapioTexto(JSON.parse(w.env.repo.tenantById(w.tenant.id)!.settings)).join("").includes("Coca-Cola"));
    await post("/admin/cardapio/alternar", "item=coca2l");
    assert.ok(cardapioTexto(JSON.parse(w.env.repo.tenantById(w.tenant.id)!.settings)).join("").includes("Coca-Cola"));

    w.env.repo.createTenant({ slug: "b", nome: "Loja B", phone_number_id: "B", admin_token: "outra-chave-admin-9999999", settings: mk() }, w.env.clock());
    const ckB = await login("outra-chave-admin-9999999");
    const id = pedidos(w)[0].id;
    assert.equal((await post(`/admin/pedidos/${id}/acao`, "acao=cancelado", ckB)).status, 404);
    assert.equal((await fetch(`${base}/admin/pedidos/${id}`, { headers: { cookie: ckB } })).status, 404);
    assert.equal(pedidos(w)[0].status, "novo");
  } finally { await new Promise<void>((r) => app.server.close(() => r())); }
});

test("saudação composta ('Oi, boa noite') mostra o menu em vez de chamar atendente", async () => {
  const w = world();
  await w.say(ANA, "Oi, boa noite!");
  assert.match(last(w), /Fazer pedido/);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "bot");
});
