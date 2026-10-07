import { answerFromKnowledge } from "../../../shared/ai/knowledge.ts";
import { requestHandoff } from "../../../shared/engine/engine.ts";
import { customMsg } from "../../../shared/engine/settings.ts";
import type { FlowContext } from "../../../shared/engine/types.ts";
import { buildPixPayload } from "../../../shared/payments/pix.ts";
import type { InboundMessage, Outgoing } from "../../../shared/whatsapp/types.ts";
import { clip, formatBRL, isGreeting, normalize, parseBRLToCents } from "../../../shared/utils/text.ts";
import { estaAberto } from "../../../shared/utils/time.ts";
import { textoStatus } from "./notify.ts";
import { achaItem, cents, knowledge, type Item, type PedidoSettings } from "./settings.ts";
import { PedidoStore } from "./store.ts";

type Ctx = FlowContext<PedidoSettings>;
interface Linha { itemId: string; varId?: string; qty: number; obs?: string }
interface D {
  cart?: Linha[]; cat?: string; pagina?: number; item?: string; varId?: string; qty?: number;
  tipo?: "entrega" | "retirada"; bairro?: string; endereco?: string; nome?: string; pagamento?: "pix" | "dinheiro" | "cartao_entrega"; troco?: number | null;
  opts?: string[];
}

const SIM = new Set(["sim", "s", "confirmo", "confirmar", "isso", "ok", "pode", "quero"]);
const NAO = new Set(["nao", "n", "cancelar", "cancela"]);
const MENU_W = new Set(["menu", "inicio", "oi", "ola", "bom dia", "boa tarde", "boa noite", "opa", "e ai"]);
const MAX_QTY = 20;

const data = (ctx: Ctx): D => ctx.conv.data as D;
const store = (ctx: Ctx): PedidoStore => new PedidoStore(ctx.env.db);
const cart = (ctx: Ctx): Linha[] => (data(ctx).cart ??= []);
/** Só aceita números inteiros "puros" (a normalização de texto removeria o sinal de "-2"). */
const inteiro = (raw: string): number | null => (/^\s*\d{1,3}\s*(x|un|unidades?)?\s*$/i.test(raw) ? Number(raw.replace(/\D/g, "")) : null);
const sanitize = (t: string, max: number): string => t.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function limpaTemp(ctx: Ctx): void {
  const d = data(ctx);
  for (const k of ["cat", "pagina", "item", "varId", "qty", "opts"] as const) delete d[k];
}
function resetTudo(ctx: Ctx): void {
  const d = data(ctx);
  limpaTemp(ctx);
  for (const k of ["cart", "tipo", "bairro", "endereco", "nome", "pagamento", "troco"] as const) delete d[k];
  ctx.conv.state = "inicio";
}

// ---------------------------------------------------------------- cardápio e carrinho
function disponiveis(s: PedidoSettings) {
  return s.cardapio.map((c) => ({ ...c, itens: c.itens.filter((i) => i.disponivel) })).filter((c) => c.itens.length > 0);
}

function precoItem(i: Item): string {
  return i.variacoes?.length ? `a partir de ${formatBRL(cents(Math.min(...i.variacoes.map((v) => v.preco))))}` : formatBRL(cents(i.preco));
}

export function cardapioTexto(s: PedidoSettings): string[] {
  const blocos = disponiveis(s).map((c) => `*${c.nome.toUpperCase()}*\n${c.itens.map((i) => `• ${i.nome} — ${precoItem(i)}${i.descricao ? `\n   _${i.descricao}_` : ""}`).join("\n")}`);
  const out: string[] = [];
  let cur = "";
  for (const b of blocos) {
    if ((cur + "\n\n" + b).length > 3500 && cur) { out.push(cur); cur = b; } else cur = cur ? `${cur}\n\n${b}` : b;
  }
  if (cur) out.push(cur);
  return out;
}

/** Recalcula o carrinho a partir do cardápio ATUAL — preço e disponibilidade nunca vêm do cliente. */
export function resolverCarrinho(s: PedidoSettings, c: Linha[]) {
  const linhas: { itemId: string; nome: string; variacao: string | null; qty: number; unitCents: number; obs: string | null }[] = [];
  const removidos: string[] = [];
  for (const l of c) {
    const f = achaItem(s, l.itemId);
    if (!f || !f.item.disponivel) { removidos.push(f?.item.nome ?? l.itemId); continue; }
    const v = f.item.variacoes?.find((x) => x.id === l.varId);
    if (f.item.variacoes?.length && !v) { removidos.push(f.item.nome); continue; }
    linhas.push({ itemId: f.item.id, nome: f.item.nome, variacao: v?.nome ?? null, qty: Math.min(Math.max(1, Math.floor(l.qty)), MAX_QTY), unitCents: cents(v?.preco ?? f.item.preco), obs: l.obs ?? null });
  }
  return { linhas, removidos, subtotal: linhas.reduce((t, l) => t + l.unitCents * l.qty, 0) };
}

const fmtLinha = (l: { nome: string; variacao: string | null; qty: number; unitCents: number; obs: string | null }): string =>
  `${l.qty}x ${l.nome}${l.variacao ? ` (${l.variacao})` : ""} — ${formatBRL(l.unitCents * l.qty)}${l.obs ? `\n   _obs: ${l.obs}_` : ""}`;

function carrinhoTexto(ctx: Ctx): string {
  const r = resolverCarrinho(ctx.settings, cart(ctx));
  if (!r.linhas.length) return "Seu carrinho está vazio.";
  return `🧺 *Seu pedido até agora*\n${r.linhas.map(fmtLinha).join("\n")}\n\nSubtotal: ${formatBRL(r.subtotal)}`;
}

function botoesCarrinho(body: string): Outgoing {
  return { kind: "buttons", body, buttons: [{ id: "k_mais", title: "Adicionar mais" }, { id: "k_fim", title: "Finalizar pedido" }, { id: "k_zerar", title: "Esvaziar" }] };
}

export function menu(ctx: Ctx, intro?: string): Outgoing[] {
  limpaTemp(ctx);
  ctx.conv.state = "inicio";
  const body = intro ?? customMsg(ctx.settings, "boas_vindas", `Olá! 😋 Bem-vindo à ${ctx.settings.empresa.nome}! Como posso ajudar?`);
  return [{ kind: "buttons", body, buttons: [{ id: "m_pedir", title: "Fazer pedido" }, { id: "m_cardapio", title: "Ver cardápio" }, { id: "m_meu", title: "Meu pedido" }] }];
}

function fechado(ctx: Ctx): boolean {
  const h = ctx.settings.empresa.horario;
  return !!h && !estaAberto(h, ctx.now, ctx.tenant.timezone);
}

function msgFechado(ctx: Ctx): string {
  return customMsg(ctx.settings, "fora_horario", `No momento estamos fechados. 😴 Nosso horário: ${ctx.settings.empresa.horario_texto}. Você pode ver o cardápio e voltar quando abrirmos!`);
}

function askCategoria(ctx: Ctx, aviso?: string): Outgoing[] {
  const cats = disponiveis(ctx.settings);
  if (!cats.length) return requestHandoff(ctx, "cardápio sem itens disponíveis", "Estamos sem itens disponíveis no momento. Vou chamar um atendente. 🙂");
  limpaTemp(ctx);
  data(ctx).opts = cats.map((c) => c.id);
  ctx.conv.state = "categoria";
  const n = cart(ctx).reduce((t, l) => t + l.qty, 0);
  return [{ kind: "list", body: aviso ?? `${n ? `Você tem ${n} item(ns) no carrinho. ` : ""}O que você quer pedir?`, button: "Ver categorias", sectionTitle: "Cardápio", rows: cats.map((c) => ({ id: `c_${c.id}`, title: clip(c.nome, 24), description: `${c.itens.length} opç${c.itens.length === 1 ? "ão" : "ões"}` })) }];
}

const PAGE = 9;
function askItem(ctx: Ctx, catId: string, pagina = 0): Outgoing[] {
  const cat = disponiveis(ctx.settings).find((c) => c.id === catId);
  if (!cat) return askCategoria(ctx);
  const d = data(ctx);
  d.cat = catId; d.pagina = pagina;
  const fatia = cat.itens.slice(pagina * PAGE, pagina * PAGE + PAGE);
  const mais = cat.itens.length > (pagina + 1) * PAGE;
  d.opts = [...fatia.map((i) => i.id), ...(mais ? ["more"] : [])];
  ctx.conv.state = "item";
  const rows = fatia.map((i) => ({ id: `i_${i.id}`, title: clip(i.nome, 24), description: clip(`${precoItem(i)}${i.descricao ? ` · ${i.descricao}` : ""}`, 72) }));
  if (mais) rows.push({ id: "i_more", title: "Mais itens ▶", description: "" });
  return [{ kind: "list", body: `*${cat.nome}* — escolha o item (digite VOLTAR para ver as categorias):`, button: "Ver itens", sectionTitle: cat.nome, rows }];
}

function askQtd(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "qtd";
  return [{ kind: "buttons", body: "Quantas unidades? (toque ou digite um número)", buttons: [{ id: "q_1", title: "1" }, { id: "q_2", title: "2" }, { id: "q_3", title: "3" }] }];
}

function askObs(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "obs";
  return [{ kind: "buttons", body: "Alguma observação? (ex.: sem cebola, bem passado). Escreva ou toque em “Sem observação”.", buttons: [{ id: "o_nao", title: "Sem observação" }] }];
}

function addCarrinho(ctx: Ctx, obs: string | undefined): Outgoing[] {
  const d = data(ctx);
  cart(ctx).push({ itemId: d.item!, varId: d.varId, qty: d.qty!, ...(obs ? { obs } : {}) });
  limpaTemp(ctx);
  ctx.conv.state = "carrinho";
  return [{ kind: "text", body: "Adicionado! ✅" }, botoesCarrinho(carrinhoTexto(ctx))];
}

// ---------------------------------------------------------------- checkout
function askTipo(ctx: Ctx): Outgoing[] {
  const e = ctx.settings.entrega;
  const r = resolverCarrinho(ctx.settings, cart(ctx));
  const avisos = r.removidos.length ? [{ kind: "text", body: `⚠️ Estes itens ficaram indisponíveis e saíram do carrinho: ${r.removidos.join(", ")}.` } as Outgoing] : [];
  if (r.removidos.length) data(ctx).cart = cart(ctx).filter((l) => r.linhas.some((x) => x.itemId === l.itemId));
  if (!r.linhas.length) return [...avisos, ...askCategoria(ctx, "Seu carrinho ficou vazio. O que você quer pedir?")];
  if (e.entrega_ativa && e.retirada_ativa) {
    ctx.conv.state = "tipo";
    return [...avisos, { kind: "buttons", body: `${carrinhoTexto(ctx)}\n\nÉ para entrega ou retirada?`, buttons: [{ id: "t_entrega", title: "Entrega 🛵" }, { id: "t_retirada", title: "Retirada 🛍️" }] }];
  }
  return [...avisos, ...definirTipo(ctx, e.entrega_ativa ? "entrega" : "retirada")];
}

function definirTipo(ctx: Ctx, tipo: "entrega" | "retirada"): Outgoing[] {
  const d = data(ctx);
  d.tipo = tipo;
  if (tipo === "retirada") return askNome(ctx);
  const sub = resolverCarrinho(ctx.settings, cart(ctx)).subtotal;
  const min = cents(ctx.settings.entrega.pedido_minimo);
  if (sub < min) {
    ctx.conv.state = "carrinho";
    return [{ kind: "buttons", body: `O pedido mínimo para entrega é ${formatBRL(min)} (seu subtotal: ${formatBRL(sub)}). Quer adicionar mais itens${ctx.settings.entrega.retirada_ativa ? " ou retirar no local" : ""}?`, buttons: [{ id: "k_mais", title: "Adicionar mais" }, ...(ctx.settings.entrega.retirada_ativa ? [{ id: "t_retirada", title: "Retirada 🛍️" }] : [])] }];
  }
  const b = ctx.settings.entrega.bairros;
  ctx.conv.state = "bairro";
  if (b.length <= 10) {
    d.opts = b.map((x) => x.nome);
    return [{ kind: "list", body: "Qual o seu bairro?", button: "Escolher bairro", sectionTitle: "Bairros atendidos", rows: b.map((x, i) => ({ id: `b_${i}`, title: clip(x.nome, 24), description: `Taxa ${formatBRL(cents(x.taxa))} · ~${x.tempo_min} min` })) }];
  }
  return [{ kind: "text", body: "Qual o seu bairro? (escreva o nome)" }];
}

function askNome(ctx: Ctx): Outgoing[] {
  const d = data(ctx);
  const n = ctx.contact.nome?.trim();
  if (n) { d.nome = n.split(" ").slice(0, 3).join(" "); return d.tipo === "entrega" && !d.endereco ? askEndereco(ctx) : askPagamento(ctx); }
  ctx.conv.state = "nome";
  return [{ kind: "text", body: "Qual o seu nome para o pedido?" }];
}
function askEndereco(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "endereco";
  return [{ kind: "text", body: "Qual o endereço de entrega? (rua, número e complemento/ponto de referência)" }];
}
function askPagamento(ctx: Ctx): Outgoing[] {
  const f = ctx.settings.pagamento.formas;
  ctx.conv.state = "pagamento";
  const rot = { pix: "Pix", dinheiro: "Dinheiro", cartao_entrega: ctx.conv.data.tipo === "retirada" ? "Cartão no local" : "Cartão na entrega" } as const;
  return [{ kind: "buttons", body: "Como você prefere pagar?", buttons: f.map((x) => ({ id: `p_${x}`, title: rot[x] })) }];
}

function totais(ctx: Ctx) {
  const d = data(ctx), s = ctx.settings;
  const r = resolverCarrinho(s, cart(ctx));
  const bairro = d.tipo === "entrega" ? s.entrega.bairros.find((b) => b.nome === d.bairro) : undefined;
  const taxa = bairro ? cents(bairro.taxa) : 0;
  return { ...r, taxa, total: r.subtotal + taxa, eta: d.tipo === "entrega" ? bairro?.tempo_min ?? 45 : s.entrega.tempo_retirada_min };
}

function askConfirmar(ctx: Ctx): Outgoing[] {
  const d = data(ctx);
  const t = totais(ctx);
  ctx.conv.state = "confirmar";
  const pg = d.pagamento === "pix" ? "Pix" : d.pagamento === "dinheiro" ? `Dinheiro${d.troco ? ` (troco para ${formatBRL(d.troco)})` : " (sem troco)"}` : "Cartão";
  const corpo = [
    "📋 *Confira seu pedido*", t.linhas.map(fmtLinha).join("\n"), "",
    `Subtotal: ${formatBRL(t.subtotal)}`, ...(d.tipo === "entrega" ? [`Entrega (${d.bairro}): ${formatBRL(t.taxa)}`] : []),
    `*Total: ${formatBRL(t.total)}*`, "",
    d.tipo === "entrega" ? `🛵 Entrega em: ${d.endereco} — ${d.bairro}` : "🛍️ Retirada no local",
    `👤 ${d.nome}`, `💳 ${pg}`, `⏱️ Previsão: ~${t.eta} min`,
  ].join("\n");
  return [{ kind: "buttons", body: corpo, buttons: [{ id: "f_sim", title: "Confirmar ✅" }, { id: "f_alt", title: "Alterar pedido" }, { id: "f_nao", title: "Cancelar" }] }];
}

function confirmar(ctx: Ctx): Outgoing[] {
  const d = data(ctx), s = ctx.settings;
  if (fechado(ctx)) { ctx.conv.state = "carrinho"; return [{ kind: "text", body: msgFechado(ctx) }]; }
  const t = totais(ctx);
  if (!t.linhas.length || !d.tipo || !d.pagamento || !d.nome) return menu(ctx, "Não consegui fechar o pedido. Vamos recomeçar?");
  if (d.tipo === "entrega" && t.subtotal < cents(s.entrega.pedido_minimo)) return askTipo(ctx);
  const o = store(ctx).criar({
    tenantId: ctx.tenant.id, contactId: ctx.contact.id, tipo: d.tipo, nome: d.nome, endereco: d.tipo === "entrega" ? d.endereco ?? null : null,
    bairro: d.tipo === "entrega" ? d.bairro ?? null : null, taxaCents: t.taxa, pagamento: d.pagamento, trocoParaCents: d.pagamento === "dinheiro" ? d.troco ?? null : null, etaMin: t.eta,
    itens: t.linhas.map((l) => ({ itemId: l.itemId, nome: l.nome, variacao: l.variacao, qty: l.qty, unitCents: l.unitCents, obs: l.obs })),
  }, ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "pedido", { id: o.id, total: o.total_cents }, ctx.now);
  resetTudo(ctx);
  const out: Outgoing[] = [{ kind: "text", body: `Pedido *#${o.numero}* recebido! 🎉\n\n${textoStatus(o, s)}\nTotal: ${formatBRL(o.total_cents)}. Vou te avisando por aqui a cada etapa.` }];
  if (o.pagamento === "pix" && s.pagamento.pix.chave) {
    out.push({ kind: "text", body: `Para pagar por Pix, copie o código abaixo e cole no app do seu banco (Pix > Pix Copia e Cola). Nossa equipe confirma o pagamento:` },
      { kind: "text", body: buildPixPayload({ chave: s.pagamento.pix.chave, beneficiario: s.pagamento.pix.beneficiario, cidade: s.pagamento.pix.cidade, valorCents: o.total_cents, txid: `P${o.numero}` }) });
  }
  return out;
}

function meuPedido(ctx: Ctx): Outgoing[] {
  const o = store(ctx).ultimoDe(ctx.tenant.id, ctx.contact.id);
  if (!o) return [{ kind: "text", body: "Você ainda não fez nenhum pedido por aqui. Quer começar agora?" }, ...menu(ctx)];
  const itens = store(ctx).itens(o.id).map((i) => fmtLinha({ nome: i.nome, variacao: i.variacao, qty: i.qty, unitCents: i.unit_cents, obs: i.obs })).join("\n");
  return [{ kind: "text", body: `*Pedido #${o.numero}*\n${itens}\nTotal: ${formatBRL(o.total_cents)}\n\n${textoStatus(o, ctx.settings)}${o.status === "novo" ? "\n\nSe quiser cancelar, responda CANCELAR PEDIDO." : ""}` }];
}

// ---------------------------------------------------------------- entrada
export async function handlePedido(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const s = ctx.settings, d = data(ctx);
  const rid = msg.replyId ?? "";
  const raw = (msg.text ?? "").trim();
  const text = normalize(raw);

  if (msg.type !== "text" && msg.type !== "button" && msg.type !== "list") {
    return [{ kind: "text", body: "Só consigo entender mensagens de texto e botões. 🙂 Digite MENU para ver as opções ou ATENDENTE para falar com uma pessoa." }];
  }

  // Atalhos globais
  if (rid === "m_cardapio" || /\bcardapio\b/.test(text)) {
    return [...cardapioTexto(s).map((body) => ({ kind: "text", body }) as Outgoing), { kind: "buttons", body: "Quer fazer o pedido agora?", buttons: [{ id: "m_pedir", title: "Fazer pedido" }, { id: "m_menu", title: "Menu" }] }];
  }
  if (rid === "m_meu" || /\b(meu pedido|status|acompanhar|onde esta)\b/.test(text)) return meuPedido(ctx);
  if (/\bcancelar pedido\b/.test(text)) {
    const o = store(ctx).ultimoDe(ctx.tenant.id, ctx.contact.id);
    if (o && o.status === "novo") {
      store(ctx).setStatus(ctx.tenant.id, o.id, "cancelado", ctx.now, "cancelado pelo cliente");
      ctx.env.repo.event(ctx.tenant.id, "pedido_cancelado_cliente", { id: o.id }, ctx.now);
      return [{ kind: "text", body: `Pedido #${o.numero} cancelado. Quando quiser, é só chamar! 🙂` }];
    }
    return o && ["aceito", "preparando", "saiu", "pronto"].includes(o.status) ? requestHandoff(ctx, "cancelamento de pedido em andamento", "Seu pedido já está em andamento. Vou chamar um atendente para ver o que dá para fazer. 🙂") : [{ kind: "text", body: "Você não tem pedido aberto para cancelar." }];
  }
  if (/\bcarrinho\b/.test(text)) return [botoesCarrinho(carrinhoTexto(ctx))];
  if (rid === "m_menu" || MENU_W.has(text) || isGreeting(text)) return menu(ctx);
  if (rid === "m_pedir" || /\b(pedir|fazer pedido|quero pedir|fazer um pedido)\b/.test(text)) {
    if (fechado(ctx)) return [{ kind: "text", body: msgFechado(ctx) }];
    return askCategoria(ctx);
  }

  switch (ctx.conv.state) {
    case "categoria": {
      const id = rid.startsWith("c_") ? rid.slice(2) : (() => { const n = inteiro(raw); return n !== null && d.opts && n >= 1 && n <= d.opts.length ? d.opts[n - 1] : disponiveis(s).find((c) => normalize(c.nome) === text)?.id; })();
      return id ? askItem(ctx, id) : askCategoria(ctx, "Não entendi. Escolha uma categoria:");
    }
    case "item": {
      if (text === "voltar" || text === "categorias") return askCategoria(ctx);
      if (rid === "i_more") return askItem(ctx, d.cat!, (d.pagina ?? 0) + 1);
      const cat = disponiveis(s).find((c) => c.id === d.cat);
      const id = rid.startsWith("i_") ? rid.slice(2) : (() => { const n = inteiro(raw); return n !== null && d.opts && n >= 1 && n <= d.opts.length && d.opts[n - 1] !== "more" ? d.opts[n - 1] : cat?.itens.find((i) => normalize(i.nome) === text)?.id; })();
      const item = cat?.itens.find((i) => i.id === id);
      if (!item) return askItem(ctx, d.cat!, d.pagina ?? 0);
      d.item = item.id;
      if (item.variacoes?.length) {
        ctx.conv.state = "variacao";
        d.opts = item.variacoes.map((v) => v.id);
        return [{ kind: "list", body: `*${item.nome}* — qual opção?`, button: "Escolher", sectionTitle: "Opções", rows: item.variacoes.map((v) => ({ id: `v_${v.id}`, title: clip(v.nome, 24), description: formatBRL(cents(v.preco)) })) }];
      }
      return askQtd(ctx);
    }
    case "variacao": {
      const f = d.item ? achaItem(s, d.item) : null;
      const id = rid.startsWith("v_") ? rid.slice(2) : f?.item.variacoes?.find((v) => normalize(v.nome) === text)?.id;
      if (!f || !id || !f.item.variacoes?.some((v) => v.id === id)) return f ? [{ kind: "text", body: "Escolha uma das opções da lista." }] : askCategoria(ctx);
      d.varId = id;
      return askQtd(ctx);
    }
    case "qtd": {
      const n = rid.startsWith("q_") ? Number(rid.slice(2)) : inteiro(raw);
      if (n === null || !Number.isInteger(n) || n < 1 || n > MAX_QTY) return [{ kind: "text", body: `Digite uma quantidade de 1 a ${MAX_QTY}.` }];
      d.qty = n;
      return askObs(ctx);
    }
    case "obs": return addCarrinho(ctx, rid === "o_nao" || ["nao", "sem", "sem observacao", "nenhuma"].includes(text) ? undefined : sanitize(raw, 120) || undefined);
    case "carrinho": {
      if (rid === "k_mais" || text === "adicionar mais" || text === "mais") return askCategoria(ctx);
      if (rid === "k_zerar" || text === "esvaziar") { d.cart = []; return askCategoria(ctx, "Carrinho esvaziado. O que você quer pedir?"); }
      if (rid === "t_retirada") return definirTipo(ctx, "retirada");
      if (rid === "k_fim" || text.includes("finalizar") || SIM.has(text)) return askTipo(ctx);
      return [botoesCarrinho(carrinhoTexto(ctx))];
    }
    case "tipo": {
      if (rid === "t_entrega" || text.includes("entrega")) return definirTipo(ctx, "entrega");
      if (rid === "t_retirada" || text.includes("retirada") || text.includes("retirar")) return definirTipo(ctx, "retirada");
      return askTipo(ctx);
    }
    case "bairro": {
      const b = s.entrega.bairros;
      const idx = rid.startsWith("b_") ? Number(rid.slice(2)) : b.findIndex((x) => normalize(x.nome) === text || (text.length > 3 && normalize(x.nome).includes(text)));
      const achado = b[idx];
      if (!achado) {
        return [{ kind: "text", body: `Não encontrei esse bairro na nossa área de entrega. 😕 Atendemos: ${b.map((x) => x.nome).join(", ")}.${s.entrega.retirada_ativa ? " Você também pode retirar no local — digite RETIRADA." : ""}` }];
      }
      d.bairro = achado.nome;
      return askNome(ctx);
    }
    case "nome": {
      if (text === "retirada" && s.entrega.retirada_ativa) return definirTipo(ctx, "retirada");
      const n = sanitize(raw, 60);
      if (n.length < 2) return [{ kind: "text", body: "Pode me dizer seu nome? (mínimo 2 letras)" }];
      d.nome = n;
      return d.tipo === "entrega" && !d.endereco ? askEndereco(ctx) : askPagamento(ctx);
    }
    case "endereco": {
      const e = sanitize(raw, 160);
      if (e.length < 8) return [{ kind: "text", body: "Preciso do endereço completo: rua, número e complemento/ponto de referência." }];
      d.endereco = e;
      return askPagamento(ctx);
    }
    case "pagamento": {
      const f = rid.startsWith("p_") ? rid.slice(2) : text.includes("pix") ? "pix" : text.includes("dinheiro") ? "dinheiro" : text.includes("cartao") ? "cartao_entrega" : "";
      if (!f || !s.pagamento.formas.includes(f as never)) return askPagamento(ctx);
      d.pagamento = f as D["pagamento"];
      if (f === "dinheiro") {
        ctx.conv.state = "troco";
        return [{ kind: "buttons", body: `Total: ${formatBRL(totais(ctx).total)}. Precisa de troco? Digite o valor da nota (ex.: 100) ou toque em “Sem troco”.`, buttons: [{ id: "tr_nao", title: "Sem troco" }] }];
      }
      d.troco = null;
      return askConfirmar(ctx);
    }
    case "troco": {
      if (rid === "tr_nao" || ["nao", "sem troco", "nao preciso"].includes(text)) { d.troco = null; return askConfirmar(ctx); }
      const v = parseBRLToCents(raw.replace(/[^\d,.]/g, ""));
      const total = totais(ctx).total;
      if (!v || v < total) return [{ kind: "text", body: `O valor precisa ser maior ou igual ao total (${formatBRL(total)}). Quanto você vai pagar em dinheiro?` }];
      d.troco = v;
      return askConfirmar(ctx);
    }
    case "confirmar": {
      if (rid === "f_sim" || SIM.has(text)) return confirmar(ctx);
      if (rid === "f_alt") { ctx.conv.state = "carrinho"; return [botoesCarrinho(carrinhoTexto(ctx))]; }
      if (rid === "f_nao" || NAO.has(text)) { resetTudo(ctx); return menu(ctx, "Tudo bem, pedido cancelado. 🙂 Posso ajudar com mais alguma coisa?"); }
      return askConfirmar(ctx);
    }
  }

  // Estado "inicio": dúvidas (FAQ / IA restrita à base) ou encaminhamento humano
  const ans = await answerFromKnowledge(knowledge(s), raw, ctx.env.ai);
  if (ans.found) return [{ kind: "text", body: ans.answer }, { kind: "buttons", body: "Posso ajudar em mais alguma coisa?", buttons: [{ id: "m_pedir", title: "Fazer pedido" }, { id: "m_menu", title: "Menu" }] }];
  return requestHandoff(ctx, "pergunta sem resposta na base", ans.answer);
}
