import { h, kpi, raw, table, tag, type SafeHtml } from "../../../shared/dashboard/html.ts";
import type { AdminContext, AdminRoute } from "../../../shared/engine/types.ts";
import { html, redirect } from "../../../shared/utils/http.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { localDate, localDateTimeLabel, localTime, zonedToUtc } from "../../../shared/utils/time.ts";
import { avisarStatus } from "./notify.ts";
import { cents, validateSettings, type PedidoSettings } from "./settings.ts";
import { PedidoStore, type Order, type OrderStatus } from "./store.ts";

type Ctx = AdminContext<PedidoSettings>;

const PROXIMO: Record<OrderStatus, OrderStatus | null> = { novo: "aceito", aceito: "preparando", preparando: "saiu", saiu: "entregue", pronto: "entregue", entregue: null, cancelado: null };
const ROTULO: Record<OrderStatus, string> = { novo: "Novo", aceito: "Aceito", preparando: "Em preparo", saiu: "Saiu para entrega", pronto: "Pronto p/ retirada", entregue: "Entregue", cancelado: "Cancelado" };
const COLUNAS: OrderStatus[] = ["novo", "aceito", "preparando", "saiu", "pronto"];

function proximo(o: Order): OrderStatus | null {
  if (o.status === "preparando" && o.tipo === "retirada") return "pronto";
  return PROXIMO[o.status];
}

function card(ctx: Ctx, o: Order): SafeHtml {
  const st = new PedidoStore(ctx.env.db);
  const itens = st.itens(o.id);
  const prox = proximo(o);
  const c = ctx.env.repo.contact(ctx.tenant.id, o.contact_id);
  return h`<div class="card" style="padding:10px">
<b>#${o.numero}</b> · ${localTime(new Date(o.created_at), ctx.tenant.timezone)} · ${o.tipo === "entrega" ? "🛵" : "🛍️"} ${o.nome}
<div class="muted">${o.tipo === "entrega" ? `${o.endereco} — ${o.bairro}` : "Retirada"}${c ? ` · ${c.wa_id.slice(0, 4)}…${c.wa_id.slice(-4)}` : ""}</div>
<ul style="margin:6px 0;padding-left:18px">${itens.map((i) => h`<li>${i.qty}x ${i.nome}${i.variacao ? ` (${i.variacao})` : ""}${i.obs ? h`<br><i>obs: ${i.obs}</i>` : ""}</li>`)}</ul>
<b>${formatBRL(o.total_cents)}</b> · ${o.pagamento === "pix" ? "Pix" : o.pagamento === "dinheiro" ? `Dinheiro${o.troco_para_cents ? ` (troco p/ ${formatBRL(o.troco_para_cents)})` : ""}` : "Cartão"} · ${o.pago ? tag("pago", "ok") : tag("a receber", "warn")}
<form method="post" action="/admin/pedidos/${o.id}/acao" class="row" style="margin-top:8px">
${prox ? h`<button name="acao" value="${prox}" type="submit">${ROTULO[prox]} →</button>` : ""}
${!o.pago ? h`<button name="acao" value="pago" class="sec" type="submit">Marcar pago</button>` : ""}
<a class="btn sec" style="background:#fff;color:#1c2430;border:1px solid #e4e7ec" href="/admin/pedidos/${o.id}" target="_blank">Imprimir</a>
<button name="acao" value="cancelado" class="bad" type="submit">Cancelar</button></form></div>`;
}

export const adminRoutes: AdminRoute<PedidoSettings>[] = [
  {
    method: "GET", path: "/pedidos",
    handler(ctx) {
      const abertos = ctx.env.db.all<Order>("SELECT * FROM orders WHERE tenant_id = ? AND status IN ('novo','aceito','preparando','saiu','pronto') ORDER BY created_at LIMIT 200", ctx.tenant.id);
      return ctx.page("Pedidos", h`<h1>Pedidos em andamento</h1>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));align-items:start">${COLUNAS.map((col) => h`<div><h2 style="margin-top:0">${ROTULO[col]} <span class="tag">${abertos.filter((o) => o.status === col).length}</span></h2>${abertos.filter((o) => o.status === col).map((o) => card(ctx, o))}</div>`)}</div>
<p class="muted">A página se atualiza sozinha. O cliente é avisado no WhatsApp a cada mudança de etapa.</p>`);
    },
  },
  {
    method: "POST", path: "/pedidos/:id/acao",
    async handler(ctx, req) {
      const st = new PedidoStore(ctx.env.db);
      const o = st.get(ctx.tenant.id, Number(req.params.id));
      if (!o) return html("Não encontrado", 404);
      const acao = req.form.acao;
      if (acao === "pago") st.setPago(ctx.tenant.id, o.id, true, ctx.now);
      else if (acao && (["aceito", "preparando", "saiu", "pronto", "entregue", "cancelado"] as string[]).includes(acao) && o.status !== "entregue" && o.status !== "cancelado") {
        const novo = acao as OrderStatus;
        st.setStatus(ctx.tenant.id, o.id, novo, ctx.now, novo === "cancelado" ? "cancelado pela loja" : undefined);
        if (novo === "entregue" && o.pagamento !== "pix") st.setPago(ctx.tenant.id, o.id, true, ctx.now); // dinheiro/cartão: recebido na entrega
        await avisarStatus(ctx.env, ctx.tenant, ctx.settings, st.get(ctx.tenant.id, o.id)!, ctx.now);
      }
      return redirect("/admin/pedidos");
    },
  },
  {
    method: "GET", path: "/pedidos/:id",
    handler(ctx, req) {
      const st = new PedidoStore(ctx.env.db);
      const o = st.get(ctx.tenant.id, Number(req.params.id));
      if (!o) return html("Não encontrado", 404);
      return ctx.page(`Pedido #${o.numero}`, h`<h1>Pedido #${o.numero} — ${ROTULO[o.status]}</h1><div class="card" style="max-width:420px;font-family:ui-monospace,monospace">
<b>${ctx.settings.empresa.nome}</b><br>${localDateTimeLabel(new Date(o.created_at), ctx.tenant.timezone)}<hr>
${st.itens(o.id).map((i) => h`${i.qty}x ${i.nome}${i.variacao ? ` (${i.variacao})` : ""} ........ ${formatBRL(i.unit_cents * i.qty)}${i.obs ? h`<br>&nbsp;&nbsp;obs: ${i.obs}` : ""}<br>`)}<hr>
Subtotal ${formatBRL(o.subtotal_cents)}<br>Entrega ${formatBRL(o.taxa_cents)}<br><b>TOTAL ${formatBRL(o.total_cents)}</b><hr>
${o.nome}<br>${o.tipo === "entrega" ? `${o.endereco} — ${o.bairro}` : "RETIRADA NO LOCAL"}<br>
Pagamento: ${o.pagamento}${o.troco_para_cents ? ` (troco p/ ${formatBRL(o.troco_para_cents)})` : ""} ${o.pago ? "[PAGO]" : "[A RECEBER]"}</div>
<p>${raw('<a class="btn" href="/admin/pedidos">Voltar</a>')}</p>`);
    },
  },
  {
    method: "GET", path: "/historico",
    handler(ctx) {
      const rows = ctx.env.db.all<Order>("SELECT * FROM orders WHERE tenant_id = ? ORDER BY id DESC LIMIT 100", ctx.tenant.id);
      return ctx.page("Histórico", h`<h1>Histórico de pedidos</h1><div class="card">${table(["Nº", "Quando", "Cliente", "Tipo", "Total", "Situação"], rows.map((o) => [
        h`<a href="/admin/pedidos/${o.id}">#${o.numero}</a>`, h`${localDateTimeLabel(new Date(o.created_at), ctx.tenant.timezone)}`, h`${o.nome}`, h`${o.tipo}`, h`${formatBRL(o.total_cents)}`,
        tag(ROTULO[o.status], o.status === "entregue" ? "ok" : o.status === "cancelado" ? "bad" : "warn"),
      ]), "Nenhum pedido ainda.")}</div>`);
    },
  },
  {
    method: "GET", path: "/cardapio",
    handler(ctx, req) {
      const msg = req.query.get("msg");
      return ctx.page("Cardápio", h`<h1>Cardápio</h1>${msg ? h`<p class="okmsg">${msg}</p>` : ""}<p class="muted">Marque o que acabou. O item some do cardápio do robô na hora. Para mudar preços e criar itens, use “Configurações”.</p>
${ctx.settings.cardapio.map((c) => h`<div class="card"><h2 style="margin-top:0">${c.nome}</h2>${table(["Item", "Preço", "Disponível"], c.itens.map((i) => [
        h`${i.nome}`, h`${i.variacoes?.length ? `a partir de ${formatBRL(cents(Math.min(...i.variacoes.map((v) => v.preco))))}` : formatBRL(cents(i.preco))}`,
        h`<form method="post" action="/admin/cardapio/alternar" class="row"><input type="hidden" name="item" value="${i.id}">${i.disponivel ? tag("disponível", "ok") : tag("esgotado", "bad")}<button class="sec" type="submit">${i.disponivel ? "Marcar esgotado" : "Voltar a vender"}</button></form>`,
      ]))}</div>`)}`);
    },
  },
  {
    method: "POST", path: "/cardapio/alternar",
    handler(ctx, req) {
      const s = structuredClone(ctx.settings);
      for (const c of s.cardapio) for (const i of c.itens) if (i.id === req.form.item) i.disponivel = !i.disponivel;
      const v = validateSettings(s);
      if (!v.ok) return redirect(`/admin/cardapio?msg=${encodeURIComponent("Erro: " + v.error)}`);
      ctx.env.repo.updateTenantSettings(ctx.tenant.id, v.value);
      return redirect("/admin/cardapio");
    },
  },
];

export function home(ctx: Ctx): SafeHtml {
  const { env, tenant, now } = ctx;
  const tz = tenant.timezone;
  const [y, m, d] = localDate(now, tz).split("-").map(Number);
  const t0 = zonedToUtc(y, m, d, 0, 0, tz).toISOString();
  const sete = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const q = <T,>(sql: string, ...p: unknown[]) => env.db.get<T>(sql, tenant.id, ...p)!;
  const hoje = q<{ n: number; s: number | null }>("SELECT COUNT(*) n, SUM(total_cents) s FROM orders WHERE tenant_id = ? AND created_at >= ? AND status != 'cancelado'", t0);
  const abertos = q<{ n: number }>("SELECT COUNT(*) n FROM orders WHERE tenant_id = ? AND status IN ('novo','aceito','preparando','saiu','pronto')");
  const novos = q<{ n: number }>("SELECT COUNT(*) n FROM orders WHERE tenant_id = ? AND status = 'novo'");
  const cancel = q<{ n: number }>("SELECT COUNT(*) n FROM orders WHERE tenant_id = ? AND created_at >= ? AND status = 'cancelado'", t0);
  const tempo = q<{ m: number | null }>("SELECT AVG((julianday(updated_at) - julianday(created_at)) * 1440) m FROM orders WHERE tenant_id = ? AND status = 'entregue' AND created_at >= ?", t0);
  const top = env.db.all<{ nome: string; q: number }>("SELECT oi.nome, SUM(oi.qty) q FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.tenant_id = ? AND o.created_at >= ? AND o.status != 'cancelado' GROUP BY oi.nome ORDER BY q DESC LIMIT 5", tenant.id, sete);
  const ticket = hoje.n ? formatBRL(Math.round((hoje.s ?? 0) / hoje.n)) : "—";
  return h`<h1>Resumo de hoje</h1>
<div class="grid">${kpi(hoje.n, "pedidos hoje")}${kpi(formatBRL(hoje.s ?? 0), "vendas hoje")}${kpi(ticket, "ticket médio")}${kpi(novos.n, "novos esperando aceite")}${kpi(abertos.n, "em andamento")}${kpi(cancel.n, "cancelados hoje")}${kpi(tempo.m ? `${Math.round(tempo.m)} min` : "—", "tempo médio até entregar")}</div>
<h2>Mais vendidos (7 dias)</h2><div class="card">${table(["Item", "Qtd"], top.map((t) => [h`${t.nome}`, h`${t.q}`]), "Sem vendas no período.")}</div>
<p class="muted">Vendas consideram os pedidos feitos pelo robô, exceto cancelados. Pagamentos por Pix só aparecem como “pago” depois que você marca no painel.</p>`;
}
