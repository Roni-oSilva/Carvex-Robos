import { requestHandoff } from "../../../shared/engine/engine.ts";
import { customMsg } from "../../../shared/engine/settings.ts";
import type { BotEnv, FlowContext } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { answerFromKnowledge } from "../../../shared/ai/knowledge.ts";
import type { InboundMessage, Outgoing } from "../../../shared/whatsapp/types.ts";
import { formatBRL, normalize, clip } from "../../../shared/utils/text.ts";
import { addDays, addHours, estaAberto, localDate, localDateTimeLabel, localTime, pad2, zonedToUtc } from "../../../shared/utils/time.ts";
import { candidateDays, dayLabel, dedupeByStart, freeSlots, professionalsFor } from "./slots.ts";
import type { AgendaSettings, Servico } from "./settings.ts";
import { AgendaStore, type Appointment } from "./store.ts";
import { knowledge } from "./settings.ts";

type Ctx = FlowContext<AgendaSettings>;

interface D {
  opts?: string[];
  servico?: string;
  prof?: string; // id ou "any"
  dia?: string;
  pagina?: number;
  slot?: string; // ISO UTC
  slotProf?: string;
  reagendar?: number;
  cancelar?: number;
  /** Agendamento para o qual enviamos lembrete e aguardamos "sim / cancelar / remarcar". */
  pending_confirm?: number;
  /** Vaga aberta oferecida a quem estava na lista de espera. */
  offer?: { wl: number; servico: string; prof: string; start: string };
}

const SIM = new Set(["sim", "s", "confirmo", "confirmar", "confirmado", "ok", "pode", "quero", "aceito", "1", "isso", "claro"]);
const NAO = new Set(["nao", "n", "cancelar", "cancela", "cancelo", "nao vou", "nao quero", "2", "desmarcar"]);
const REMARCAR = new Set(["remarcar", "reagendar", "trocar", "mudar", "3", "outro horario"]);
const MENU_WORDS = new Set(["menu", "inicio", "voltar", "oi", "ola", "bom dia", "boa tarde", "boa noite", "oie", "opa", "e ai"]);

const data = (ctx: Ctx): D => ctx.conv.data as D;
const store = (ctx: Ctx): AgendaStore => new AgendaStore(ctx.env.db);
const fmtPreco = (s: Servico) => (s.preco > 0 ? formatBRL(Math.round(s.preco * 100)) : "sob consulta");
const tz = (ctx: Ctx) => ctx.tenant.timezone;

function intentOf(msg: InboundMessage): { id: string; text: string } {
  return { id: msg.replyId ?? "", text: normalize(msg.text ?? "") };
}

function reset(ctx: Ctx): void {
  const d = data(ctx);
  ctx.conv.state = "inicio";
  for (const k of ["opts", "servico", "prof", "dia", "pagina", "slot", "slotProf", "reagendar", "cancelar"] as const) delete d[k];
}

function pickById(ctx: Ctx, msg: InboundMessage, prefix: string): string | null {
  if (msg.replyId?.startsWith(prefix)) return msg.replyId.slice(prefix.length);
  const n = Number((msg.text ?? "").trim());
  const opts = data(ctx).opts;
  if (opts && Number.isInteger(n) && n >= 1 && n <= opts.length) return opts[n - 1];
  return null;
}

export function menu(ctx: Ctx, intro?: string): Outgoing[] {
  reset(ctx);
  const nome = ctx.settings.empresa.nome;
  const body = intro ?? customMsg(ctx.settings, "boas_vindas", `Olá! 😊 Eu sou o assistente virtual da ${nome}. Como posso ajudar?`);
  return [{ kind: "buttons", body, buttons: [{ id: "m_agendar", title: "Agendar horário" }, { id: "m_meus", title: "Meus horários" }, { id: "m_humano", title: "Falar com atendente" }] }];
}

// ---------------------------------------------------------------- escolha de serviço / profissional
function askService(ctx: Ctx, text?: string): Outgoing[] {
  const s = ctx.settings;
  data(ctx).opts = s.servicos.map((x) => x.id);
  ctx.conv.state = "ag_servico";
  return [{ kind: "list", body: text ?? "Qual serviço você quer agendar?", button: "Ver serviços", sectionTitle: "Serviços",
    rows: s.servicos.slice(0, 10).map((x) => ({ id: `s_${x.id}`, title: clip(x.nome, 24), description: `${x.duracao_min} min · ${fmtPreco(x)}` })) }];
}

function askProfessional(ctx: Ctx, svc: Servico): Outgoing[] {
  const profs = professionalsFor(ctx.settings, svc);
  data(ctx).opts = ["any", ...profs.map((p) => p.id)];
  ctx.conv.state = "ag_prof";
  return [{ kind: "list", body: "Com quem você prefere?", button: "Escolher", sectionTitle: "Profissionais",
    rows: [{ id: "p_any", title: "Sem preferência", description: "O primeiro horário livre" }, ...profs.slice(0, 9).map((p) => ({ id: `p_${p.id}`, title: clip(p.nome, 24) }))] }];
}

// ---------------------------------------------------------------- dias e horários
function slotsOn(ctx: Ctx, svc: Servico, day: string, prof: string) {
  const s = ctx.settings;
  const [y, m, d] = day.split("-").map(Number);
  const from = zonedToUtc(y, m, d, 0, 0, tz(ctx)), to = zonedToUtc(y, m, d + 1, 0, 0, tz(ctx));
  const booked = store(ctx).bookedBetween(ctx.tenant.id, from.toISOString(), to.toISOString());
  const all = freeSlots({ settings: s, tz: tz(ctx), now: ctx.now, service: svc, day, booked, professionalId: prof === "any" ? undefined : prof });
  return prof === "any" ? dedupeByStart(all) : all;
}

function askDay(ctx: Ctx, svc: Servico, prof: string): Outgoing[] {
  const today = localDate(ctx.now, tz(ctx));
  const days = candidateDays(ctx.settings, tz(ctx), ctx.now).filter((d) => slotsOn(ctx, svc, d, prof).length > 0).slice(0, 10);
  if (days.length === 0) {
    ctx.conv.state = "ag_espera_dia";
    return [{ kind: "text", body: `No momento não há horários livres para ${svc.nome} nos próximos ${ctx.settings.agenda.dias_max} dias. 😕\n\nPara entrar na lista de espera, me diga o dia que prefere (ex.: ${dayLabel(addDays(today, 1), today)} ou 15/10). Para falar com um atendente, digite ATENDENTE.` }];
  }
  data(ctx).opts = days;
  ctx.conv.state = "ag_dia";
  return [{ kind: "list", body: `Qual dia para *${svc.nome}*?`, button: "Ver dias", sectionTitle: "Dias disponíveis",
    rows: days.map((d) => ({ id: `d_${d}`, title: clip(dayLabel(d, today), 24) })) }];
}

const PAGE = 9;
function askTime(ctx: Ctx, svc: Servico, prof: string, day: string, page = 0): Outgoing[] {
  const slots = slotsOn(ctx, svc, day, prof);
  const d = data(ctx);
  if (slots.length === 0) return askDay(ctx, svc, prof);
  const slice = slots.slice(page * PAGE, page * PAGE + PAGE);
  const more = slots.length > (page + 1) * PAGE;
  d.dia = day; d.pagina = page;
  d.opts = [...slice.map((x) => `${x.start.toISOString()}|${x.profId}`), ...(more ? ["more"] : [])];
  ctx.conv.state = "ag_hora";
  const rows = slice.map((x) => ({ id: `h_${x.start.toISOString()}|${x.profId}`, title: localTime(x.start, tz(ctx)) }));
  if (more) rows.push({ id: "h_more", title: "Mais horários ▶" });
  return [{ kind: "list", body: `Horários livres em ${dayLabel(day, localDate(ctx.now, tz(ctx)))}:`, button: "Ver horários", sectionTitle: "Horários", rows }];
}

function parseDayText(text: string, ctx: Ctx): string | null {
  const t = normalize(text);
  const today = localDate(ctx.now, tz(ctx));
  if (t === "hoje") return today;
  if (t === "amanha") return addDays(today, 1);
  const m = /(\d{1,2})\s*[\/ ]\s*(\d{1,2})/.exec(text) ?? /\b(\d{1,2})\b/.exec(text);
  if (!m) return null;
  const [y] = today.split("-").map(Number);
  const day = Number(m[1]);
  const mon = m[2] ? Number(m[2]) : Number(today.split("-")[1]);
  if (mon < 1 || mon > 12 || day < 1 || day > 31) return null;
  let cand = `${y}-${pad2(mon)}-${pad2(day)}`;
  if (cand < today) cand = `${y + 1}-${pad2(mon)}-${pad2(day)}`;
  return cand;
}

// ---------------------------------------------------------------- confirmação / criação
function summary(ctx: Ctx, svc: Servico, profName: string, start: Date): string {
  return `*${svc.nome}* com ${profName}\n📅 ${localDateTimeLabel(start, tz(ctx))}\n💰 ${fmtPreco(svc)}`;
}

function askConfirm(ctx: Ctx, svc: Servico, profId: string, start: Date): Outgoing[] {
  const p = ctx.settings.profissionais.find((x) => x.id === profId)!;
  const d = data(ctx);
  d.slot = start.toISOString(); d.slotProf = profId;
  ctx.conv.state = "ag_confirmar";
  const verbo = d.reagendar ? "Confirma a *remarcação*?" : "Posso confirmar?";
  return [{ kind: "buttons", body: `${verbo}\n\n${summary(ctx, svc, p.nome, start)}`, buttons: [{ id: "c_sim", title: "Confirmar ✅" }, { id: "c_outro", title: "Outro horário" }, { id: "c_nao", title: "Cancelar" }] }];
}

function finalizeBooking(ctx: Ctx, svc: Servico, profId: string, start: Date, source = "whatsapp"): Outgoing[] {
  const d = data(ctx);
  const p = ctx.settings.profissionais.find((x) => x.id === profId)!;
  const appt = store(ctx).book({ tenantId: ctx.tenant.id, contactId: ctx.contact.id, service: svc, professionalId: p.id, professionalName: p.nome, start, source, replaceId: d.reagendar }, ctx.settings, ctx.now);
  if (!appt) {
    return [{ kind: "text", body: "Poxa, esse horário acabou de ser ocupado por outra pessoa. 😕 Vou mostrar as opções atualizadas." }, ...askTime(ctx, svc, d.prof ?? "any", d.dia ?? localDate(start, tz(ctx)))];
  }
  ctx.env.repo.event(ctx.tenant.id, d.reagendar ? "remarcou" : "agendou", { id: appt.id }, ctx.now);
  const remarcado = !!d.reagendar;
  if (remarcado) notifyWaitlist(ctx.env, ctx.tenant, ctx.settings, ctx.now, d.reagendar!).catch(() => {});
  reset(ctx);
  const regras = customMsg(ctx.settings, "politica_cancelamento", `Para cancelar ou remarcar, é só me avisar com pelo menos ${ctx.settings.agenda.cancelar_ate_horas}h de antecedência.`);
  return [{ kind: "text", body: `${remarcado ? "Remarcado" : "Agendado"} com sucesso! ✅\n\n${summary(ctx, svc, appt.professional_name, start)}\n\n${ctx.settings.empresa.endereco ? `📍 ${ctx.settings.empresa.endereco}\n\n` : ""}${regras}${ctx.settings.lembretes.ativo ? "\nVou te enviar um lembrete antes do horário. Se não quiser lembretes, responda PARAR." : ""}` }];
}

// ---------------------------------------------------------------- meus horários
function listMine(ctx: Ctx): Outgoing[] {
  const mine = store(ctx).upcomingFor(ctx.tenant.id, ctx.contact.id, ctx.now.toISOString());
  if (mine.length === 0) {
    return [{ kind: "buttons", body: "Você não tem horários futuros marcados.", buttons: [{ id: "m_agendar", title: "Agendar horário" }, { id: "m_menu", title: "Menu" }] }];
  }
  data(ctx).opts = mine.map((a) => String(a.id));
  ctx.conv.state = "meus";
  return [{ kind: "list", body: "Seus próximos horários. Toque em um para confirmar, remarcar ou cancelar:", button: "Ver horários", sectionTitle: "Agendados",
    rows: mine.map((a) => ({ id: `a_${a.id}`, title: clip(a.service_name, 24), description: `${localDateTimeLabel(new Date(a.starts_at), tz(ctx))} · ${a.status}` })) }];
}

function apptActions(ctx: Ctx, a: Appointment): Outgoing[] {
  data(ctx).cancelar = a.id;
  ctx.conv.state = "meu_item";
  const when = localDateTimeLabel(new Date(a.starts_at), tz(ctx));
  const buttons = a.status === "agendado"
    ? [{ id: "x_confirmar", title: "Confirmar ✅" }, { id: "x_remarcar", title: "Remarcar" }, { id: "x_cancelar", title: "Cancelar horário" }]
    : [{ id: "x_remarcar", title: "Remarcar" }, { id: "x_cancelar", title: "Cancelar horário" }, { id: "m_menu", title: "Menu" }];
  return [{ kind: "buttons", body: `*${a.service_name}* com ${a.professional_name}\n📅 ${when}\nSituação: ${a.status}`, buttons }];
}

function canChange(ctx: Ctx, a: Appointment): boolean {
  return addHours(ctx.now, ctx.settings.agenda.cancelar_ate_horas).getTime() <= new Date(a.starts_at).getTime();
}

function startReschedule(ctx: Ctx, a: Appointment): Outgoing[] {
  if (!canChange(ctx, a)) return tooLate(ctx);
  const d = data(ctx);
  const svc = ctx.settings.servicos.find((x) => x.id === a.service_id);
  if (!svc) return requestHandoff(ctx, "serviço removido do cadastro", "Esse serviço não está mais disponível para remarcação automática. Vou chamar um atendente. 🙂");
  reset(ctx);
  d.reagendar = a.id; d.servico = svc.id; d.prof = "any";
  return [{ kind: "text", body: "Sem problema! Vamos escolher o novo horário. O atual só será cancelado quando você confirmar o novo." }, ...askDay(ctx, svc, "any")];
}

function tooLate(ctx: Ctx): Outgoing[] {
  const h = ctx.settings.agenda.cancelar_ate_horas;
  return requestHandoff(ctx, "alteração fora do prazo", `Alterações pelo robô só são possíveis até ${h}h antes do horário. Vou chamar um atendente para ver o que dá para fazer. 🙂`);
}

function doCancel(ctx: Ctx, a: Appointment): Outgoing[] {
  if (!canChange(ctx, a)) return tooLate(ctx);
  store(ctx).cancel(ctx.tenant.id, a.id, "cancelado pelo cliente", ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "cancelou", { id: a.id }, ctx.now);
  notifyWaitlist(ctx.env, ctx.tenant, ctx.settings, ctx.now, a.id).catch(() => {});
  reset(ctx);
  return [{ kind: "buttons", body: "Horário cancelado. Obrigado por avisar! 🙏 Quer marcar outro?", buttons: [{ id: "m_agendar", title: "Agendar horário" }, { id: "m_menu", title: "Menu" }] }];
}

// ---------------------------------------------------------------- lista de espera
/** Chamado quando um horário libera: avisa os primeiros da lista (quem responder QUERO primeiro leva). */
export async function notifyWaitlist(env: BotEnv, tenant: Tenant, s: AgendaSettings, now: Date, apptId: number): Promise<void> {
  if (!s.lista_espera.ativo) return;
  const st = new AgendaStore(env.db);
  const a = st.get(tenant.id, apptId);
  if (!a) return;
  const start = new Date(a.starts_at);
  if (start <= now) return;
  const day = localDate(start, tenant.timezone);
  const { sendProactive } = await import("../../../shared/engine/proactive.ts");
  for (const w of st.waitFor(tenant.id, a.service_id, day, a.professional_id, s.lista_espera.avisar_ate)) {
    const contact = env.repo.contact(tenant.id, w.contact_id);
    if (!contact) continue;
    const text = `Boa notícia! 🎉 Abriu uma vaga de *${a.service_name}* em ${localDateTimeLabel(start, tenant.timezone)}. Quer esse horário? Responda QUERO nas próximas horas (quem responder primeiro garante).`;
    // Só dentro da janela de 24h (sem template de "vaga aberta" cadastrado, não há como avisar fora dela).
    const r = await sendProactive(env, tenant, contact, { text, buttons: [{ id: "wl_quero", title: "QUERO" }, { id: "wl_nao", title: "Não quero" }] }, now);
    if (r === "sent") {
      st.setWait(w.id, "avisado", now);
      const conv = env.repo.conversationFor(tenant.id, contact.id, now);
      const cd = JSON.parse(conv.data) as D;
      cd.offer = { wl: w.id, servico: a.service_id, prof: a.professional_id, start: a.starts_at };
      env.repo.saveConversation({ id: conv.id, state: conv.state, data: JSON.stringify(cd), mode: conv.mode, handoff_reason: conv.handoff_reason }, now);
    }
  }
}

function takeOffer(ctx: Ctx): Outgoing[] {
  const d = data(ctx);
  const o = d.offer!;
  delete d.offer;
  const svc = ctx.settings.servicos.find((x) => x.id === o.servico);
  const p = ctx.settings.profissionais.find((x) => x.id === o.prof);
  if (!svc || !p || new Date(o.start) <= ctx.now) return [{ kind: "text", body: "Esse horário não está mais disponível. 😕" }];
  const appt = store(ctx).book({ tenantId: ctx.tenant.id, contactId: ctx.contact.id, service: svc, professionalId: p.id, professionalName: p.nome, start: new Date(o.start), source: "lista_espera" }, ctx.settings, ctx.now);
  if (!appt) return [{ kind: "text", body: "Poxa, outra pessoa respondeu primeiro e já garantiu o horário. 😕 Você continua na lista de espera para as próximas vagas." }];
  ctx.env.db.run("UPDATE waitlist SET status = 'atendido' WHERE id = ?", o.wl);
  ctx.env.repo.event(ctx.tenant.id, "espera_atendida", { id: appt.id }, ctx.now);
  return [{ kind: "text", body: `Garantido! ✅\n\n${summary(ctx, svc, p.nome, new Date(o.start))}\n\nAté lá! 😊` }];
}

// ---------------------------------------------------------------- entrada principal
export async function handleAgenda(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const s = ctx.settings;
  const d = data(ctx);
  const { id: rid, text } = intentOf(msg);

  if (msg.type !== "text" && msg.type !== "button" && msg.type !== "list") {
    return [{ kind: "text", body: "Recebi seu arquivo, mas eu só consigo entender mensagens de texto e botões. 🙂 Digite MENU para ver as opções ou ATENDENTE para falar com uma pessoa." }];
  }

  // Oferta de vaga da lista de espera
  if (d.offer) {
    if (rid === "wl_quero" || SIM.has(text) || text === "quero") return takeOffer(ctx);
    if (rid === "wl_nao" || NAO.has(text)) { delete d.offer; return [{ kind: "text", body: "Tudo bem! Continuo te avisando se surgirem outras vagas. 🙂" }]; }
  }

  // Resposta ao lembrete
  if (d.pending_confirm) {
    const a = store(ctx).get(ctx.tenant.id, d.pending_confirm);
    const yes = rid === "rc" || SIM.has(text), no = rid === "rx" || NAO.has(text), re = rid === "rr" || REMARCAR.has(text);
    if (a && (a.status === "agendado" || a.status === "confirmado") && (yes || no || re)) {
      delete d.pending_confirm;
      if (yes) {
        store(ctx).confirm(ctx.tenant.id, a.id, ctx.now);
        ctx.env.repo.event(ctx.tenant.id, "confirmou", { id: a.id }, ctx.now);
        return [{ kind: "text", body: `Presença confirmada! ✅ Te esperamos em ${localDateTimeLabel(new Date(a.starts_at), tz(ctx))}.${s.empresa.endereco ? `\n📍 ${s.empresa.endereco}` : ""}` }];
      }
      if (no) return doCancel(ctx, a);
      return startReschedule(ctx, a);
    }
    if (!a || (a.status !== "agendado" && a.status !== "confirmado")) delete d.pending_confirm;
  }

  // Atalhos globais
  if (MENU_WORDS.has(text) || rid === "m_menu") return menu(ctx);
  if (rid === "m_humano") return requestHandoff(ctx, "pedido do cliente", handoffText(ctx));
  if (rid === "m_agendar" || /\b(agendar|marcar|reservar)\b/.test(text) || (ctx.conv.state === "inicio" && /\bhorario\b/.test(text) && !/\b(meu|meus|qual)\b/.test(text))) {
    reset(ctx);
    return askService(ctx);
  }
  if (rid === "m_meus" || /\b(meus|meu horario|minha agenda|consultar|cancelar|remarcar|reagendar)\b/.test(text) && ctx.conv.state === "inicio") {
    reset(ctx);
    return listMine(ctx);
  }

  switch (ctx.conv.state) {
    case "ag_servico": {
      const id = pickById(ctx, msg, "s_") ?? s.servicos.find((x) => normalize(x.nome) === text || (text.length > 2 && normalize(x.nome).includes(text)))?.id ?? null;
      const svc = s.servicos.find((x) => x.id === id);
      if (!svc) return askService(ctx, "Não entendi qual serviço. Escolha uma opção da lista:");
      d.servico = svc.id;
      const profs = professionalsFor(s, svc);
      if (profs.length === 0) return requestHandoff(ctx, "serviço sem profissional", "Esse serviço está sem profissional disponível no momento. Vou chamar um atendente. 🙂");
      if (profs.length === 1) { d.prof = profs[0].id; return askDay(ctx, svc, d.prof); }
      return askProfessional(ctx, svc);
    }
    case "ag_prof": {
      const svc = s.servicos.find((x) => x.id === d.servico)!;
      const id = pickById(ctx, msg, "p_") ?? (text.includes("preferencia") || text === "qualquer" ? "any" : s.profissionais.find((p) => normalize(p.nome) === text)?.id ?? null);
      if (!id || (id !== "any" && !professionalsFor(s, svc).some((p) => p.id === id))) return askProfessional(ctx, svc);
      d.prof = id;
      return askDay(ctx, svc, id);
    }
    case "ag_dia": {
      const svc = s.servicos.find((x) => x.id === d.servico)!;
      const day = pickById(ctx, msg, "d_") ?? parseDayText(msg.text ?? "", ctx);
      if (!day || slotsOn(ctx, svc, day, d.prof ?? "any").length === 0) {
        if (day && s.lista_espera.ativo) { d.dia = day; ctx.conv.state = "ag_espera_oferta"; return [{ kind: "buttons", body: `Não há horários livres em ${dayLabel(day, localDate(ctx.now, tz(ctx)))}. Quer entrar na lista de espera desse dia? Eu aviso se alguém cancelar.`, buttons: [{ id: "w_sim", title: "Entrar na espera" }, { id: "w_outro", title: "Ver outros dias" }] }]; }
        return askDay(ctx, svc, d.prof ?? "any");
      }
      return askTime(ctx, svc, d.prof ?? "any", day, 0);
    }
    case "ag_espera_dia": {
      const day = parseDayText(msg.text ?? "", ctx);
      if (!day) return [{ kind: "text", body: "Não entendi o dia. Digite no formato 15/10, ou HOJE / AMANHÃ. Se preferir, digite ATENDENTE." }];
      d.dia = day;
      return joinWait(ctx);
    }
    case "ag_espera_oferta": {
      if (rid === "w_sim" || SIM.has(text)) return joinWait(ctx);
      return askDay(ctx, s.servicos.find((x) => x.id === d.servico)!, d.prof ?? "any");
    }
    case "ag_hora": {
      const svc = s.servicos.find((x) => x.id === d.servico)!;
      if (rid === "h_more" || text === "mais") return askTime(ctx, svc, d.prof ?? "any", d.dia!, (d.pagina ?? 0) + 1);
      let slot: string | null = msg.replyId?.startsWith("h_") ? msg.replyId.slice(2) : pickById(ctx, msg, "h_");
      if (!slot) {
        // Horário digitado: "10:00", "10h", "10h30" ou só "10" — procura entre TODOS os livres do dia (não só na página atual).
        const m = /^\s*(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?\s*$/i.exec(msg.text ?? "");
        if (m) {
          const hhmm = `${pad2(Number(m[1]))}:${m[2] ?? "00"}`;
          const hit = slotsOn(ctx, svc, d.dia!, d.prof ?? "any").find((x) => localTime(x.start, tz(ctx)) === hhmm);
          if (hit) slot = `${hit.start.toISOString()}|${hit.profId}`;
        }
      }
      if (!slot || slot === "more") return askTime(ctx, svc, d.prof ?? "any", d.dia!, d.pagina ?? 0);
      const [iso, profId] = slot.split("|");
      return askConfirm(ctx, svc, profId, new Date(iso));
    }
    case "ag_confirmar": {
      const svc = s.servicos.find((x) => x.id === d.servico)!;
      if (rid === "c_sim" || SIM.has(text)) return finalizeBooking(ctx, svc, d.slotProf!, new Date(d.slot!));
      if (rid === "c_outro" || text.includes("outro")) return askTime(ctx, svc, d.prof ?? "any", d.dia ?? localDate(new Date(d.slot!), tz(ctx)), 0);
      if (rid === "c_nao" || NAO.has(text)) return menu(ctx, "Tudo bem, não agendei nada. Posso ajudar com mais alguma coisa?");
      return askConfirm(ctx, svc, d.slotProf!, new Date(d.slot!));
    }
    case "meus": {
      const id = pickById(ctx, msg, "a_");
      const a = id ? store(ctx).get(ctx.tenant.id, Number(id)) : undefined;
      if (!a || a.contact_id !== ctx.contact.id) return listMine(ctx);
      return apptActions(ctx, a);
    }
    case "meu_item": {
      const a = d.cancelar ? store(ctx).get(ctx.tenant.id, d.cancelar) : undefined;
      if (!a || a.contact_id !== ctx.contact.id) return listMine(ctx);
      if (rid === "x_confirmar" || SIM.has(text)) { store(ctx).confirm(ctx.tenant.id, a.id, ctx.now); reset(ctx); return [{ kind: "text", body: "Presença confirmada! ✅" }]; }
      if (rid === "x_remarcar" || REMARCAR.has(text)) return startReschedule(ctx, a);
      if (rid === "x_cancelar" || NAO.has(text)) {
        ctx.conv.state = "cancelar_conf";
        return [{ kind: "buttons", body: "Tem certeza que quer cancelar este horário?", buttons: [{ id: "k_sim", title: "Sim, cancelar" }, { id: "k_nao", title: "Manter horário" }] }];
      }
      return apptActions(ctx, a);
    }
    case "cancelar_conf": {
      const a = d.cancelar ? store(ctx).get(ctx.tenant.id, d.cancelar) : undefined;
      if (!a || a.contact_id !== ctx.contact.id) return menu(ctx);
      if (rid === "k_sim" || SIM.has(text)) return doCancel(ctx, a);
      return menu(ctx, "Combinado, mantive o seu horário. ✅");
    }
  }

  // Estado "inicio": dúvidas livres (FAQ / IA restrita à base) ou encaminhamento.
  if (rid === "m_duvida") return [{ kind: "text", body: "Pode perguntar! Respondo sobre horários, endereço, serviços, preços e formas de pagamento." }];
  const ans = await answerFromKnowledge(knowledge(s), msg.text ?? "", ctx.env.ai);
  if (ans.found) return [{ kind: "text", body: ans.answer }, { kind: "buttons", body: "Posso ajudar em mais alguma coisa?", buttons: [{ id: "m_agendar", title: "Agendar horário" }, { id: "m_menu", title: "Menu" }] }];
  return requestHandoff(ctx, "pergunta sem resposta na base", `${ans.answer}${handoffSuffix(ctx)}`);
}

function joinWait(ctx: Ctx): Outgoing[] {
  const d = data(ctx);
  store(ctx).addWait(ctx.tenant.id, ctx.contact.id, d.servico!, d.prof && d.prof !== "any" ? d.prof : null, d.dia!, ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "espera_entrou", {}, ctx.now);
  const dia = dayLabel(d.dia!, localDate(ctx.now, tz(ctx)));
  reset(ctx);
  return [{ kind: "text", body: `Anotado! 📝 Você está na lista de espera para ${dia}. Se um horário abrir, eu aviso aqui no WhatsApp (e você pode sair da lista respondendo PARAR).` }];
}

function handoffSuffix(ctx: Ctx): string {
  const s = ctx.settings;
  if (s.empresa.horario && !estaAberto(s.empresa.horario, ctx.now, tz(ctx))) {
    return `\n\n${customMsg(s, "fora_horario", `Estamos fora do horário de atendimento (${s.empresa.horario_texto}). Responderemos assim que abrirmos.`)}`;
  }
  return "";
}

function handoffText(ctx: Ctx): string {
  return `${customMsg(ctx.settings, "handoff", "Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂")}${handoffSuffix(ctx)}`;
}

