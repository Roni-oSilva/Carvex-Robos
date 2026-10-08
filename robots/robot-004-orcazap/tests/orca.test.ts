import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { makeWorld, type TestWorld } from "../../../shared/testing/helpers.ts";
import { orcaRobot } from "../src/robot.ts";
import { defaultSettings, validateSettings, type OrcaSettings } from "../src/settings.ts";
import { OrcaStore } from "../src/store.ts";
import { rodarAcompanhamento } from "../src/followup.ts";

const exemplo = JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")) as unknown;
const mk = (mut?: (s: OrcaSettings) => void): OrcaSettings => {
  const v = validateSettings(structuredClone(exemplo));
  if (!v.ok) throw new Error(v.error);
  mut?.(v.value);
  return v.value;
};
const T0 = new Date("2026-10-07T15:00:00Z");
const world = (mut?: (s: OrcaSettings) => void) => makeWorld(orcaRobot, { settings: mk(mut), now: T0 });
const ANA = "5511987654321";
type W = TestWorld<OrcaSettings>;
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 1)]);
const tap = (w: W, id: string, label = id, who = ANA) => w.say(who, label, { replyId: id });
const quotes = (w: W) => w.env.db.all<Record<string, any>>("SELECT * FROM quotes ORDER BY id");
const fotoMsg = (w: W, id: string, data: Buffer = JPG, mime = "image/jpeg", who = ANA) => { w.wa.media.set(id, { data, mime }); return w.say(who, "", { type: "image", mediaId: id }); };

async function ateFotos(w: W, who = ANA) {
  await w.say(who, "oi", { name: "Ana Paula" });
  await tap(w, "m_novo", "Pedir orçamento", who);
  await tap(w, "s_pintura", "Pintura", who);
  await w.say(who, "Pintar sala e dois quartos, paredes com mofo no canto");
}
async function ateConfirmar(w: W, fotos = 2, who = ANA) {
  await ateFotos(w, who);
  for (let i = 0; i < fotos; i++) await fotoMsg(w, `m${i}`, JPG, "image/jpeg", who);
  await tap(w, fotos ? "f_fim" : "f_pular", "Já enviei", who);
  await tap(w, "b_0", "Centro", who);
  await w.say(who, "Rua das Acácias, 45, ap 12");
  await tap(w, "p_manha", "Manhã", who);
}

test("configuração de exemplo e padrão são válidas; erros são claros", () => {
  assert.ok(validateSettings(exemplo).ok);
  assert.ok(validateSettings(defaultSettings()).ok);
  const a = structuredClone(exemplo) as any; a.servicos = [];
  assert.match((validateSettings(a) as any).error, /pelo menos 1 serviço/);
  const b = structuredClone(exemplo) as any; b.servicos[1].id = "pintura";
  assert.match((validateSettings(b) as any).error, /repetidos/);
  const c = structuredClone(exemplo) as any; c.atendimento.max_fotos = 20;
  assert.match((validateSettings(c) as any).error, /max_fotos/);
});

test("pedido completo com fotos cria orçamento, guarda as fotos e vincula ao número", async () => {
  const w = world();
  await ateConfirmar(w, 2);
  const resumo = w.drain(ANA).join("\n");
  assert.match(resumo, /Serviço: Pintura/);
  assert.match(resumo, /Fotos: 2/);
  assert.match(resumo, /costuma precisar de visita/);
  await tap(w, "c_sim", "Enviar pedido");
  const q = quotes(w);
  assert.equal(q.length, 1);
  assert.equal(q[0].status, "novo");
  assert.equal(q[0].numero, 1);
  assert.equal(q[0].valor_cents, null);
  const fotos = new OrcaStore(w.env.db).fotos(q[0].id);
  assert.equal(fotos.length, 2);
  for (const f of fotos) assert.ok(existsSync(join(w.env.config.mediaDir, f.arquivo)));
  assert.match(w.drain(ANA).join("\n"), /Pedido de orçamento \*#1\* recebido/);
});

test("o robô nunca informa preço: pergunta de valor leva ao pedido de orçamento", async () => {
  const w = world();
  await w.say(ANA, "Quanto custa o orçamento?");
  const t = w.drain(ANA).join("\n");
  assert.match(t, /valor depende do serviço/);
  assert.ok(!/R\$ \d/.test(t));
  await w.say("5511900000001", "Quanto custa pintar um apartamento de 80 m2?");
  const t2 = w.drain("5511900000001").join("\n");
  assert.ok(!/R\$ \d/.test(t2));
});

test("arquivo que não é imagem é recusado e não é salvo", async () => {
  const w = world();
  await ateFotos(w);
  await fotoMsg(w, "x1", Buffer.from("MZ executavel falso".padEnd(40, "x")), "image/jpeg");
  assert.match(w.drain(ANA).join("\n"), /Não consegui usar esse arquivo/);
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM quote_photos")!.n, 0);
});

test("limite de fotos: ao chegar no máximo segue para o bairro; excedente não é aceito", async () => {
  const w = world((s) => { s.atendimento.max_fotos = 2; });
  await ateFotos(w);
  await fotoMsg(w, "a"); await fotoMsg(w, "b");
  assert.match(w.drain(ANA).join("\n"), /limite de fotos[\s\S]*bairro/);
  await fotoMsg(w, "c");
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM quote_photos")!.n, 2);
});

test("falha ao baixar a foto não derruba a conversa", async () => {
  const w = world();
  await ateFotos(w);
  await w.say(ANA, "", { type: "image", mediaId: "inexistente" });
  assert.match(w.drain(ANA).join("\n"), /Não consegui baixar essa foto/);
  await tap(w, "f_pular", "Sem fotos");
  assert.match(w.drain(ANA).join("\n"), /bairro/i);
});

test("bairro fora da área é recusado com a lista dos atendidos", async () => {
  const w = world();
  await ateFotos(w);
  await tap(w, "f_pular");
  await w.say(ANA, "Bairro Distante");
  assert.match(w.drain(ANA).join("\n"), /Ainda não atendemos esse bairro[\s\S]*Centro/);
});

test("cancelar na confirmação apaga as fotos recebidas", async () => {
  const w = world();
  await ateConfirmar(w, 1);
  const f = w.env.db.get<{ arquivo: string }>("SELECT arquivo FROM quote_photos")!.arquivo;
  await tap(w, "c_nao", "Cancelar");
  assert.equal(quotes(w).length, 0);
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM quote_photos")!.n, 0);
  assert.ok(!existsSync(join(w.env.config.mediaDir, f)));
});

test("proposta enviada pelo painel chega ao cliente com botões; aceitar muda a situação", async () => {
  const w = world();
  await ateConfirmar(w, 1);
  await tap(w, "c_sim", "Enviar pedido");
  w.drain(ANA);
  const st = new OrcaStore(w.env.db);
  const q = st.get(w.tenant.id, 1)!;
  const { enviarPropostaAoCliente } = await import("../src/notify.ts");
  const r = await enviarPropostaAoCliente(w.env, w.tenant, mk(), { ...q, valor_cents: 125000, prazo_texto: "3 dias úteis", obs_proposta: null, validade_ate: new Date(T0.getTime() + 7 * 86_400_000).toISOString() }, w.env.clock());
  assert.equal(r, "sent");
  st.enviarProposta(w.tenant.id, q.id, { valorCents: 125000, prazoTexto: "3 dias úteis", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  const msg = w.drain(ANA).join("\n");
  assert.match(msg, /Valor: \*R\$ 1\.250,00\*/);
  assert.match(msg, /válida até 14\/10\/2026/);
  assert.match(msg, /Aceitar/);
  await tap(w, "oz_ok_1", "Aceitar");
  assert.equal(quotes(w)[0].status, "aceito");
  assert.match(w.drain(ANA).join("\n"), /Orçamento #1 aceito \(R\$ 1\.250,00\)/);
});

test("cliente não consegue responder a proposta de outro cliente", async () => {
  const w = world();
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  const st = new OrcaStore(w.env.db);
  st.enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  const OUTRO = "5511911112222";
  await w.say(OUTRO, "oi");
  await tap(w, "oz_ok_1", "Aceitar", OUTRO);
  assert.match(w.drain(OUTRO).join("\n"), /Não encontrei esse orçamento/);
  assert.equal(quotes(w)[0].status, "enviado");
});

test("recusa pergunta o motivo e registra", async () => {
  const w = world();
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  new OrcaStore(w.env.db).enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  await tap(w, "oz_no_1", "Recusar");
  await w.say(ANA, "Achei o prazo muito longo");
  const q = quotes(w)[0];
  assert.equal(q.status, "recusado");
  assert.equal(q.recusa_motivo, "Achei o prazo muito longo");
});

test("proposta vencida não pode mais ser aceita", async () => {
  const w = world();
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  new OrcaStore(w.env.db).enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  w.advance(8 * 86_400_000);
  await tap(w, "oz_ok_1", "Aceitar");
  assert.equal(quotes(w)[0].status, "expirado");
  assert.match(w.drain(ANA).join("\n"), /venceu/);
});

test("acompanhamento: 1 lembrete após o prazo, sem repetir; depois da validade expira e avisa uma vez", async () => {
  const w = world();
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  new OrcaStore(w.env.db).enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  w.drain(ANA);
  w.advance(10 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 0);
  w.advance(15 * 3_600_000); // 25 h: janela de 24 h do cliente já fechou e há modelo cadastrado
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 1);
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 0);
  assert.match(w.drain(ANA).join("\n"), /orcamento_proposta/);
  w.advance(7 * 86_400_000);
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 1);
  assert.equal(quotes(w)[0].status, "expirado");
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 0);
});

test("sem modelo aprovado e janela fechada, nada é enviado (mas o orçamento ainda expira)", async () => {
  const w = world((s) => { s.template.nome = ""; });
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  new OrcaStore(w.env.db).enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 24 }, w.env.clock());
  w.drain(ANA);
  w.advance(30 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 0);
  assert.equal(w.drain(ANA).length, 0);
});

test("cliente em atendimento humano não recebe lembrete automático", async () => {
  const w = world();
  await ateConfirmar(w, 0);
  await tap(w, "c_sim", "Enviar pedido");
  new OrcaStore(w.env.db).enviarProposta(w.tenant.id, 1, { valorCents: 50000, prazoTexto: "", obs: null, validadeDias: 7, followupHoras: 2 }, w.env.clock());
  await w.say(ANA, "quero falar com um atendente");
  w.drain(ANA);
  w.advance(3 * 3_600_000); // lembrete venceu, mas a conversa humana ainda está ativa (< 12 h)
  assert.equal(await rodarAcompanhamento(w.env, orcaRobot, w.env.clock()), 0);
});

test("exclusão LGPD: bloqueia com orçamento em andamento e apaga os arquivos de foto quando liberado", async () => {
  const w = world();
  await ateConfirmar(w, 1);
  await tap(w, "c_sim", "Enviar pedido");
  const contact = w.env.repo.contactByWaId(w.tenant.id, ANA)!;
  assert.match(orcaRobot.beforeDeleteContact!(w.env, w.tenant.id, contact.id) ?? "", /em andamento/);
  const f = w.env.db.get<{ arquivo: string }>("SELECT arquivo FROM quote_photos")!.arquivo;
  new OrcaStore(w.env.db).setStatus(w.tenant.id, 1, "cancelado", w.env.clock());
  assert.equal(orcaRobot.beforeDeleteContact!(w.env, w.tenant.id, contact.id), null);
  orcaRobot.onDeleteContact!(w.env, w.tenant.id, contact.id);
  assert.ok(!existsSync(join(w.env.config.mediaDir, f)));
});

test("limpeza: fotos órfãs (2 dias) e orçamentos encerrados antigos são apagados com os arquivos", async () => {
  const w = world();
  await ateFotos(w);
  await fotoMsg(w, "o1");
  const orfa = w.env.db.get<{ arquivo: string }>("SELECT arquivo FROM quote_photos")!.arquivo;
  w.advance(3 * 86_400_000);
  assert.equal(orcaRobot.limpar!(w.env, w.env.clock(), 180), 1);
  assert.ok(!existsSync(join(w.env.config.mediaDir, orfa)));
  const w2 = world();
  await ateConfirmar(w2, 1);
  await tap(w2, "c_sim", "Enviar pedido");
  const f = w2.env.db.get<{ arquivo: string }>("SELECT arquivo FROM quote_photos")!.arquivo;
  new OrcaStore(w2.env.db).setStatus(w2.tenant.id, 1, "recusado", w2.env.clock());
  w2.advance(200 * 86_400_000);
  assert.equal(orcaRobot.limpar!(w2.env, w2.env.clock(), 180), 2);
  assert.ok(!existsSync(join(w2.env.config.mediaDir, f)));
  assert.equal(quotes(w2).length, 0);
});

test("painel: foto só abre para a empresa dona; página do orçamento escapa HTML", async () => {
  const w = world();
  await ateConfirmar(w, 1);
  await tap(w, "c_sim", "Enviar pedido");
  const st = new OrcaStore(w.env.db);
  const q = st.get(w.tenant.id, 1)!;
  w.env.db.run("UPDATE quotes SET descricao = ? WHERE id = ?", "<script>alert(1)</script>", q.id);
  const { adminRoutes } = await import("../src/admin.ts");
  const rota = adminRoutes.find((r) => r.path === "/orcamentos/:id" && r.method === "GET")!;
  const page = (title: string, body: { toString(): string }) => ({ status: 200, body: `${title}${body.toString()}` });
  const ctx = { env: w.env, tenant: w.tenant, settings: mk(), now: w.env.clock(), page } as any;
  const out = rota.handler(ctx, { query: new URLSearchParams(), form: {}, params: { id: "1" } }) as { body: string };
  assert.ok(!out.body.includes("<script>alert(1)</script>"));
  assert.match(out.body, /&lt;script&gt;/);
  const foto = adminRoutes.find((r) => r.path === "/orcamentos/foto/:arquivo")!;
  const arq = st.fotos(1)[0].arquivo;
  const ok = foto.handler(ctx, { query: new URLSearchParams(), form: {}, params: { arquivo: arq } }) as { status: number; type?: string };
  assert.equal(ok.status, 200);
  assert.equal(ok.type, "image/jpeg");
  const outro = foto.handler({ ...ctx, tenant: { ...w.tenant, id: 999 } }, { query: new URLSearchParams(), form: {}, params: { arquivo: arq } }) as { status: number };
  assert.equal(outro.status, 404);
  const trav = foto.handler(ctx, { query: new URLSearchParams(), form: {}, params: { arquivo: "../../etc/passwd" } }) as { status: number };
  assert.equal(trav.status, 404);
});
