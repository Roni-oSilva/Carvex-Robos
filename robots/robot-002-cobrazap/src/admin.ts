import { h, kpi, table, tag, type SafeHtml } from "../../../shared/dashboard/html.ts";
import { sendProactive } from "../../../shared/engine/proactive.ts";
import type { AdminContext, AdminRoute, BotEnv } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { html, redirect } from "../../../shared/utils/http.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { addDays, localDate, localDateTimeLabel } from "../../../shared/utils/time.ts";
import { parseImport } from "./importar.ts";
import { fmtData, diasEntre } from "./mensagens.ts";
import { pixDe } from "./flow.ts";
import type { CobraSettings } from "./settings.ts";
import { CobraStore, type Acordo, type Charge, type ChargeStatus } from "./store.ts";

type Ctx = AdminContext<CobraSettings>;
type Row = Charge & { nome: string | null; wa_id: string };

const KIND: Record<ChargeStatus, "ok" | "warn" | "bad" | ""> = { aberta: "warn", em_conferencia: "warn", paga: "ok", acordo: "ok", cancelada: "" };

function listar(ctx: Ctx, where: string, ...p: unknown[]): Row[] {
  return ctx.env.db.all<Row>(
    `SELECT ch.*, c.nome, c.wa_id FROM charges ch JOIN contacts c ON c.id = ch.contact_id WHERE ch.tenant_id = ? ${where} ORDER BY ch.due_date, ch.id LIMIT 300`, ctx.tenant.id, ...p);
}

function tabela(ctx: Ctx, rows: Row[], hoje: string): SafeHtml {
  return table(["Cliente", "Descrição", "Valor", "Vencimento", "Situação", "Ações"], rows.map((c) => {
    const atraso = diasEntre(c.due_date, hoje);
    return [
      h`${c.nome ?? "(sem nome)"}<div class="muted">${c.wa_id.slice(0, 4)}…${c.wa_id.slice(-4)}</div>`,
      h`${c.description}${c.reference ? h`<div class="muted">ref. ${c.reference}</div>` : ""}`,
      h`${formatBRL(c.amount_cents)}`,
      h`${fmtData(c.due_date)}${c.status === "aberta" && atraso > 0 ? h`<div class="err">${atraso} dia(s) de atraso</div>` : ""}`,
      tag(c.status.replace("_", " "), KIND[c.status]),
      c.status === "aberta" || c.status === "em_conferencia"
        ? h`<form method="post" action="/admin/cobrancas/${c.id}/acao" class="row"><button name="acao" value="paga" type="submit">Dar baixa</button>${c.status === "aberta" ? h`<button name="acao" value="pausar" class="sec" type="submit">Pausar 7 dias</button>` : ""}<button name="acao" value="cancelada" class="bad" type="submit">Cancelar</button></form>`
        : h``,
    ];
  }), "Nenhuma cobrança aqui.");
}

/** Cria as parcelas de um acordo aceito (mensais) e encerra a cobrança original como “acordo”. */
export function aplicarAcordo(env: BotEnv, tenant: Tenant, a: Acordo, primeiroVenc: string, now: Date): number[] {
  const st = new CobraStore(env.db);
  const orig = st.charge(tenant.id, a.charge_id)!;
  const ids: number[] = [];
  env.db.tx(() => {
    st.setStatus(tenant.id, orig.id, "acordo", now);
    const [y, m, d] = primeiroVenc.split("-").map(Number);
    for (let i = 0; i < a.parcelas; i++) {
      const alvo = new Date(Date.UTC(y, m - 1 + i, 1));
      const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
      const venc = `${alvo.getUTCFullYear()}-${String(alvo.getUTCMonth() + 1).padStart(2, "0")}-${String(Math.min(d, ultimo)).padStart(2, "0")}`;
      const valor = i === a.parcelas - 1 ? a.total_cents - a.parcela_cents * (a.parcelas - 1) : a.parcela_cents; // ajusta centavos na última
      const id = st.create({ tenantId: tenant.id, contactId: orig.contact_id, reference: orig.reference ? `${orig.reference}-p${i + 1}` : null, description: a.parcelas === 1 ? `${orig.description} (acordo)` : `${orig.description} (acordo ${i + 1}/${a.parcelas})`, amountCents: valor, dueDate: venc }, now);
      if (id) ids.push(id);
    }
  });
  return ids;
}

export const adminRoutes: AdminRoute<CobraSettings>[] = [
  {
    method: "GET", path: "/cobrancas",
    handler(ctx, req) {
      const hoje = localDate(ctx.now, ctx.tenant.timezone);
      const f = req.query.get("filtro") ?? "abertas";
      const rows = f === "vencidas" ? listar(ctx, "AND ch.status = 'aberta' AND ch.due_date < ?", hoje)
        : f === "pagas" ? listar(ctx, "AND ch.status = 'paga'")
        : f === "todas" ? listar(ctx, "")
        : listar(ctx, "AND ch.status IN ('aberta','em_conferencia')");
      const link = (k: string, t: string) => h`<a class="btn ${f === k ? "" : "sec"}" style="${f === k ? "" : "background:#fff;color:#1c2430;border:1px solid #e4e7ec"}" href="/admin/cobrancas?filtro=${k}">${t}</a>`;
      const msg = req.query.get("msg");
      return ctx.page("Cobranças", h`<h1>Cobranças</h1>${msg ? h`<p class="okmsg">${msg}</p>` : ""}
<div class="row" style="margin-bottom:12px">${link("abertas", "Em aberto")}${link("vencidas", "Vencidas")}${link("pagas", "Pagas")}${link("todas", "Todas")}<a class="btn" href="/admin/cobrancas/importar">+ Importar cobranças</a></div>
<div class="card">${tabela(ctx, rows, hoje)}</div>`);
    },
  },
  {
    method: "POST", path: "/cobrancas/:id/acao",
    handler(ctx, req) {
      const st = new CobraStore(ctx.env.db);
      const c = st.charge(ctx.tenant.id, Number(req.params.id));
      if (!c) return html("Não encontrado", 404);
      const acao = req.form.acao;
      if (acao === "paga" || acao === "cancelada") st.setStatus(ctx.tenant.id, c.id, acao, ctx.now);
      else if (acao === "pausar") st.pause(ctx.tenant.id, c.id, new Date(ctx.now.getTime() + 7 * 86_400_000).toISOString(), ctx.now);
      return redirect("/admin/cobrancas");
    },
  },
  {
    method: "GET", path: "/cobrancas/importar",
    handler(ctx, req) {
      const erros = req.query.get("erros");
      const msg = req.query.get("msg");
      return ctx.page("Importar cobranças", h`<h1>Importar cobranças</h1>
${msg ? h`<p class="okmsg">${msg}</p>` : ""}${erros ? h`<div class="card err" role="alert"><b>Linhas com problema (as demais foram importadas):</b><pre style="white-space:pre-wrap">${erros}</pre></div>` : ""}
<div class="card"><p>Cole uma linha por cobrança, separando as colunas com <b>;</b> (ou copie direto de uma planilha):</p>
<p><code>nome ; telefone ; descrição ; valor ; vencimento ; referência (opcional)</code></p>
<form method="post" action="/admin/cobrancas/importar"><p><textarea name="linhas" style="min-height:180px" placeholder="Maria Souza; (11) 98765-4321; Mensalidade outubro; 150,00; 05/10/2026; MENS-1042"></textarea></p>
<p><label><input type="checkbox" name="base" value="1" required> Confirmo que estes clientes têm uma relação contratual conosco e que os telefones foram informados por eles.</label></p>
<button type="submit">Importar</button></form></div>
<div class="card"><h2 style="margin-top:0">Dar baixa em vários pagamentos</h2><p class="muted">Cole as referências (uma por linha) dos pagamentos já recebidos, por exemplo a partir do extrato.</p>
<form method="post" action="/admin/cobrancas/baixa"><p><textarea name="refs" style="min-height:90px"></textarea></p><button type="submit">Dar baixa</button></form></div>`);
    },
  },
  {
    method: "POST", path: "/cobrancas/importar",
    handler(ctx, req) {
      if (req.form.base !== "1") return redirect(`/admin/cobrancas/importar?erros=${encodeURIComponent("É preciso confirmar a relação contratual com os clientes.")}`);
      const { ok, erros } = parseImport(req.form.linhas ?? "");
      const st = new CobraStore(ctx.env.db);
      let novas = 0;
      for (const l of ok) {
        const contact = ctx.env.repo.upsertContact(ctx.tenant.id, l.telefone, l.nome, ctx.now, "relacao_contratual");
        const id = st.create({ tenantId: ctx.tenant.id, contactId: contact.id, reference: l.referencia, description: l.descricao, amountCents: l.valorCents, dueDate: l.vencimento }, ctx.now);
        if (id) novas++; else erros.push(`Referência “${l.referencia}” já existe — ignorada.`);
      }
      const q = new URLSearchParams({ msg: `${novas} cobrança(s) importada(s).` });
      if (erros.length) q.set("erros", erros.slice(0, 30).join("\n"));
      return redirect(`/admin/cobrancas/importar?${q}`);
    },
  },
  {
    method: "POST", path: "/cobrancas/baixa",
    handler(ctx, req) {
      const st = new CobraStore(ctx.env.db);
      let n = 0;
      for (const ref of (req.form.refs ?? "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 500)) {
        const c = st.byReference(ctx.tenant.id, ref);
        if (c && (c.status === "aberta" || c.status === "em_conferencia")) { st.setStatus(ctx.tenant.id, c.id, "paga", ctx.now); n++; }
      }
      return redirect(`/admin/cobrancas?msg=${encodeURIComponent(`${n} pagamento(s) baixado(s).`)}`);
    },
  },
  {
    method: "GET", path: "/conferencia",
    handler(ctx) {
      const hoje = localDate(ctx.now, ctx.tenant.timezone);
      const rows = listar(ctx, "AND ch.status = 'em_conferencia'");
      return ctx.page("Conferência", h`<h1>Pagamentos para conferir</h1><p class="muted">Clientes que disseram “paguei”. Confira no seu banco e dê baixa — ou devolva para a cobrança se não encontrou.</p>
<div class="card">${table(["Cliente", "Descrição", "Valor", "Vencimento", "Ações"], rows.map((c) => [
        h`${c.nome ?? "(sem nome)"}`, h`${c.description}`, h`${formatBRL(c.amount_cents)}`, h`${fmtData(c.due_date)}`,
        h`<form method="post" action="/admin/conferencia/${c.id}" class="row"><button name="r" value="paga" type="submit">Recebi</button><button name="r" value="aberta" class="sec" type="submit">Não encontrei</button></form>`,
      ]), "Nada para conferir.")}</div><p class="muted">Hoje: ${fmtData(hoje)}</p>`);
    },
  },
  {
    method: "POST", path: "/conferencia/:id",
    async handler(ctx, req) {
      const st = new CobraStore(ctx.env.db);
      const c = st.charge(ctx.tenant.id, Number(req.params.id));
      if (!c) return html("Não encontrado", 404);
      if (req.form.r === "paga") st.setStatus(ctx.tenant.id, c.id, "paga", ctx.now);
      else {
        st.setStatus(ctx.tenant.id, c.id, "aberta", ctx.now);
        st.pause(ctx.tenant.id, c.id, new Date(ctx.now.getTime() + 3 * 86_400_000).toISOString(), ctx.now); // dá 3 dias antes de cobrar de novo
        const contact = ctx.env.repo.contact(ctx.tenant.id, c.contact_id);
        if (contact) await sendProactive(ctx.env, ctx.tenant, contact, { text: `Não localizamos o pagamento de *${c.description}* (${formatBRL(c.amount_cents)}). Se já pagou, envie o comprovante por aqui; se preferir, responda PIX para receber o código. 🙂` }, ctx.now);
      }
      return redirect("/admin/conferencia");
    },
  },
  {
    method: "GET", path: "/acordos",
    handler(ctx) {
      const rows = ctx.env.db.all<Acordo & { description: string; nome: string | null; amount_cents: number }>(
        `SELECT a.*, ch.description, ch.amount_cents, c.nome FROM cz_acordos a JOIN charges ch ON ch.id = a.charge_id JOIN contacts c ON c.id = ch.contact_id
         WHERE a.tenant_id = ? ORDER BY (a.status = 'proposto') DESC, a.id DESC LIMIT 100`, ctx.tenant.id);
      const sugestao = addDays(localDate(ctx.now, ctx.tenant.timezone), 3);
      return ctx.page("Acordos", h`<h1>Propostas de acordo</h1><p class="muted">Ao aceitar, o robô cria as parcelas (uma cobrança por mês, com Pix) e avisa o cliente.</p>
<div class="card">${table(["Cliente", "Cobrança", "Proposta", "Situação", "Ações"], rows.map((a) => [
        h`${a.nome ?? "(sem nome)"}`, h`${a.description}<div class="muted">${formatBRL(a.amount_cents)}</div>`,
        h`${a.parcelas === 1 ? "À vista" : `${a.parcelas}x`} de ${formatBRL(a.parcela_cents)}<div class="muted">total ${formatBRL(a.total_cents)}</div>`,
        tag(a.status, a.status === "aceito" ? "ok" : a.status === "recusado" ? "bad" : "warn"),
        a.status === "proposto" ? h`<form method="post" action="/admin/acordos/${a.id}" class="row"><label>1º vencimento <input type="date" name="venc" value="${sugestao}" required></label><button name="r" value="aceito" type="submit">Aceitar</button><button name="r" value="recusado" class="bad" type="submit">Recusar</button></form>` : h``,
      ]), "Nenhuma proposta ainda.")}</div>`);
    },
  },
  {
    method: "POST", path: "/acordos/:id",
    async handler(ctx, req) {
      const st = new CobraStore(ctx.env.db);
      const decisao = req.form.r === "aceito" ? "aceito" : "recusado";
      const a = st.decide(ctx.tenant.id, Number(req.params.id), decisao, ctx.now);
      if (!a) return html("Não encontrado", 404);
      const orig = st.charge(ctx.tenant.id, a.charge_id);
      const contact = orig && ctx.env.repo.contact(ctx.tenant.id, orig.contact_id);
      if (decisao === "aceito" && orig && contact && /^\d{4}-\d{2}-\d{2}$/.test(req.form.venc ?? "")) {
        const ids = aplicarAcordo(ctx.env, ctx.tenant, a, req.form.venc, ctx.now);
        const primeira = ids.length ? st.charge(ctx.tenant.id, ids[0]) : undefined;
        const code = primeira ? pixDe(ctx.settings, primeira) : null;
        await sendProactive(ctx.env, ctx.tenant, contact, {
          text: `Acordo confirmado! ✅ *${orig.description}*: ${a.parcelas === 1 ? "pagamento à vista" : `${a.parcelas} parcelas de ${formatBRL(a.parcela_cents)}`}, a primeira com vencimento em ${fmtData(req.form.venc)}.${code ? " Para pagar, responda PIX." : " Em breve enviaremos os dados de pagamento."}`,
          template: ctx.settings.template.nome ? { name: ctx.settings.template.nome, language: ctx.settings.template.idioma, params: [contact.nome?.split(" ")[0] ?? "cliente", ctx.settings.empresa.nome, `Acordo confirmado: ${a.parcelas}x de ${formatBRL(a.parcela_cents)}, primeira em ${fmtData(req.form.venc)}.`] } : undefined,
        }, ctx.now);
      } else if (orig && contact) {
        st.pause(ctx.tenant.id, orig.id, ctx.now.toISOString(), ctx.now); // proposta recusada: a régua volta a valer
        await sendProactive(ctx.env, ctx.tenant, contact, { text: "Obrigado pelo contato. Não conseguimos aprovar essa proposta, mas continuamos à disposição: responda ATENDENTE para conversarmos. 🙂" }, ctx.now);
      }
      return redirect("/admin/acordos");
    },
  },
];

export function home(ctx: Ctx): SafeHtml {
  const { env, tenant, now } = ctx;
  const hoje = localDate(now, tenant.timezone);
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const q = <T,>(sql: string, ...p: unknown[]) => env.db.get<T>(sql, tenant.id, ...p)!;
  const aberto = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(amount_cents) s FROM charges WHERE tenant_id = ? AND status = 'aberta'");
  const vencido = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(amount_cents) s FROM charges WHERE tenant_id = ? AND status = 'aberta' AND due_date < ?", hoje);
  const prox = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(amount_cents) s FROM charges WHERE tenant_id = ? AND status = 'aberta' AND due_date >= ? AND due_date <= ?", hoje, addDays(hoje, 7));
  const recebido = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(amount_cents) s FROM charges WHERE tenant_id = ? AND status = 'paga' AND paid_at >= ?", since);
  const conf = q<{ n: number }>("SELECT COUNT(*) n FROM charges WHERE tenant_id = ? AND status = 'em_conferencia'");
  const prop = q<{ n: number }>("SELECT COUNT(*) n FROM cz_acordos WHERE tenant_id = ? AND status = 'proposto'");
  const enviadas = env.repo.countEvents(tenant.id, "cobranca_enviada", since);
  const errados = env.repo.countEvents(tenant.id, "numero_errado", since);
  const optouts = env.repo.countEvents(tenant.id, "optout", since);
  return h`<h1>Resumo das cobranças</h1>
<div class="grid">${kpi(formatBRL(aberto.s ?? 0), `em aberto (${aberto.n})`)}${kpi(formatBRL(vencido.s ?? 0), `vencido (${vencido.n})`)}${kpi(formatBRL(prox.s ?? 0), `a vencer em 7 dias (${prox.n})`)}${kpi(formatBRL(recebido.s ?? 0), `recebido nos últimos 30 dias (${recebido.n})`)}</div>
<h2>Precisa da sua atenção</h2>
<div class="grid">${kpi(conf.n, "pagamentos para conferir")}${kpi(prop.n, "propostas de acordo")}</div>
<h2>Robô nos últimos 30 dias</h2>
<div class="grid">${kpi(enviadas, "cobranças enviadas")}${kpi(optouts, "pediram para parar")}${kpi(errados, "“número errado”")}</div>
<p class="muted">“Recebido” considera as baixas feitas no painel — o robô não consegue ver sozinho se um Pix foi pago. Última atualização: ${localDateTimeLabel(now, tenant.timezone)}.</p>`;
}
