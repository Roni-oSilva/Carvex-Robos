import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeWorld, type TestWorld } from "../../../shared/testing/helpers.ts";
import { agendaRobot } from "../src/robot.ts";
import { defaultSettings, validateSettings, type AgendaSettings } from "../src/settings.ts";
import { freeSlots } from "../src/slots.ts";
import { AgendaStore } from "../src/store.ts";
import { sendDueReminders } from "../src/reminders.ts";

const exemplo = JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")) as unknown;
const settings = (): AgendaSettings => {
  const v = validateSettings(structuredClone(exemplo));
  if (!v.ok) throw new Error(v.error);
  return v.value;
};
const world = (over: Partial<AgendaSettings> = {}) => makeWorld(agendaRobot, { settings: { ...settings(), ...over } });
const ANA = "5511987654321", BIA = "5511911112222";
// "Hoje" nos testes = quarta 2026-10-07 12:00 (São Paulo). Quinta 08/10 10:00 local = 13:00Z.
const SLOT = (day: string, hhmmUtc: string, prof = "joao") => `h_${day}T${hhmmUtc}:00.000Z|${prof}`;

/** Conduz o cliente até a tela de confirmação do corte na quinta às 10h. */
async function ate_confirmacao(w: TestWorld<AgendaSettings>, who = ANA, day = "2026-10-08") {
  await w.say(who, "oi");
  await w.say(who, "Agendar horário", { replyId: "m_agendar" });
  await w.say(who, "Corte masculino", { replyId: "s_corte" });
  await w.say(who, "Sem preferência", { replyId: "p_any" });
  await w.say(who, "dia", { replyId: `d_${day}` });
  return w.say(who, "10:00", { replyId: SLOT(day, "13:00") });
}
const appts = (w: TestWorld<AgendaSettings>) => w.env.db.all<{ id: number; status: string; starts_at: string; professional_id: string }>("SELECT * FROM appointments ORDER BY id");

test("configuração de exemplo e padrão são válidas", () => {
  assert.ok(validateSettings(exemplo).ok);
  assert.ok(validateSettings(defaultSettings()).ok);
});

test("configuração inválida gera mensagens claras em português", () => {
  const ruim = structuredClone(exemplo) as any;
  ruim.servicos[0].duracao_min = "30";
  ruim.servicos[1].profissionais = ["fantasma"];
  ruim.profissionais[0].horario["3"] = { abre: "18:00", fecha: "09:00" };
  ruim.agenda.dias_max = 500;
  const v = validateSettings(ruim);
  assert.ok(!v.ok);
  if (!v.ok) {
    assert.match(v.error, /duracao_min: deve ser número/);
    assert.match(v.error, /profissional "fantasma" não existe/);
    assert.match(v.error, /fecha deve ser depois de abre/);
    assert.match(v.error, /máximo 90/);
  }
  assert.ok(!validateSettings(null).ok);
  assert.ok(!validateSettings({ ...defaultSettings(), servicos: [] }).ok);
});

test("slots: respeitam horário, duração, folga, antecedência e conflitos (no fuso de SP)", () => {
  const s = settings();
  const tz = "America/Sao_Paulo";
  const svc = s.servicos[0];
  const now = new Date("2026-10-07T15:00:00Z");
  const quinta = freeSlots({ settings: s, tz, now, service: svc, day: "2026-10-08", booked: [], professionalId: "joao" });
  assert.equal(quinta[0].start.toISOString(), "2026-10-08T12:00:00.000Z"); // 09:00 em SP
  assert.equal(quinta.at(-1)!.start.toISOString(), "2026-10-08T20:30:00.000Z"); // 17:30 (fecha 18:00, corte 30 min)
  // domingo fechado; folga de Natal
  assert.equal(freeSlots({ settings: s, tz, now, service: svc, day: "2026-10-11", booked: [] }).length, 0);
  assert.equal(freeSlots({ settings: s, tz, now, service: svc, day: "2026-12-25", booked: [], professionalId: "joao" }).length, 0);
  // antecedência de 2h: hoje 12:00 -> primeiro slot 14:00 (João)
  const hoje = freeSlots({ settings: s, tz, now, service: svc, day: "2026-10-07", booked: [], professionalId: "joao" });
  assert.equal(hoje[0].start.toISOString(), "2026-10-07T17:00:00.000Z");
  // conflito: João ocupado 10:00-10:30 (13:00Z)
  const livre = freeSlots({ settings: s, tz, now, service: svc, day: "2026-10-08", booked: [{ professional_id: "joao", starts_at: "2026-10-08T13:00:00.000Z", ends_at: "2026-10-08T13:30:00.000Z" }], professionalId: "joao" });
  assert.ok(!livre.some((x) => x.start.toISOString() === "2026-10-08T13:00:00.000Z"));
  // serviço de 60 min não cabe nos últimos 30 min do expediente
  const longo = freeSlots({ settings: s, tz, now, service: s.servicos[2], day: "2026-10-08", booked: [], professionalId: "joao" });
  assert.equal(longo.at(-1)!.start.toISOString(), "2026-10-08T20:00:00.000Z"); // 17:00
  // serviço exclusivo do Marcos nunca oferece João
  const sob = freeSlots({ settings: s, tz, now, service: s.servicos[3], day: "2026-10-08", booked: [] });
  assert.ok(sob.every((x) => x.profId === "marcos"));
});

test("fluxo completo: menu -> serviço -> dia -> hora -> confirmar cria o agendamento e os lembretes", async () => {
  const w = world();
  const t = await ate_confirmacao(w);
  assert.equal(t, "bot");
  assert.match(w.drain().at(-1)!, /Posso confirmar\?[\s\S]*Corte masculino[\s\S]*08\/10 às 10:00[\s\S]*R\$ 45,00/);
  await w.say(ANA, "Confirmar", { replyId: "c_sim" });
  const out = w.drain().at(-1)!;
  assert.match(out, /Agendado com sucesso/);
  assert.match(out, /Rua das Flores, 120/);
  assert.match(out, /PARAR/);
  const [a] = appts(w);
  assert.equal(a.status, "agendado");
  assert.equal(a.starts_at, "2026-10-08T13:00:00.000Z");
  assert.equal(a.professional_id, "joao");
  // Agendado na véspera: o lembrete de 24h já "passou" e não é criado; só o de 2h.
  const lembretes = w.env.db.all<{ hours_before: number; due_at: string }>("SELECT * FROM reminders ORDER BY hours_before DESC");
  assert.deepEqual(lembretes.map((r) => [r.hours_before, r.due_at]), [[2, "2026-10-08T11:00:00.000Z"]]);
});

test("fluxo por texto digitado (sem botões): 'quero marcar corte amanhã 10:00'", async () => {
  const w = world();
  await w.say(ANA, "quero marcar um horário");
  await w.say(ANA, "corte masculino");
  await w.say(ANA, "sem preferência");
  await w.say(ANA, "amanhã");
  await w.say(ANA, "10:00");
  assert.match(w.drain().at(-1)!, /Posso confirmar\?/);
  await w.say(ANA, "sim");
  assert.equal(appts(w).length, 1);
});

test("dois clientes disputando o mesmo horário: só um agenda, o outro recebe novas opções", async () => {
  const w = world();
  await ate_confirmacao(w, ANA);
  await ate_confirmacao(w, BIA); // ambos chegam na confirmação do mesmo slot
  w.drain();
  await w.say(ANA, "sim", { replyId: "c_sim" });
  assert.match(w.drain(ANA).at(-1)!, /Agendado com sucesso/);
  await w.say(BIA, "sim", { replyId: "c_sim" });
  const saida = w.drain(BIA).join("\n");
  assert.match(saida, /acabou de ser ocupado/);
  assert.equal(appts(w).filter((a) => a.status === "agendado").length, 1);
});

test("com 2 profissionais o mesmo horário ainda cabe para o segundo cliente (vai para o Marcos)", async () => {
  const w = world();
  await ate_confirmacao(w, ANA);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  // Bia escolhe "sem preferência" e vê 10:00 livre com o Marcos
  await w.say(BIA, "agendar", { replyId: "m_agendar" });
  await w.say(BIA, "Corte", { replyId: "s_corte" });
  await w.say(BIA, "Sem preferência", { replyId: "p_any" });
  await w.say(BIA, "qui", { replyId: "d_2026-10-08" });
  await w.say(BIA, "10:00", { replyId: SLOT("2026-10-08", "13:00", "marcos") });
  await w.say(BIA, "sim", { replyId: "c_sim" });
  assert.deepEqual(appts(w).map((a) => a.professional_id), ["joao", "marcos"]);
});

test("cancelar pelo robô: confirma, libera o horário e cancela os lembretes", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  w.drain();
  await w.say(ANA, "Meus horários", { replyId: "m_meus" });
  assert.match(w.drain().at(-1)!, /Seus próximos horários/);
  const id = appts(w)[0].id;
  await w.say(ANA, "Corte", { replyId: `a_${id}` });
  await w.say(ANA, "Cancelar horário", { replyId: "x_cancelar" });
  assert.match(w.drain().at(-1)!, /Tem certeza/);
  await w.say(ANA, "Sim", { replyId: "k_sim" });
  assert.match(w.drain().at(-1)!, /Horário cancelado/);
  assert.equal(appts(w)[0].status, "cancelado");
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM reminders")!.n, 0);
});

test("cancelar em cima da hora (menos de 2h) não é automático: vai para atendente", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  w.setNow(new Date("2026-10-08T11:30:00Z")); // 08:30 local, 1h30 antes das 10:00
  w.drain();
  await w.say(ANA, "cancelar");
  const id = appts(w)[0].id;
  await w.say(ANA, "x", { replyId: `a_${id}` });
  await w.say(ANA, "Cancelar", { replyId: "x_cancelar" });
  await w.say(ANA, "Sim", { replyId: "k_sim" });
  assert.match(w.drain().at(-1)!, /até 2h antes/);
  assert.equal(appts(w)[0].status, "agendado");
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
});

test("remarcar: o horário antigo só é cancelado depois que o novo é confirmado", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  const id = appts(w)[0].id;
  await w.say(ANA, "Meus horários", { replyId: "m_meus" });
  await w.say(ANA, "x", { replyId: `a_${id}` });
  await w.say(ANA, "Remarcar", { replyId: "x_remarcar" });
  assert.equal(appts(w)[0].status, "agendado"); // ainda ativo
  await w.say(ANA, "sex", { replyId: "d_2026-10-09" });
  await w.say(ANA, "11:00", { replyId: SLOT("2026-10-09", "14:00") });
  assert.equal(appts(w)[0].status, "agendado"); // ainda ativo até confirmar
  await w.say(ANA, "sim", { replyId: "c_sim" });
  assert.match(w.drain().at(-1)!, /Remarcado com sucesso/);
  assert.deepEqual(appts(w).map((a) => a.status), ["cancelado", "agendado"]);
  assert.equal(appts(w)[1].starts_at, "2026-10-09T14:00:00.000Z");
});

test("lembretes: dentro da janela de 24h vai texto com botões; 'sim' confirma", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  w.drain();
  w.setNow(new Date("2026-10-08T11:00:00Z")); // 2h antes; última msg da Ana foi há 20h -> janela aberta
  assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 1);
  const m = w.wa.sent.at(-1)!.msg;
  assert.equal(m.kind, "buttons");
  assert.match(w.drain().at(-1)!, /Lembrete: \*Corte masculino\* com João em 08\/10 às 10:00/);
  await w.say(ANA, "Confirmo", { replyId: "rc" });
  assert.match(w.drain().at(-1)!, /Presença confirmada/);
  assert.equal(appts(w)[0].status, "confirmado");
  // não reenvia o mesmo lembrete
  assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 0);
});

test("lembretes fora da janela de 24h: sem template NÃO envia (e tenta de novo); com template envia template", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  w.drain();
  w.setNow(new Date("2026-10-08T11:00:00Z"));
  w.env.db.run("UPDATE contacts SET last_inbound_at = ?", "2026-10-06T00:00:00Z"); // cliente sumiu há 2 dias
  const antesSemTpl = w.wa.sent.length;
  assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 0);
  assert.equal(w.wa.sent.length, antesSemTpl); // nada foi enviado
  const pend = w.env.db.get<{ result: string; next_try_at: string }>("SELECT result, next_try_at FROM reminders WHERE hours_before = 2")!;
  assert.equal(pend.result, "sem_template");
  assert.ok(pend.next_try_at);

  // empresa cadastra o template aprovado na Meta
  const s = settings();
  s.lembretes.template_nome = "lembrete_agendamento";
  w.env.repo.updateTenantSettings(w.tenant.id, s);
  w.advance(31 * 60_000);
  const antes = w.wa.sent.length;
  assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 1);
  const msg = w.wa.sent[antes].msg;
  assert.equal(msg.kind, "template");
  if (msg.kind === "template") assert.deepEqual(msg.params, ["cliente", "Corte masculino", "08/10 às 10:00", "Barbearia do Zé"]);
});

test("cliente que mandou PARAR não recebe lembrete", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  await w.say(ANA, "PARAR");
  w.drain();
  w.setNow(new Date("2026-10-08T11:00:00Z"));
  const antes = w.wa.sent.length;
  assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 0);
  assert.equal(w.wa.sent.length, antes);
  assert.equal(w.env.db.get<{ result: string }>("SELECT result FROM reminders")!.result, "optout");
});

test("resposta ao lembrete: '2' cancela e '3' inicia a remarcação", async () => {
  for (const [resposta, esperado, status] of [["2", /Horário cancelado/, "cancelado"], ["3", /escolher o novo horário/, "agendado"], ["1", /Presença confirmada/, "confirmado"]] as const) {
    const w = world();
    await ate_confirmacao(w, ANA, "2026-10-09"); // sexta 10:00 => lembrete de 24h na quinta 10:00
    await w.say(ANA, "sim", { replyId: "c_sim" });
    w.setNow(new Date("2026-10-08T13:30:00Z"));
    assert.equal(await sendDueReminders(w.env, agendaRobot, w.env.clock()), 1);
    w.drain();
    await w.say(ANA, resposta);
    assert.match(w.drain().join("\n"), esperado);
    assert.equal(appts(w)[0].status, status);
  }
});

test("lista de espera: dia lotado -> entra na fila -> cancelamento avisa -> primeiro a responder QUERO leva", async () => {
  const w = world();
  // Lota quinta 10:00 para os dois barbeiros com Ana e Bia
  await ate_confirmacao(w, ANA);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  const s = settings();
  // Para simplificar, reduz a agenda a só o João
  s.profissionais = s.profissionais.filter((p) => p.id === "joao");
  s.servicos = s.servicos.filter((x) => x.id !== "sobrancelha");
  w.env.repo.updateTenantSettings(w.tenant.id, s);
  // Fecha o dia inteiro de quinta: marca todos os horários de João
  const store = new AgendaStore(w.env.db);
  const fake = w.env.repo.upsertContact(w.tenant.id, "5511900000000", "Lotador", w.env.clock());
  for (let t = 12 * 60; t < 21 * 60; t += 30) {
    const start = new Date(Date.UTC(2026, 9, 8, Math.floor(t / 60), t % 60));
    store.book({ tenantId: w.tenant.id, contactId: fake.id, service: s.servicos[0], professionalId: "joao", professionalName: "João", start, source: "painel" }, s, w.env.clock());
  }
  w.drain();
  await w.say(BIA, "agendar", { replyId: "m_agendar" });
  await w.say(BIA, "Corte", { replyId: "s_corte" });
  await w.say(BIA, "08/10"); // quinta lotada: o robô oferece a lista de espera
  assert.match(w.drain().at(-1)!, /lista de espera/);
  await w.say(BIA, "Entrar na espera", { replyId: "w_sim" });
  assert.match(w.drain().at(-1)!, /Anotado/);
  assert.equal(w.env.db.get<{ n: number }>("SELECT COUNT(*) n FROM waitlist")!.n, 1);

  // Alguém cancela o 10:00 do João -> Bia é avisada
  const vaga = appts(w).find((a) => a.starts_at === "2026-10-08T13:00:00.000Z" && a.status !== "cancelado")!;
  const { notifyWaitlist } = await import("../src/flow.ts");
  store.cancel(w.tenant.id, vaga.id, "teste", w.env.clock());
  await notifyWaitlist(w.env, w.tenant, s, w.env.clock(), vaga.id);
  assert.match(w.drain(BIA).at(-1)!, /Abriu uma vaga de \*Corte masculino\* em 08\/10 às 10:00/);

  await w.say(BIA, "QUERO", { replyId: "wl_quero" });
  assert.match(w.drain(BIA).at(-1)!, /Garantido/);
  const nova = w.env.db.get<{ source: string; contact_id: number }>("SELECT source, contact_id FROM appointments WHERE starts_at = ? AND status = 'agendado'", "2026-10-08T13:00:00.000Z")!;
  assert.equal(nova.source, "lista_espera");
  assert.equal(w.env.db.get<{ status: string }>("SELECT status FROM waitlist")!.status, "atendido");
});

test("dúvidas: responde pela FAQ; pergunta fora da base não é inventada e vai para humano", async () => {
  const w = world();
  await w.say(ANA, "qual o endereço de vocês?");
  assert.match(w.drain()[0], /Rua das Flores, 120/);
  await w.say(ANA, "vocês fazem tatuagem?");
  const resp = w.drain().join("\n");
  assert.match(resp, /Não tenho essa informação no momento\. Vou encaminhar você para um atendente\./);
  assert.equal(w.env.repo.conversations(w.tenant.id)[0].mode, "human");
});

test("mídia (foto/áudio) não quebra o fluxo", async () => {
  const w = world();
  await w.say(ANA, "", { type: "audio" });
  assert.match(w.drain()[0], /só consigo entender mensagens de texto/);
});

test("multiempresa: agendamentos de uma empresa não bloqueiam a agenda de outra", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  const t2 = w.env.repo.createTenant({ slug: "outra", nome: "Outra", phone_number_id: "777", settings: settings() }, w.env.clock());
  const store = new AgendaStore(w.env.db);
  const s = settings();
  const [y, m, d] = [2026, 10, 8];
  const booked = store.bookedBetween(t2.id, new Date(Date.UTC(y, m - 1, d)).toISOString(), new Date(Date.UTC(y, m - 1, d + 1)).toISOString());
  assert.equal(booked.length, 0);
  const c2 = w.env.repo.upsertContact(t2.id, ANA, "Ana", w.env.clock());
  const ok = store.book({ tenantId: t2.id, contactId: c2.id, service: s.servicos[0], professionalId: "joao", professionalName: "João", start: new Date("2026-10-08T13:00:00.000Z"), source: "painel" }, s, w.env.clock());
  assert.ok(ok); // mesmo profissional/horário, outra empresa
});

test("painel: agenda do dia, marcar comparecimento/falta, agendamento manual e LGPD", async () => {
  const w = world();
  await ate_confirmacao(w);
  await w.say(ANA, "sim", { replyId: "c_sim" });
  const app = w.app();
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(app.server.address() as import("node:net").AddressInfo).port}`;
  try {
    const login = await fetch(`${base}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "token=chave-admin-de-teste-123456" });
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const get = async (p: string) => (await fetch(`${base}${p}`, { headers: { cookie } })).text();
    const post = (p: string, body: string) => fetch(`${base}${p}`, { method: "POST", redirect: "manual", headers: { cookie, "content-type": "application/x-www-form-urlencoded" }, body });

    assert.match(await get("/admin"), /agendamentos hoje/);
    const dia = await get("/admin/agenda?dia=2026-10-08");
    assert.match(dia, /Corte masculino/);
    assert.match(dia, /10:00/);

    // LGPD: não exclui quem tem horário futuro
    const c = w.env.repo.contactByWaId(w.tenant.id, ANA)!;
    await post(`/admin/clientes/${c.id}/excluir`, "confirmo=1");
    assert.ok(w.env.repo.contact(w.tenant.id, c.id));

    const id = appts(w)[0].id;
    await post(`/admin/agenda/${id}/status`, "status=faltou&dia=2026-10-08");
    assert.equal(appts(w)[0].status, "faltou");

    // agendamento manual sem autorização de lembretes => cliente fica sem proativas
    const r = await post("/admin/agenda/novo", new URLSearchParams({ telefone: "(11) 95555-4444", nome: "Carlos", servico: "corte", prof: "marcos", data: "2026-10-09", hora: "15:00" }).toString());
    assert.match(r.headers.get("location")!, /msg=/);
    const carlos = w.env.repo.contactByWaId(w.tenant.id, "5511955554444")!;
    assert.equal(carlos.opt_out, 1);
    // conflito no mesmo horário/profissional é recusado
    const dup = await post("/admin/agenda/novo", new URLSearchParams({ telefone: "11966665555", nome: "Dani", servico: "corte", prof: "marcos", data: "2026-10-09", hora: "15:00", lembretes: "1" }).toString());
    assert.match(dup.headers.get("location")!, /erro=/);
    // nome malicioso não vira script
    await post("/admin/agenda/novo", new URLSearchParams({ telefone: "11977776666", nome: "<script>alert(1)</script>", servico: "corte", prof: "joao", data: "2026-10-09", hora: "09:00", lembretes: "1" }).toString());
    assert.ok(!(await get("/admin/agenda?dia=2026-10-09")).includes("<script>alert"));
    assert.match(await get("/admin"), /comparecimento/);
  } finally { await new Promise<void>((r) => app.server.close(() => r())); }
});
