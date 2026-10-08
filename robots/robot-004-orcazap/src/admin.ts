import { h, kpi, table, tag, type SafeHtml } from "../../../shared/dashboard/html.ts";
import type { AdminContext, AdminRoute } from "../../../shared/engine/types.ts";
import { lerImagem } from "../../../shared/media/store.ts";
import { html, redirect } from "../../../shared/utils/http.ts";
import { formatBRL, parseBRLToCents } from "../../../shared/utils/text.ts";
import { localDateTimeLabel } from "../../../shared/utils/time.ts";
import { dataBr, enviarPropostaAoCliente } from "./notify.ts";
import type { OrcaSettings } from "./settings.ts";
import { OrcaStore, type Quote, type QuoteStatus } from "./store.ts";

type Ctx = AdminContext<OrcaSettings>;

const ROTULO: Record<QuoteStatus, string> = { novo: "Novo", em_analise: "Em análise", enviado: "Aguardando resposta", aceito: "Aceito", recusado: "Recusado", expirado: "Vencido", cancelado: "Cancelado" };
const COR: Record<QuoteStatus, "ok" | "warn" | "bad" | ""> = { novo: "warn", em_analise: "warn", enviado: "", aceito: "ok", recusado: "bad", expirado: "bad", cancelado: "bad" };
const PERIODO = { manha: "manhã", tarde: "tarde", qualquer: "tanto faz" } as const;

function card(ctx: Ctx, q: Quote): SafeHtml {
  const fotos = new OrcaStore(ctx.env.db).fotos(q.id).length;
  const horas = Math.max(0, Math.round((ctx.now.getTime() - new Date(q.created_at).getTime()) / 3_600_000));
  return h`<div class="card" style="padding:10px"><b><a href="/admin/orcamentos/${q.id}">#${q.numero}</a></b> · ${q.servico_nome}
<div class="muted">${q.nome} · ${q.bairro} · ${fotos} foto(s) · há ${horas} h</div>
${q.valor_cents ? h`<div><b>${formatBRL(q.valor_cents)}</b></div>` : ""}</div>`;
}

export const adminRoutes: AdminRoute<OrcaSettings>[] = [
  {
    method: "GET", path: "/orcamentos",
    handler(ctx) {
      const abertos = ctx.env.db.all<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND status IN ('novo','em_analise','enviado') ORDER BY created_at LIMIT 300", ctx.tenant.id);
      const aceitos = ctx.env.db.all<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND status = 'aceito' AND updated_at >= ? ORDER BY updated_at DESC LIMIT 50", ctx.tenant.id, new Date(ctx.now.getTime() - 14 * 86_400_000).toISOString());
      const cols: [string, Quote[]][] = [["Novos", abertos.filter((q) => q.status === "novo")], ["Em análise", abertos.filter((q) => q.status === "em_analise")], ["Aguardando resposta do cliente", abertos.filter((q) => q.status === "enviado")], ["Aceitos (14 dias)", aceitos]];
      return ctx.page("Orçamentos", h`<h1>Orçamentos</h1>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));align-items:start">${cols.map(([t, l]) => h`<div><h2 style="margin-top:0">${t} <span class="tag">${l.length}</span></h2>${l.map((q) => card(ctx, q))}</div>`)}</div>
<p class="muted">Abra o pedido, veja as fotos e informe o valor: o cliente recebe a proposta no WhatsApp com os botões Aceitar, Recusar e Tenho dúvida.</p>`);
    },
  },
  {
    method: "GET", path: "/orcamentos/foto/:arquivo",
    handler(ctx, req) {
      const reg = new OrcaStore(ctx.env.db).fotoDoTenant(ctx.tenant.id, req.params.arquivo);
      const img = reg ? lerImagem(ctx.env.config.mediaDir, reg.arquivo) : null;
      if (!img) return html("Não encontrado", 404);
      return { status: 200, bytes: img.data, type: img.mime, headers: { "Cache-Control": "private, max-age=300" } };
    },
  },
  {
    method: "GET", path: "/orcamentos/:id",
    handler(ctx, req) {
      const st = new OrcaStore(ctx.env.db);
      const q = st.get(ctx.tenant.id, Number(req.params.id));
      if (!q) return html("Não encontrado", 404);
      const fotos = st.fotos(q.id);
      const c = ctx.env.repo.contact(ctx.tenant.id, q.contact_id);
      const msg = req.query.get("msg"), erro = req.query.get("erro");
      const editavel = q.status === "novo" || q.status === "em_analise" || q.status === "enviado";
      const s = ctx.settings.atendimento;
      return ctx.page(`Orçamento #${q.numero}`, h`<h1>Orçamento #${q.numero} — ${q.servico_nome} ${tag(ROTULO[q.status], COR[q.status])}</h1>
${msg ? h`<p class="okmsg">${msg}</p>` : ""}${erro ? h`<p class="errmsg">${erro}</p>` : ""}
<div class="card"><p><b>${q.nome}</b>${c ? h` · WhatsApp ${c.wa_id}` : ""}<br>${q.endereco ? h`${q.endereco} — ` : ""}${q.bairro}<br>Visita preferida: ${PERIODO[q.periodo]} · pedido em ${localDateTimeLabel(new Date(q.created_at), ctx.tenant.timezone)}</p>
<p><b>O que o cliente precisa:</b><br>${q.descricao}</p>
<div class="row">${fotos.length ? fotos.map((f) => h`<a href="/admin/orcamentos/foto/${f.arquivo}" target="_blank"><img src="/admin/orcamentos/foto/${f.arquivo}" alt="foto do local" style="max-width:200px;max-height:160px;border-radius:8px;margin:4px"></a>`) : h`<span class="muted">O cliente não enviou fotos.</span>`}</div>
${q.recusa_motivo ? h`<p><b>Motivo da recusa:</b> ${q.recusa_motivo}</p>` : ""}</div>
${q.status === "enviado" || q.status === "aceito" ? h`<div class="card"><b>Proposta enviada:</b> ${formatBRL(q.valor_cents ?? 0)} · prazo: ${q.prazo_texto ?? "—"}${q.validade_ate ? h` · válida até ${dataBr(q.validade_ate, ctx.tenant.timezone)}` : ""}</div>` : ""}
${editavel ? h`<div class="card"><h2 style="margin-top:0">${q.status === "enviado" ? "Reenviar proposta revisada" : "Enviar proposta"}</h2>
<form method="post" action="/admin/orcamentos/${q.id}/proposta">
<p><label>Valor (R$)<br><input name="valor" required inputmode="decimal" placeholder="Ex.: 1.250,00" value="${q.valor_cents ? (q.valor_cents / 100).toFixed(2).replace(".", ",") : ""}"></label></p>
<p><label>Prazo / condições<br><input name="prazo" maxlength="120" placeholder="Ex.: 3 dias úteis; 50% na entrada" value="${q.prazo_texto ?? ""}"></label></p>
<p><label>Observação para o cliente (opcional)<br><textarea name="obs" maxlength="300" style="min-height:70px">${q.obs_proposta ?? ""}</textarea></label></p>
<p class="muted">Validade: ${s.validade_dias} dias · lembrete automático após ${s.followup_horas} h sem resposta (1 vez).</p>
<button type="submit">Enviar ao cliente</button></form></div>
<form method="post" action="/admin/orcamentos/${q.id}/acao" class="row">${q.status === "novo" ? h`<button name="acao" value="em_analise" class="sec" type="submit">Marcar em análise</button>` : ""}<button name="acao" value="cancelado" class="bad" type="submit">Cancelar pedido</button></form>` : ""}
<p><a class="btn sec" href="/admin/orcamentos" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec">Voltar</a>${c ? h` <a class="btn sec" href="/admin/conversas/${c.id}" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec">Abrir conversa</a>` : ""}</p>`);
    },
  },
  {
    method: "POST", path: "/orcamentos/:id/proposta",
    async handler(ctx, req) {
      const st = new OrcaStore(ctx.env.db);
      const q = st.get(ctx.tenant.id, Number(req.params.id));
      if (!q) return html("Não encontrado", 404);
      const volta = (k: "msg" | "erro", t: string) => redirect(`/admin/orcamentos/${q.id}?${k}=${encodeURIComponent(t)}`);
      if (!["novo", "em_analise", "enviado"].includes(q.status)) return volta("erro", "Este orçamento já foi encerrado.");
      const valor = parseBRLToCents(req.form.valor ?? "");
      if (!valor || valor < 100 || valor > 100_000_000) return volta("erro", "Informe um valor válido (ex.: 1.250,00).");
      const prazo = (req.form.prazo ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, 120);
      const obs = (req.form.obs ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      const a = ctx.settings.atendimento;
      const validade = new Date(ctx.now.getTime() + a.validade_dias * 86_400_000).toISOString();
      const previa: Quote = { ...q, valor_cents: valor, prazo_texto: prazo || null, obs_proposta: obs || null, validade_ate: validade };
      const r = await enviarPropostaAoCliente(ctx.env, ctx.tenant, ctx.settings, previa, ctx.now);
      if (r === "skipped_no_template") return volta("erro", "Não enviado: o cliente não fala com a empresa há mais de 24 h e não há modelo aprovado cadastrado (template.nome). Peça para ele escrever ou cadastre o modelo.");
      if (r === "skipped_optout") return volta("erro", "Não enviado: o cliente pediu para não receber mensagens automáticas.");
      if (r === "failed" || r === "ignorado") return volta("erro", "Não foi possível enviar agora. Tente novamente em instantes.");
      st.enviarProposta(ctx.tenant.id, q.id, { valorCents: valor, prazoTexto: prazo, obs: obs || null, validadeDias: a.validade_dias, followupHoras: a.followup_horas }, ctx.now);
      ctx.env.repo.event(ctx.tenant.id, "orcamento_enviado", { id: q.id, valor }, ctx.now);
      return volta("msg", "Proposta enviada ao cliente.");
    },
  },
  {
    method: "POST", path: "/orcamentos/:id/acao",
    handler(ctx, req) {
      const st = new OrcaStore(ctx.env.db);
      const q = st.get(ctx.tenant.id, Number(req.params.id));
      if (!q) return html("Não encontrado", 404);
      const acao = req.form.acao;
      if (acao === "em_analise" && q.status === "novo") st.setStatus(ctx.tenant.id, q.id, "em_analise", ctx.now);
      else if (acao === "cancelado" && ["novo", "em_analise", "enviado"].includes(q.status)) st.setStatus(ctx.tenant.id, q.id, "cancelado", ctx.now);
      return redirect(acao === "cancelado" ? "/admin/orcamentos" : `/admin/orcamentos/${q.id}`);
    },
  },
  {
    method: "GET", path: "/historico",
    handler(ctx) {
      const rows = ctx.env.db.all<Quote>("SELECT * FROM quotes WHERE tenant_id = ? ORDER BY id DESC LIMIT 100", ctx.tenant.id);
      return ctx.page("Histórico", h`<h1>Histórico de orçamentos</h1><div class="card">${table(["Nº", "Quando", "Cliente", "Serviço", "Valor", "Situação"], rows.map((q) => [
        h`<a href="/admin/orcamentos/${q.id}">#${q.numero}</a>`, h`${localDateTimeLabel(new Date(q.created_at), ctx.tenant.timezone)}`, h`${q.nome}`, h`${q.servico_nome}`, h`${q.valor_cents ? formatBRL(q.valor_cents) : "—"}`, tag(ROTULO[q.status], COR[q.status]),
      ]), "Nenhum orçamento ainda.")}</div>`);
    },
  },
];

export function home(ctx: Ctx): SafeHtml {
  const { env, tenant, now } = ctx;
  const trinta = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const q = <T,>(sql: string, ...p: unknown[]) => env.db.get<T>(sql, tenant.id, ...p)!;
  const novos = q<{ n: number }>("SELECT COUNT(*) n FROM quotes WHERE tenant_id = ? AND status = 'novo'");
  const aguardando = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(valor_cents) s FROM quotes WHERE tenant_id = ? AND status = 'enviado'");
  const aceitos = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(valor_cents) s FROM quotes WHERE tenant_id = ? AND status = 'aceito' AND updated_at >= ?", trinta);
  const decididos = q<{ n: number }>("SELECT COUNT(*) n FROM quotes WHERE tenant_id = ? AND status IN ('aceito','recusado','expirado') AND updated_at >= ?", trinta);
  const tempo = q<{ m: number | null }>("SELECT AVG((julianday(enviado_em) - julianday(created_at)) * 24) m FROM quotes WHERE tenant_id = ? AND enviado_em IS NOT NULL AND created_at >= ?", trinta);
  const motivos = env.db.all<{ recusa_motivo: string }>("SELECT recusa_motivo FROM quotes WHERE tenant_id = ? AND recusa_motivo IS NOT NULL AND updated_at >= ? ORDER BY updated_at DESC LIMIT 5", tenant.id, trinta);
  const taxa = decididos.n ? `${Math.round((aceitos.n / decididos.n) * 100)}%` : "—";
  return h`<h1>Resumo (últimos 30 dias)</h1>
<div class="grid">${kpi(novos.n, "novos esperando análise")}${kpi(aguardando.n, "propostas aguardando resposta")}${kpi(formatBRL(aguardando.s ?? 0), "valor em propostas abertas")}${kpi(aceitos.n, "orçamentos aceitos")}${kpi(formatBRL(aceitos.s ?? 0), "valor aceito")}${kpi(taxa, "taxa de aceite")}${kpi(tempo.m ? `${tempo.m < 1 ? "<1" : Math.round(tempo.m)} h` : "—", "tempo até enviar a proposta")}</div>
<h2>Últimos motivos de recusa</h2><div class="card">${table(["Motivo (dito pelo cliente)"], motivos.map((m) => [h`${m.recusa_motivo}`]), "Nenhum motivo registrado.")}</div>
<p class="muted">Taxa de aceite = aceitos ÷ (aceitos + recusados + vencidos) no período. Valores consideram apenas o que a equipe informou nas propostas.</p>`;
}
