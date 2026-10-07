import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { makeWorld, type TestWorld } from "../../../shared/testing/helpers.ts";
import { pixIsValid } from "../../../shared/payments/pix.ts";
import { cobraRobot } from "../src/robot.ts";
import { defaultSettings, termoProibido, validateSettings, type CobraSettings } from "../src/settings.ts";
import { rodarRegua, dentroDaJanela } from "../src/regua.ts";
import { CobraStore } from "../src/store.ts";
import { parseImport } from "../src/importar.ts";
import { aplicarAcordo } from "../src/admin.ts";

const exemplo = JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")) as unknown;
const mk = (over: Partial<CobraSettings> = {}): CobraSettings => {
  const v = validateSettings(structuredClone(exemplo));
  if (!v.ok) throw new Error(v.error);
  return { ...v.value, ...over };
};
// Hoje = quarta 2026-10-07 12:00 em São Paulo (dentro da janela 08–20).
const world = (over: Partial<CobraSettings> = {}) => makeWorld(cobraRobot, { settings: mk(over) });
const comTemplate = (): Partial<CobraSettings> => ({ template: { nome: "cobranca_aviso", idioma: "pt_BR" } });
const MARIA = "5511987654321";

function cobranca(w: TestWorld<CobraSettings>, o: { wa?: string; nome?: string; desc?: string; cents?: number; venc: string; ref?: string | null; inbound?: boolean }) {
  const c = w.env.repo.upsertContact(w.tenant.id, o.wa ?? MARIA, o.nome ?? "Maria Souza", w.env.clock(), "relacao_contratual");
  if (o.inbound) w.env.repo.touchInbound(c.id, w.env.clock());
  const id = new CobraStore(w.env.db).create({ tenantId: w.tenant.id, contactId: c.id, reference: o.ref ?? null, description: o.desc ?? "Mensalidade outubro", amountCents: o.cents ?? 15000, dueDate: o.venc }, w.env.clock())!;
  return { contact: c, id };
}
const run = (w: TestWorld<CobraSettings>) => rodarRegua(w.env, cobraRobot, w.env.clock());
const charge = (w: TestWorld<CobraSettings>, id: number) => new CobraStore(w.env.db).charge(w.tenant.id, id)!;
const sentKinds = (w: TestWorld<CobraSettings>) => w.wa.sent.map((s) => s.msg.kind);

test("configuração de exemplo e padrão são válidas", () => {
  assert.ok(validateSettings(exemplo).ok);
  assert.ok(validateSettings(defaultSettings()).ok);
});

test("travas legais: ameaças, órgãos de restrição e Justiça são recusados na configuração", () => {
  for (const msg of ["Vamos negativar seu nome no SPC", "Seu nome vai para o Serasa", "Vamos protestar o título", "Entraremos com um processo", "Chamaremos nosso advogado", "Você é caloteiro"]) {
    const ruim = structuredClone(exemplo) as any;
    ruim.regua[1].mensagem = msg;
    const v = validateSettings(ruim);
    assert.ok(!v.ok, msg);
    if (!v.ok) assert.match(v.error, /CDC art\. 42/);
  }
  const faq = structuredClone(exemplo) as any;
  faq.faq[0].resposta = "Se não pagar vamos para a justiça";
  assert.ok(!validateSettings(faq).ok);
  assert.equal(termoProibido("Passando para lembrar do seu pagamento"), null);
  assert.equal(termoProibido("sem processamento"), null); // não confunde "processo" com "processamento"
});

test("janela de envio fora de 07h–21h e pix incompleto são recusados", () => {
  const a = structuredClone(exemplo) as any; a.envio.fim = "23:00";
  assert.match((validateSettings(a) as any).error, /07:00 e 21:00/);
  const b = structuredClone(exemplo) as any; delete b.pix.beneficiario;
  assert.match((validateSettings(b) as any).error, /beneficiario/);
});

test("janela: não envia domingo nem à noite", () => {
  const s = mk();
  assert.ok(dentroDaJanela(s, new Date("2026-10-07T15:00:00Z"), "America/Sao_Paulo")); // qua 12h
  assert.ok(!dentroDaJanela(s, new Date("2026-10-11T15:00:00Z"), "America/Sao_Paulo")); // domingo
  assert.ok(!dentroDaJanela(s, new Date("2026-10-08T00:30:00Z"), "America/Sao_Paulo")); // 21h30
  assert.ok(!dentroDaJanela(s, new Date("2026-10-07T10:00:00Z"), "America/Sao_Paulo")); // 07h
});

test("primeiro contato NÃO revela dívida: só pergunta se é a pessoa certa (modelo aprovado fora da janela)", async () => {
  const w = world(comTemplate());
  cobranca(w, { venc: "2026-10-10" }); // vence em 3 dias => passo "antes-3"
  assert.equal(await run(w), 1);
  const m = w.wa.sent[0].msg;
  assert.equal(m.kind, "template");
  const texto = JSON.stringify(m);
  assert.ok(!/R\$|150|Mensalidade/.test(texto), "não pode vazar valor nem descrição");
  assert.equal(await run(w), 0); // não insiste
});

test("titular confirma -> recebe o resumo; passos já mostrados não são reenviados", async () => {
  const w = world(comTemplate());
  const { id } = cobranca(w, { venc: "2026-10-10" });
  await run(w);
  w.drain();
  await w.say(MARIA, "Sim, sou eu", { replyId: "id_sim" });
  const r = w.drain().join("\n");
  assert.match(r, /Mensalidade outubro — R\$ 150,00 — venc\. 10\/10 \(vence em 3 dias\)/);
  assert.equal(charge(w, id).status, "aberta");
  w.advance(49 * 3_600_000); // sexta 13:00Z... 10/10 ainda não venceu: nada novo
  w.setNow(new Date("2026-10-09T15:00:00Z"));
  assert.equal(await run(w), 0);
  w.setNow(new Date("2026-10-10T15:00:00Z")); // dia do vencimento => passo "vence-hoje"
  assert.equal(await run(w), 1);
  assert.match(w.drain().join("\n"), /vence \*hoje\*/);
});

test("'número errado': para tudo, marca opt-out e registra", async () => {
  const w = world(comTemplate());
  cobranca(w, { venc: "2026-10-10" });
  await run(w);
  await w.say(MARIA, "Número errado", { replyId: "id_nao" });
  assert.match(w.drain().at(-1)!, /Desculpe o engano/);
  assert.equal(w.env.repo.contactByWaId(w.tenant.id, MARIA)!.opt_out, 1);
  w.setNow(new Date("2026-10-20T15:00:00Z"));
  const antes = w.wa.sent.length;
  assert.equal(await run(w), 0);
  assert.equal(w.wa.sent.length, antes);
  assert.equal(w.env.repo.countEvents(w.tenant.id, "numero_errado", "2026-01-01"), 1);
});

test("quem escreve primeiro também precisa confirmar a identidade antes de ver valores", async () => {
  const w = world();
  cobranca(w, { venc: "2026-09-20" });
  await w.say(MARIA, "quanto devo?");
  const r1 = w.drain().join("\n");
  assert.ok(!/R\$/.test(r1));
  assert.match(r1, /você é Maria\?/);
  await w.say(MARIA, "sim", { replyId: "id_sim" });
  assert.match(w.drain().join("\n"), /R\$ 150,00/);
});

test("pendências antigas viram UMA mensagem do passo mais recente (sem rajada)", async () => {
  const w = world();
  const { id, contact } = cobranca(w, { venc: "2026-09-01", inbound: true }); // 36 dias de atraso
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  assert.equal(await run(w), 1);
  assert.equal(w.wa.sent.length, 1);
  assert.match(w.drain().join("\n"), /em aberto há 36 dias/);
  const passos = w.env.db.all<{ step_id: string; result: string }>("SELECT step_id, result FROM cz_envios WHERE charge_id = ? ORDER BY id", id);
  assert.deepEqual(passos.filter((p) => p.result === "pulado").map((p) => p.step_id).sort(), ["antes-3", "atraso-3", "atraso-7", "vence-hoje"]);
  assert.equal(await run(w), 0); // próximo tick: nada
});

test("limites: intervalo mínimo entre mensagens e máximo por semana", async () => {
  const w = world({ ...comTemplate(), regua: [{ id: "p1", dias: 1 }, { id: "p2", dias: 2 }, { id: "p3", dias: 3 }, { id: "p4", dias: 4 }, { id: "p5", dias: 5 }] });
  const { contact } = cobranca(w, { venc: "2026-10-06", inbound: true });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  assert.equal(await run(w), 1); // p1 (hoje é +1 dia)
  w.setNow(new Date("2026-10-08T15:00:00Z")); // +24h: ainda dentro do intervalo de 48h
  assert.equal(await run(w), 0);
  w.setNow(new Date("2026-10-09T15:00:00Z")); // +48h
  assert.equal(await run(w), 1); // p2/p3 consolidados
  w.setNow(new Date("2026-10-11T15:00:00Z")); // domingo: fora da janela
  assert.equal(await run(w), 0);
  w.setNow(new Date("2026-10-12T15:00:00Z"));
  assert.equal(await run(w), 1); // 3ª da semana
  w.setNow(new Date("2026-10-14T15:00:00Z"));
  // 7 dias ainda não se passaram desde a 1ª (07/10): teto de 3 por semana
  assert.equal(await run(w), 0);
});

test("duas cobranças do mesmo cliente saem em UMA mensagem", async () => {
  const w = world();
  const a = cobranca(w, { venc: "2026-10-04", desc: "Mensalidade setembro", ref: "A", inbound: true });
  cobranca(w, { venc: "2026-10-05", desc: "Taxa de matrícula", cents: 5000, ref: "B" });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, a.contact.id, w.env.clock());
  assert.equal(await run(w), 1);
  assert.equal(w.wa.sent.length, 1);
  const t = w.drain().join("\n");
  assert.match(t, /Mensalidade setembro — R\$ 150,00/);
  assert.match(t, /Taxa de matrícula — R\$ 50,00/);
});

test("fora da janela de 24h sem modelo aprovado: não envia e não fica insistindo a cada minuto", async () => {
  const w = world(); // sem template
  const { contact } = cobranca(w, { venc: "2026-10-10" });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  assert.equal(await run(w), 0);
  assert.equal(await run(w), 0);
  assert.equal(w.wa.sent.length, 0);
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM cz_envios WHERE result = 'adiado'")!.n, 1); // 1 tentativa em 30 min
});

test("PARAR bloqueia a régua", async () => {
  const w = world(comTemplate());
  const { contact } = cobranca(w, { venc: "2026-10-10", inbound: true });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  await w.say(MARIA, "PARAR");
  w.drain();
  assert.equal(await run(w), 0);
  assert.equal(w.wa.sent.length, 1); // só a confirmação do PARAR
});

test("Pix: gera código válido com o valor da cobrança; várias cobranças pedem escolha", async () => {
  const w = world();
  const a = cobranca(w, { venc: "2026-10-01", desc: "Mensalidade", ref: "A" });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, a.contact.id, w.env.clock());
  await w.say(MARIA, "pix");
  const msgs = w.wa.sent.map((s) => ("body" in s.msg ? s.msg.body : ""));
  const code = msgs.find((m) => m.startsWith("000201"))!;
  assert.ok(pixIsValid(code));
  assert.ok(code.includes("5406150.00"));
  assert.ok(code.includes("financeiro@corpoemmovimento.com.br"));

  cobranca(w, { venc: "2026-10-02", desc: "Taxa", cents: 8000, ref: "B" });
  w.drain();
  await w.say(MARIA, "quero pagar");
  assert.match(w.drain().join("\n"), /Qual pagamento você quer pagar agora\?[\s\S]*Mensalidade[\s\S]*Taxa/);
  const taxa = w.env.db.get<{ id: number }>("SELECT id FROM charges WHERE reference = 'B'")!.id;
  await w.say(MARIA, "Taxa", { replyId: `ch_${taxa}` });
  const outros = w.wa.sent.map((s) => ("body" in s.msg ? s.msg.body : "")).filter((m) => m.startsWith("000201"));
  assert.ok(outros.at(-1)!.includes("540580.00"));
});

test("'paguei' pausa a cobrança, aceita comprovante e o painel confirma", async () => {
  const w = world();
  const { id, contact } = cobranca(w, { venc: "2026-10-01" });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  await w.say(MARIA, "já paguei");
  assert.match(w.drain().join("\n"), /Vamos conferir o pagamento/);
  assert.equal(charge(w, id).status, "em_conferencia");
  await w.say(MARIA, "comprovante", { type: "image" });
  assert.match(w.drain().at(-1)!, /Comprovante recebido/);
  assert.equal(w.env.repo.countEvents(w.tenant.id, "comprovante", "2026-01-01"), 1);
  assert.equal(await run(w), 0); // em conferência: a régua não cobra
});

test("negociação: oferece opções respeitando parcela mínima e desconto; proposta pausa a régua", async () => {
  const w = world();
  const { id, contact } = cobranca(w, { venc: "2026-09-20", cents: 15000 });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  await w.say(MARIA, "quero negociar");
  const lista = w.drain().join("\n");
  assert.match(lista, /À vista/);
  assert.match(lista, /2x de R\$ 75,00/);
  assert.match(lista, /3x de R\$ 50,00/);
  await w.say(MARIA, "3x", { replyId: "n_3" });
  assert.match(w.drain().join("\n"), /3x de R\$ 50,00 \(total R\$ 150,00\)/);
  const a = w.env.db.get<{ id: number; status: string; parcelas: number }>("SELECT * FROM cz_acordos")!;
  assert.deepEqual([a.status, a.parcelas], ["proposto", 3]);
  assert.ok(charge(w, id).paused_until);
  assert.equal(await run(w), 0); // proposta em análise: sem novos lembretes
});

test("parcela mínima: R$ 90 não oferece parcelamento em 2x (45 < 50)", async () => {
  const w = world({ negociacao: { ativo: true, max_parcelas: 3, parcela_minima: 50, desconto_a_vista_percentual: 0, validade_dias: 7 } });
  const { contact } = cobranca(w, { venc: "2026-09-20", cents: 9000 });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  await w.say(MARIA, "negociar");
  const t = w.drain().join("\n");
  assert.ok(!/2x|3x/.test(t)); // nenhuma parcela válida
  assert.match(t, /Vou chamar uma pessoa da equipe/); // sem opção automática, quem decide é uma pessoa
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
});

test("aceitar acordo cria as parcelas mensais (soma exata, último dia do mês respeitado) e encerra a original", async () => {
  const w = world();
  const { id, contact } = cobranca(w, { venc: "2026-09-20", cents: 10001, ref: "X1" });
  const st = new CobraStore(w.env.db);
  st.confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  const acordoId = st.propose(w.tenant.id, id, 3, 3334, 10002, w.env.clock());
  const a = st.decide(w.tenant.id, acordoId, "aceito", w.env.clock())!;
  const ids = aplicarAcordo(w.env, w.tenant, a, "2026-11-30", w.env.clock());
  assert.equal(ids.length, 3);
  const parcelas = ids.map((i) => st.charge(w.tenant.id, i)!);
  assert.deepEqual(parcelas.map((p) => p.due_date), ["2026-11-30", "2026-12-30", "2027-01-30"]);
  assert.equal(parcelas.reduce((s, p) => s + p.amount_cents, 0), 10002);
  assert.deepEqual(parcelas.map((p) => p.reference), ["X1-p1", "X1-p2", "X1-p3"]);
  assert.equal(charge(w, id).status, "acordo");
  // fim de mês: 31/01 -> fevereiro cai no dia 28
  const a2 = { ...a, parcelas: 2, parcela_cents: 100, total_cents: 200 };
  const outra = cobranca(w, { wa: "5511911112222", venc: "2026-09-01", ref: "Z" }).id;
  const ids2 = aplicarAcordo(w.env, w.tenant, { ...a2, charge_id: outra }, "2027-01-31", w.env.clock());
  assert.deepEqual(ids2.map((i) => st.charge(w.tenant.id, i)!.due_date), ["2027-01-31", "2027-02-28"]);
});

test("pergunta fora da base não é inventada e vai para humano; quem não tem cobrança recebe aviso neutro", async () => {
  const w = world();
  const { contact } = cobranca(w, { venc: "2026-10-01" });
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, contact.id, w.env.clock());
  await w.say(MARIA, "vocês têm piscina?");
  assert.match(w.drain().join("\n"), /Não tenho essa informação no momento/);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
  await w.say("5511900001111", "oi");
  assert.match(w.drain("5511900001111").join("\n"), /Não encontrei pendências para este número/);
  assert.equal(w.env.repo.conversationFor(w.tenant.id, w.env.repo.contactByWaId(w.tenant.id, "5511900001111")!.id, w.env.clock()).mode, "bot");
});

test("importação: aceita planilha, relata linhas ruins e não duplica referência", () => {
  const texto = [
    "nome;telefone;descricao;valor;vencimento;referencia",
    "Maria Souza; (11) 98765-4321; Mensalidade outubro; R$ 1.234,56; 05/10/2026; M-1",
    "João;11 3456-7890;Taxa;50;2026-10-20;",
    "Sem Fone;123;Taxa;50;05/10/2026",
    "Valor Ruim;11987654321;Taxa;abc;05/10/2026",
    "Data Ruim;11987654321;Taxa;50;31/02/2026",
    "Poucas colunas;11987654321",
  ].join("\n");
  const { ok, erros } = parseImport(texto);
  assert.deepEqual(ok.map((l) => [l.nome, l.telefone, l.valorCents, l.vencimento, l.referencia]), [
    ["Maria Souza", "5511987654321", 123456, "2026-10-05", "M-1"],
    ["João", "551134567890", 5000, "2026-10-20", null],
  ]);
  assert.equal(erros.length, 4);
  assert.match(erros.join("\n"), /Linha 4: telefone inválido/);
  assert.match(erros.join("\n"), /Linha 6: vencimento inválido/);
  assert.ok(parseImport(Array(600).fill("a;b").join("\n")).erros[0].includes("Máximo"));
});

test("painel: importar, filtrar, dar baixa por referência, XSS e isolamento entre empresas", async () => {
  const w = world();
  const app = w.app();
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  const login = async (token: string) => (await fetch(`${base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `token=${token}` })).headers.get("set-cookie")!.split(";")[0];
  try {
    const cookie = await login("chave-admin-de-teste-123456");
    const post = (p: string, body: string, ck = cookie) => fetch(`${base}${p}`, { method: "POST", redirect: "manual", headers: { cookie: ck, "content-type": "application/x-www-form-urlencoded" }, body });
    const get = async (p: string, ck = cookie) => (await fetch(`${base}${p}`, { headers: { cookie: ck } })).text();

    // sem confirmar a relação contratual não importa
    const sem = await post("/admin/cobrancas/importar", new URLSearchParams({ linhas: "A;11987654321;X;10;05/10/2026" }).toString());
    assert.match(new URL(sem.headers.get("location")!, base).searchParams.get("erros")!, /confirmar a relação contratual/);

    const linhas = "Ana <b>Negrito</b>;11987654321;<script>alert(1)</script>;100,00;01/10/2026;R1\nBeto;11911112222;Plano;80;20/10/2026;R2";
    const r = await post("/admin/cobrancas/importar", new URLSearchParams({ linhas, base: "1" }).toString());
    assert.match(new URL(r.headers.get("location")!, base).searchParams.get("msg")!, /2 cobrança\(s\) importada\(s\)/);
    assert.equal(w.env.repo.contactByWaId(w.tenant.id, "5511987654321")!.consent_basis, "relacao_contratual");

    const lista = await get("/admin/cobrancas");
    assert.ok(!lista.includes("<script>alert"));
    assert.ok(lista.includes("&lt;script&gt;"));
    assert.match(await get("/admin/cobrancas?filtro=vencidas"), /R1/);
    assert.ok(!(await get("/admin/cobrancas?filtro=vencidas")).includes("R2"));

    await post("/admin/cobrancas/baixa", new URLSearchParams({ refs: "R1\nINEXISTENTE" }).toString());
    assert.equal(w.env.db.get<{ status: string }>("SELECT status FROM charges WHERE reference = 'R1'")!.status, "paga");
    assert.match(await get("/admin"), /recebido nos últimos 30 dias/);

    // outra empresa não enxerga nada da primeira
    const t2 = w.env.repo.createTenant({ slug: "b", nome: "Empresa B", phone_number_id: "B", admin_token: "outra-chave-admin-9999999", settings: mk() }, w.env.clock());
    void t2;
    const ckB = await login("outra-chave-admin-9999999");
    const listaB = await get("/admin/cobrancas?filtro=todas", ckB);
    assert.ok(!listaB.includes("R2") && !listaB.includes("Plano"));
    // e não consegue agir sobre cobrança da empresa A
    const idA = w.env.db.get<{ id: number }>("SELECT id FROM charges WHERE reference = 'R2'")!.id;
    assert.equal((await post(`/admin/cobrancas/${idA}/acao`, "acao=cancelada", ckB)).status, 404);
    assert.equal(w.env.db.get<{ status: string }>("SELECT status FROM charges WHERE reference = 'R2'")!.status, "aberta");

    // LGPD: não exclui cliente com cobrança em aberto
    const beto = w.env.repo.contactByWaId(w.tenant.id, "5511911112222")!;
    await post(`/admin/clientes/${beto.id}/excluir`, "confirmo=1");
    assert.ok(w.env.repo.contact(w.tenant.id, beto.id));
  } finally { await new Promise<void>((r) => app.server.close(() => r())); }
});
