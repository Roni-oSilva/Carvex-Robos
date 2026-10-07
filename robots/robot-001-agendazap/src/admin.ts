import { h, kpi, table, tag, type SafeHtml } from "../../../shared/dashboard/html.ts";
import type { AdminContext, AdminRoute } from "../../../shared/engine/types.ts";
import { html, redirect, type Reply } from "../../../shared/utils/http.ts";
import { formatBRL, normalizeBrPhone } from "../../../shared/utils/text.ts";
import { addDays, localDate, localDateTimeLabel, localTime, zonedToUtc, parseHHMM } from "../../../shared/utils/time.ts";
import { notifyWaitlist } from "./flow.ts";
import type { AgendaSettings } from "./settings.ts";
import { AgendaStore, type Appointment } from "./store.ts";

type Ctx = AdminContext<AgendaSettings>;
type Row = Appointment & { nome: string | null; wa_id: string };

const STATUS_KIND = { agendado: "warn", confirmado: "ok", concluido: "ok", cancelado: "bad", faltou: "bad" } as const;

function dayRows(ctx: Ctx, day: string): Row[] {
  const [y, m, d] = day.split("-").map(Number);
  const from = zonedToUtc(y, m, d, 0, 0, ctx.tenant.timezone).toISOString();
  const to = zonedToUtc(y, m, d + 1, 0, 0, ctx.tenant.timezone).toISOString();
  return ctx.env.db.all<Row>(
    `SELECT a.*, c.nome, c.wa_id FROM appointments a JOIN contacts c ON c.id = a.contact_id
     WHERE a.tenant_id = ? AND a.starts_at >= ? AND a.starts_at < ? ORDER BY a.starts_at`, ctx.tenant.id, from, to);
}

function agendaTable(ctx: Ctx, rows: Row[], day: string): SafeHtml {
  return table(["Hora", "Cliente", "Serviço", "Profissional", "Situação", "Ações"], rows.map((a) => [
    h`${localTime(new Date(a.starts_at), ctx.tenant.timezone)}`,
    h`${a.nome ?? "(sem nome)"}<div class="muted">${a.wa_id.slice(0, 4)}…${a.wa_id.slice(-4)}</div>`,
    h`${a.service_name}<div class="muted">${formatBRL(a.price_cents)}</div>`,
    h`${a.professional_name}`,
    tag(a.status, STATUS_KIND[a.status]),
    a.status === "agendado" || a.status === "confirmado"
      ? h`<form method="post" action="/admin/agenda/${a.id}/status" class="row"><input type="hidden" name="dia" value="${day}">
<button name="status" value="concluido" type="submit">Compareceu</button>
<button name="status" value="faltou" class="sec" type="submit">Faltou</button>
<button name="status" value="cancelado" class="bad" type="submit">Cancelar</button></form>`
      : h``,
  ]), "Nenhum agendamento neste dia.");
}

export const adminRoutes: AdminRoute<AgendaSettings>[] = [
  {
    method: "GET", path: "/agenda",
    handler(ctx, req) {
      const today = localDate(ctx.now, ctx.tenant.timezone);
      const day = /^\d{4}-\d{2}-\d{2}$/.test(req.query.get("dia") ?? "") ? req.query.get("dia")! : today;
      const msg = req.query.get("msg");
      return ctx.page("Agenda", h`<h1>Agenda — ${day.split("-").reverse().join("/")}</h1>
${msg ? h`<p class="okmsg">${msg}</p>` : ""}
<div class="row" style="margin-bottom:12px"><a class="btn sec" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec" href="/admin/agenda?dia=${addDays(day, -1)}">◀ Anterior</a>
<a class="btn sec" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec" href="/admin/agenda?dia=${today}">Hoje</a>
<a class="btn sec" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec" href="/admin/agenda?dia=${addDays(day, 1)}">Próximo ▶</a>
<a class="btn" href="/admin/agenda/novo">+ Novo agendamento</a></div>
<div class="card">${agendaTable(ctx, dayRows(ctx, day), day)}</div>`);
    },
  },
  {
    method: "POST", path: "/agenda/:id/status",
    async handler(ctx, req) {
      const id = Number(req.params.id), st = req.form.status, dia = req.form.dia ?? "";
      const store = new AgendaStore(ctx.env.db);
      const a = store.get(ctx.tenant.id, id);
      if (!a) return html("Não encontrado", 404);
      if (st === "concluido" || st === "faltou") store.setStatus(ctx.tenant.id, id, st, ctx.now);
      else if (st === "cancelado") {
        store.cancel(ctx.tenant.id, id, "cancelado pela empresa", ctx.now);
        await notifyWaitlist(ctx.env, ctx.tenant, ctx.settings, ctx.now, id);
      }
      return redirect(`/admin/agenda?dia=${/^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : localDate(new Date(a.starts_at), ctx.tenant.timezone)}`);
    },
  },
  {
    method: "GET", path: "/agenda/novo",
    handler(ctx, req) {
      const s = ctx.settings;
      const erro = req.query.get("erro");
      return ctx.page("Novo agendamento", h`<h1>Novo agendamento</h1>${erro ? h`<p class="err" role="alert">${erro}</p>` : ""}
<div class="card"><form method="post" action="/admin/agenda/novo">
<p><label>Telefone do cliente (com DDD)<br><input name="telefone" required placeholder="(11) 98765-4321"></label></p>
<p><label>Nome<br><input name="nome" required maxlength="80"></label></p>
<p><label>Serviço<br><select name="servico">${s.servicos.map((x) => h`<option value="${x.id}">${x.nome} (${x.duracao_min} min)</option>`)}</select></label></p>
<p><label>Profissional<br><select name="prof">${s.profissionais.map((p) => h`<option value="${p.id}">${p.nome}</option>`)}</select></label></p>
<p class="row"><label>Data<br><input type="date" name="data" required></label> <label>Hora<br><input type="time" name="hora" required></label></p>
<p><label><input type="checkbox" name="lembretes" value="1"> O cliente autorizou receber lembretes pelo WhatsApp</label></p>
<button type="submit">Salvar agendamento</button></form></div>`);
    },
  },
  {
    method: "POST", path: "/agenda/novo",
    handler(ctx, req) {
      const f = req.form, s = ctx.settings;
      const back = (e: string): Reply => redirect(`/admin/agenda/novo?erro=${encodeURIComponent(e)}`);
      const phone = normalizeBrPhone(f.telefone ?? "");
      if (!phone) return back("Telefone inválido. Use DDD + número.");
      const svc = s.servicos.find((x) => x.id === f.servico);
      const prof = s.profissionais.find((x) => x.id === f.prof);
      if (!svc || !prof) return back("Serviço ou profissional inválido.");
      if (svc.profissionais && !svc.profissionais.includes(prof.id)) return back("Este profissional não realiza esse serviço.");
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f.data ?? ""), hm = parseHHMM(f.hora ?? "");
      if (!m || hm === null) return back("Data ou hora inválida.");
      const start = zonedToUtc(Number(m[1]), Number(m[2]), Number(m[3]), Math.floor(hm / 60), hm % 60, ctx.tenant.timezone);
      if (start <= ctx.now) return back("Escolha uma data/hora futura.");
      const contact = ctx.env.repo.upsertContact(ctx.tenant.id, phone, (f.nome ?? "").trim().slice(0, 80) || undefined, ctx.now, "cadastro_manual");
      // Sem autorização registrada, o cliente fica sem lembretes proativos (LGPD / regras do WhatsApp).
      if (f.lembretes !== "1") ctx.env.repo.setOptOut(contact.id, true, ctx.now);
      const appt = new AgendaStore(ctx.env.db).book({ tenantId: ctx.tenant.id, contactId: contact.id, service: svc, professionalId: prof.id, professionalName: prof.nome, start, source: "painel" }, s, ctx.now);
      if (!appt) return back("Esse profissional já tem um agendamento nesse horário.");
      return redirect(`/admin/agenda?dia=${f.data}&msg=${encodeURIComponent("Agendamento criado.")}`);
    },
  },
  {
    method: "GET", path: "/espera",
    handler(ctx) {
      const rows = ctx.env.db.all<{ id: number; nome: string | null; wa_id: string; service_id: string; day: string; status: string; created_at: string }>(
        `SELECT w.id, c.nome, c.wa_id, w.service_id, w.day, w.status, w.created_at FROM waitlist w JOIN contacts c ON c.id = w.contact_id
         WHERE w.tenant_id = ? ORDER BY w.day, w.created_at LIMIT 200`, ctx.tenant.id);
      return ctx.page("Lista de espera", h`<h1>Lista de espera</h1><div class="card">${table(["Cliente", "Serviço", "Dia", "Situação", "Desde"], rows.map((r) => [
        h`${r.nome ?? "(sem nome)"}<div class="muted">${r.wa_id.slice(0, 4)}…${r.wa_id.slice(-4)}</div>`,
        h`${ctx.settings.servicos.find((x) => x.id === r.service_id)?.nome ?? r.service_id}`,
        h`${r.day.split("-").reverse().join("/")}`, tag(r.status, r.status === "atendido" ? "ok" : r.status === "avisado" ? "warn" : ""),
        h`${localDateTimeLabel(new Date(r.created_at), ctx.tenant.timezone)}`,
      ]), "Ninguém na lista de espera.")}</div>`);
    },
  },
];

export function home(ctx: Ctx): SafeHtml {
  const { env, tenant, now } = ctx;
  const tz = tenant.timezone;
  const today = localDate(now, tz);
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const q = <T,>(sql: string, ...p: unknown[]) => env.db.get<T>(sql, ...p)!;
  const [y, m, d] = today.split("-").map(Number);
  const t0 = zonedToUtc(y, m, d, 0, 0, tz).toISOString(), t1 = zonedToUtc(y, m, d + 1, 0, 0, tz).toISOString(), t7 = zonedToUtc(y, m, d + 7, 0, 0, tz).toISOString();

  const hoje = q<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status IN ('agendado','confirmado','concluido')", tenant.id, t0, t1).n;
  const prox7 = q<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status IN ('agendado','confirmado')", tenant.id, t1, t7).n;
  const concl = q<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status = 'concluido'", tenant.id, since, now.toISOString()).n;
  const faltas = q<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status = 'faltou'", tenant.id, since, now.toISOString()).n;
  const receita = q<{ s: number | null }>("SELECT SUM(price_cents) s FROM appointments WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status = 'concluido'", tenant.id, since, now.toISOString()).s ?? 0;
  const semConf = q<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND status = 'agendado' AND starts_at > ? AND starts_at < ?", tenant.id, now.toISOString(), new Date(now.getTime() + 48 * 3_600_000).toISOString()).n;
  const recup = env.repo.countEvents(tenant.id, "espera_atendida", since);
  const novos = env.repo.countEvents(tenant.id, "agendou", since);
  const humano = q<{ n: number }>("SELECT COUNT(*) n FROM conversations WHERE tenant_id = ? AND mode = 'human'", tenant.id).n;
  const taxa = concl + faltas > 0 ? `${Math.round((concl / (concl + faltas)) * 100)}%` : "—";

  return h`<h1>Resumo</h1>
<div class="grid">${kpi(hoje, "agendamentos hoje")}${kpi(prox7, "próximos 7 dias")}${kpi(semConf, "sem confirmar (48h)")}${kpi(humano, "conversas esperando atendente")}</div>
<h2>Últimos 30 dias</h2>
<div class="grid">${kpi(novos, "agendamentos feitos pelo robô")}${kpi(taxa, "comparecimento (marcados no painel)")}${kpi(faltas, "faltas registradas")}${kpi(formatBRL(receita), "valor dos atendimentos concluídos")}${kpi(recup, "vagas reocupadas pela lista de espera")}</div>
<p class="muted">Os números de comparecimento dependem de você marcar “Compareceu” ou “Faltou” na Agenda. Sem essa marcação, eles ficam em branco.</p>
<h2>Hoje</h2><div class="card">${agendaTable(ctx, dayRows(ctx, today), today)}</div>`;
}
