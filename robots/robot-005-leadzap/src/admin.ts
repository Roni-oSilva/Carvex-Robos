import { h, kpi, table, tag, type SafeHtml } from "../../../shared/dashboard/html.ts";
import type { AdminContext, AdminRoute } from "../../../shared/engine/types.ts";
import { html, redirect } from "../../../shared/utils/http.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { localDate, localDateTimeLabel, zonedToUtc } from "../../../shared/utils/time.ts";
import { cents, validateSettings, type LeadSettings } from "./settings.ts";
import { LeadStore, type Lead, type LeadStatus, type Temperatura, type Visit, type VisitStatus } from "./store.ts";

type Ctx = AdminContext<LeadSettings>;

const STATUS: Record<LeadStatus, string> = { novo: "Novo", em_contato: "Em contato", visita: "Visita marcada", ganho: "Fechado", perdido: "Perdido", sem_resposta: "Sem resposta" };
const COR_TEMP: Record<Temperatura, "ok" | "warn" | "bad"> = { quente: "bad", morno: "warn", frio: "ok" };
const VSTATUS: Record<VisitStatus, string> = { agendada: "Agendada", confirmada: "Confirmada", realizada: "Realizada", faltou: "Cliente faltou", cancelada: "Cancelada" };
const ABERTO = "('novo','em_contato','visita')";

const nomeCorretor = (s: LeadSettings, id: string | null): string => (id ? s.corretores.find((c) => c.id === id)?.nome ?? id : "sem corretor");

function linha(ctx: Ctx, l: Lead): SafeHtml[] {
  return [
    h`<a href="/admin/leads/${l.id}">#${l.numero}</a>`, h`${l.nome}`, tag(l.temperatura, COR_TEMP[l.temperatura]),
    h`${l.finalidade === "alugar" ? "Alugar" : "Comprar"} · ${l.tipo_nome} · ${l.bairro}`, h`${l.faixa_nome}`, h`${nomeCorretor(ctx.settings, l.corretor_id)}`, tag(STATUS[l.status], l.status === "ganho" ? "ok" : l.status === "perdido" || l.status === "sem_resposta" ? "bad" : ""),
  ];
}

export const adminRoutes: AdminRoute<LeadSettings>[] = [
  {
    method: "GET", path: "/leads",
    handler(ctx, req) {
      const filtro = req.query.get("corretor") ?? "";
      const rows = ctx.env.db.all<Lead>(
        `SELECT * FROM leads WHERE tenant_id = ? AND status IN ${ABERTO} ${filtro ? "AND COALESCE(corretor_id,'') = ?" : ""}
         ORDER BY CASE temperatura WHEN 'quente' THEN 0 WHEN 'morno' THEN 1 ELSE 2 END, created_at LIMIT 300`, ...(filtro ? [ctx.tenant.id, filtro === "-" ? "" : filtro] : [ctx.tenant.id]));
      return ctx.page("Leads", h`<h1>Leads em aberto</h1>
<p class="row"><a class="btn sec" href="/admin/leads">Todos</a>${ctx.settings.corretores.map((c) => h`<a class="btn sec" href="/admin/leads?corretor=${c.id}">${c.nome}</a>`)}<a class="btn sec" href="/admin/leads?corretor=-">Sem corretor</a></p>
<div class="card">${table(["Nº", "Nome", "Temperatura", "Procura", "Faixa", "Corretor", "Situação"], rows.map((l) => linha(ctx, l)), "Nenhum lead em aberto.")}</div>
<p class="muted">Quentes primeiro. A temperatura é calculada por regras fixas (prazo, imóvel compatível, interesse e visita) — veja docs/FLUXOS.md.</p>`);
    },
  },
  {
    method: "GET", path: "/leads/:id",
    handler(ctx, req) {
      const st = new LeadStore(ctx.env.db);
      const l = st.get(ctx.tenant.id, Number(req.params.id));
      if (!l) return html("Não encontrado", 404);
      const c = ctx.env.repo.contact(ctx.tenant.id, l.contact_id);
      const visitas = ctx.env.db.all<Visit>("SELECT * FROM visits WHERE lead_id = ? ORDER BY starts_at DESC", l.id);
      const im = l.imovel_interesse ? ctx.settings.imoveis.find((i) => i.id === l.imovel_interesse) : undefined;
      const aberto = ["novo", "em_contato", "visita", "sem_resposta"].includes(l.status);
      return ctx.page(`Lead #${l.numero}`, h`<h1>Lead #${l.numero} — ${l.nome} ${tag(l.temperatura, COR_TEMP[l.temperatura])} ${tag(STATUS[l.status])}</h1>
<div class="card"><p>${l.finalidade === "alugar" ? "Quer alugar" : "Quer comprar"} <b>${l.tipo_nome}</b> em <b>${l.bairro}</b><br>Faixa: ${l.faixa_nome} (${formatBRL(l.faixa_min_cents)} a ${formatBRL(l.faixa_max_cents)}) · quartos: ${l.quartos ? `${l.quartos}+` : "tanto faz"}<br>Prazo: ${l.prazo === "urgente" ? "até 30 dias" : l.prazo === "curto" ? "1 a 3 meses" : "só pesquisando"} · pontos: ${l.pontos}<br>
Corretor: <b>${nomeCorretor(ctx.settings, l.corretor_id)}</b>${im ? h`<br>Imóvel de interesse: <b>${im.titulo}</b>` : ""}${l.perdido_motivo ? h`<br>Motivo da perda: ${l.perdido_motivo}` : ""}</p>
<p>${c ? h`WhatsApp: <a href="https://wa.me/${c.wa_id}" target="_blank" rel="noopener">${c.wa_id}</a> · <a href="/admin/conversas/${c.id}">abrir conversa</a>` : ""} · Último contato do cliente: ${localDateTimeLabel(new Date(l.ultimo_cliente_em), ctx.tenant.timezone)}</p></div>
${visitas.length ? h`<div class="card"><h2 style="margin-top:0">Visitas</h2>${table(["Imóvel", "Quando", "Situação"], visitas.map((v) => [h`${v.imovel_titulo}`, h`${localDateTimeLabel(new Date(v.starts_at), ctx.tenant.timezone)}`, tag(VSTATUS[v.status])]))}</div>` : ""}
${aberto ? h`<div class="card"><form method="post" action="/admin/leads/${l.id}/acao" class="row">
<select name="corretor"><option value="">— sem corretor —</option>${ctx.settings.corretores.map((c) => h`<option value="${c.id}" ${c.id === l.corretor_id ? "selected" : ""}>${c.nome}</option>`)}</select>
<button name="acao" value="atribuir" class="sec" type="submit">Atribuir corretor</button>
<button name="acao" value="em_contato" class="sec" type="submit">Marcar em contato</button>
<button name="acao" value="ganho" type="submit">Fechou negócio</button></form>
<form method="post" action="/admin/leads/${l.id}/acao" class="row" style="margin-top:8px"><input name="motivo" maxlength="120" placeholder="Motivo (ex.: comprou com outra imobiliária)" required><button name="acao" value="perdido" class="bad" type="submit">Marcar como perdido</button></form></div>` : ""}
<p><a class="btn sec" href="/admin/leads" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec">Voltar</a></p>`);
    },
  },
  {
    method: "POST", path: "/leads/:id/acao",
    handler(ctx, req) {
      const st = new LeadStore(ctx.env.db);
      const l = st.get(ctx.tenant.id, Number(req.params.id));
      if (!l) return html("Não encontrado", 404);
      const acao = req.form.acao;
      if (acao === "atribuir") {
        const id = req.form.corretor ?? "";
        if (id === "" || ctx.settings.corretores.some((c) => c.id === id)) ctx.env.db.run("UPDATE leads SET corretor_id = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", id || null, ctx.now.toISOString(), ctx.tenant.id, l.id);
      } else if (acao === "em_contato" && l.status !== "ganho" && l.status !== "perdido") st.setStatus(ctx.tenant.id, l.id, "em_contato", ctx.now);
      else if (acao === "ganho") st.setStatus(ctx.tenant.id, l.id, "ganho", ctx.now);
      else if (acao === "perdido") st.setStatus(ctx.tenant.id, l.id, "perdido", ctx.now, (req.form.motivo ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, 120) || "sem motivo informado");
      return redirect(`/admin/leads/${l.id}`);
    },
  },
  {
    method: "GET", path: "/visitas",
    handler(ctx) {
      const desde = new Date(ctx.now.getTime() - 24 * 3_600_000).toISOString();
      const vs = ctx.env.db.all<Visit & { nome: string; corretor_id: string | null }>(
        `SELECT v.*, l.nome, l.corretor_id FROM visits v JOIN leads l ON l.id = v.lead_id WHERE v.tenant_id = ? AND v.starts_at >= ? AND v.status != 'cancelada' ORDER BY v.starts_at LIMIT 200`, ctx.tenant.id, desde);
      return ctx.page("Visitas", h`<h1>Visitas</h1><div class="card">${table(["Quando", "Cliente", "Imóvel", "Corretor", "Situação", ""], vs.map((v) => [
        h`${localDateTimeLabel(new Date(v.starts_at), ctx.tenant.timezone)}`, h`<a href="/admin/leads/${v.lead_id}">${v.nome}</a>`, h`${v.imovel_titulo}`, h`${nomeCorretor(ctx.settings, v.corretor_id)}`, tag(VSTATUS[v.status], v.status === "confirmada" ? "ok" : v.status === "faltou" ? "bad" : "warn"),
        h`<form method="post" action="/admin/visitas/${v.id}/acao" class="row"><button name="acao" value="realizada" class="sec" type="submit">Realizada</button><button name="acao" value="faltou" class="sec" type="submit">Faltou</button><button name="acao" value="cancelada" class="bad" type="submit">Cancelar</button></form>`,
      ]), "Nenhuma visita marcada.")}</div><p class="muted">Marque o resultado depois da visita: isso alimenta a taxa de comparecimento no Início.</p>`);
    },
  },
  {
    method: "POST", path: "/visitas/:id/acao",
    handler(ctx, req) {
      const st = new LeadStore(ctx.env.db);
      const v = st.visita(ctx.tenant.id, Number(req.params.id));
      if (!v) return html("Não encontrado", 404);
      const a = req.form.acao as VisitStatus;
      if (["realizada", "faltou", "cancelada"].includes(a)) st.setVisita(ctx.tenant.id, v.id, a, ctx.now);
      return redirect("/admin/visitas");
    },
  },
  {
    method: "GET", path: "/imoveis",
    handler(ctx, req) {
      const msg = req.query.get("msg");
      return ctx.page("Imóveis", h`<h1>Imóveis cadastrados</h1>${msg ? h`<p class="okmsg">${msg}</p>` : ""}<p class="muted">Marque como indisponível o que foi vendido/alugado: o robô para de oferecer na hora. Para cadastrar ou mudar valores, use “Configurações”.</p>
<div class="card">${table(["Imóvel", "Finalidade", "Bairro", "Valor", "Situação"], ctx.settings.imoveis.map((i) => [
        h`${i.titulo}`, h`${i.finalidade === "alugar" ? "Aluguel" : "Venda"}`, h`${i.bairro}`, h`${formatBRL(cents(i.preco))}`,
        h`<form method="post" action="/admin/imoveis/alternar" class="row"><input type="hidden" name="imovel" value="${i.id}">${i.disponivel ? tag("disponível", "ok") : tag("indisponível", "bad")}<button class="sec" type="submit">${i.disponivel ? "Marcar indisponível" : "Voltar a oferecer"}</button></form>`,
      ]), "Nenhum imóvel cadastrado ainda.")}</div>`);
    },
  },
  {
    method: "POST", path: "/imoveis/alternar",
    handler(ctx, req) {
      const s = structuredClone(ctx.settings);
      for (const i of s.imoveis) if (i.id === req.form.imovel) i.disponivel = !i.disponivel;
      const v = validateSettings(s);
      if (!v.ok) return redirect(`/admin/imoveis?msg=${encodeURIComponent("Erro: " + v.error)}`);
      ctx.env.repo.updateTenantSettings(ctx.tenant.id, v.value);
      return redirect("/admin/imoveis");
    },
  },
];

export function home(ctx: Ctx): SafeHtml {
  const { env, tenant, now } = ctx;
  const tz = tenant.timezone;
  const [y, m, d] = localDate(now, tz).split("-").map(Number);
  const t0 = zonedToUtc(y, m, d, 0, 0, tz).toISOString();
  const t1 = new Date(new Date(t0).getTime() + 86_400_000).toISOString();
  const trinta = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const q = <T,>(sql: string, ...p: unknown[]) => env.db.get<T>(sql, tenant.id, ...p)!;
  const hoje = q<{ n: number }>("SELECT COUNT(*) n FROM leads WHERE tenant_id = ? AND created_at >= ?", t0);
  const quentes = q<{ n: number }>("SELECT COUNT(*) n FROM leads WHERE tenant_id = ? AND temperatura = 'quente' AND status IN ('novo','em_contato')");
  const novos = q<{ n: number }>("SELECT COUNT(*) n FROM leads WHERE tenant_id = ? AND status = 'novo'");
  const vhoje = q<{ n: number }>("SELECT COUNT(*) n FROM visits WHERE tenant_id = ? AND starts_at >= ? AND starts_at < ? AND status IN ('agendada','confirmada','realizada')", t0, t1);
  const feitas = q<{ r: number; f: number }>("SELECT SUM(status = 'realizada') r, SUM(status = 'faltou') f FROM visits WHERE tenant_id = ? AND starts_at >= ?", trinta);
  const ganhos = q<{ n: number }>("SELECT COUNT(*) n FROM leads WHERE tenant_id = ? AND status = 'ganho' AND updated_at >= ?", trinta);
  const semResp = q<{ n: number }>("SELECT COUNT(*) n FROM leads WHERE tenant_id = ? AND status = 'sem_resposta'");
  const perdas = env.db.all<{ perdido_motivo: string; n: number }>("SELECT perdido_motivo, COUNT(*) n FROM leads WHERE tenant_id = ? AND status = 'perdido' AND updated_at >= ? GROUP BY perdido_motivo ORDER BY n DESC LIMIT 5", tenant.id, trinta);
  const comp = (feitas.r ?? 0) + (feitas.f ?? 0) ? `${Math.round(((feitas.r ?? 0) / ((feitas.r ?? 0) + (feitas.f ?? 0))) * 100)}%` : "—";
  return h`<h1>Resumo</h1>
<div class="grid">${kpi(hoje.n, "leads hoje")}${kpi(novos.n, "novos sem atendimento")}${kpi(quentes.n, "leads quentes em aberto")}${kpi(vhoje.n, "visitas hoje")}${kpi(comp, "comparecimento às visitas (30 dias)")}${kpi(ganhos.n, "negócios fechados (30 dias)")}${kpi(semResp.n, "sem resposta")}</div>
<h2>Motivos de perda (30 dias)</h2><div class="card">${table(["Motivo (registrado pela equipe)", "Leads"], perdas.map((p) => [h`${p.perdido_motivo}`, h`${p.n}`]), "Nenhuma perda registrada.")}</div>
<p class="muted">Comparecimento = visitas marcadas como “realizada” ÷ (realizadas + faltou). Depende de a equipe marcar o resultado de cada visita.</p>`;
}
