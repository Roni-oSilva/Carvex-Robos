import { answerFromKnowledge } from "../../../shared/ai/knowledge.ts";
import { requestHandoff } from "../../../shared/engine/engine.ts";
import type { FlowContext } from "../../../shared/engine/types.ts";
import { buildPixPayload } from "../../../shared/payments/pix.ts";
import type { InboundMessage, Outgoing } from "../../../shared/whatsapp/types.ts";
import { clip, formatBRL, normalize } from "../../../shared/utils/text.ts";
import { localDate } from "../../../shared/utils/time.ts";
import { diasEntre, fmtData, resumo } from "./mensagens.ts";
import { knowledge, type CobraSettings } from "./settings.ts";
import { CobraStore, type Charge } from "./store.ts";

type Ctx = FlowContext<CobraSettings>;
interface D { opts?: string[]; chargeId?: number }

const SIM = new Set(["sim", "s", "sou eu", "sou", "eu", "isso", "yes", "ok"]);
const ERRADO = ["errado", "engano", "nao sou", "nao conheco", "outra pessoa", "nao e comigo", "nao e meu"];
const PIX_W = ["pix", "pagar", "codigo", "boleto", "segunda via", "link", "copia e cola", "qr"];
const PAGO_W = ["paguei", "ja paguei", "pago", "efetuei", "quitei", "ja foi pago", "comprovante"];
const NEG_W = ["negociar", "parcelar", "acordo", "desconto", "nao consigo pagar", "sem condicoes", "renegociar", "parcelamento"];
const SALDO_W = ["quanto devo", "valor", "saldo", "debito", "pendencia", "pendencias", "minhas contas"];

const has = (text: string, words: string[]): boolean => words.some((w) => text === w || (` ${text} `).includes(` ${w} `));
const store = (ctx: Ctx): CobraStore => new CobraStore(ctx.env.db);
const tz = (ctx: Ctx): string => ctx.tenant.timezone;
const hoje = (ctx: Ctx): string => localDate(ctx.now, tz(ctx));
const data = (ctx: Ctx): D => ctx.conv.data as D;
const reset = (ctx: Ctx): void => { ctx.conv.state = "inicio"; delete data(ctx).opts; delete data(ctx).chargeId; };

function acoes(body: string): Outgoing {
  return { kind: "buttons", body, buttons: [{ id: "cz_pix", title: "Pagar com Pix" }, { id: "cz_pago", title: "Já paguei" }, { id: "cz_neg", title: "Negociar" }] };
}

/** Código Pix: o do lançamento (se veio do banco/PSP) ou o gerado com a chave da empresa. */
export function pixDe(s: CobraSettings, c: Charge): string | null {
  if (c.pix_code) return c.pix_code;
  if (!s.pix.chave) return null;
  return buildPixPayload({ chave: s.pix.chave, beneficiario: s.pix.beneficiario, cidade: s.pix.cidade, valorCents: c.amount_cents, txid: `C${c.id}` });
}

function mensagensPix(ctx: Ctx, cs: Charge[]): Outgoing[] {
  const out: Outgoing[] = [];
  for (const c of cs.slice(0, 3)) {
    const code = pixDe(ctx.settings, c);
    if (code) out.push({ kind: "text", body: `Pix copia e cola para *${c.description}* (${formatBRL(c.amount_cents)}).\nÉ só copiar o código abaixo e colar no app do seu banco (Pix > Pix Copia e Cola):` }, { kind: "text", body: code });
    else if (c.link) out.push({ kind: "text", body: `Para pagar *${c.description}* (${formatBRL(c.amount_cents)}), use este link:\n${c.link}` });
    else return requestHandoff(ctx, "sem Pix cadastrado", "Vou pedir para uma pessoa da equipe enviar os dados de pagamento. 🙂");
  }
  if (cs.length > 3) out.push({ kind: "text", body: `Você tem mais ${cs.length - 3} pendência(s). Peça os próximos escrevendo PIX de novo depois de pagar, ou fale com um atendente.` });
  out.push({ kind: "text", body: "Depois de pagar, responda PAGUEI (e, se quiser, envie o comprovante) para a gente conferir. ✅" });
  return out;
}

function escolherCharge(ctx: Ctx, cs: Charge[], proximo: string, titulo: string): Outgoing[] {
  data(ctx).opts = cs.map((c) => String(c.id));
  ctx.conv.state = proximo;
  return [{ kind: "list", body: titulo, button: "Escolher", sectionTitle: "Pendências", rows: cs.slice(0, 10).map((c) => ({ id: `ch_${c.id}`, title: clip(c.description, 24), description: `${formatBRL(c.amount_cents)} · venc. ${fmtData(c.due_date)}` })) }];
}

function pick(ctx: Ctx, msg: InboundMessage, cs: Charge[]): Charge | null {
  const id = msg.replyId?.startsWith("ch_") ? Number(msg.replyId.slice(3)) : (() => { const n = Number((msg.text ?? "").trim()); const o = data(ctx).opts; return Number.isInteger(n) && o && n >= 1 && n <= o.length ? Number(o[n - 1]) : NaN; })();
  return cs.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------- ações
function declararPago(ctx: Ctx, c: Charge): Outgoing[] {
  store(ctx).setStatus(ctx.tenant.id, c.id, "em_conferencia", ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "paguei", { id: c.id }, ctx.now);
  reset(ctx);
  return [{ kind: "text", body: `Obrigado por avisar! 🙏 Vamos conferir o pagamento de *${c.description}* (pode levar até 1 dia útil).\n\nSe puder, envie aqui o comprovante (foto ou PDF) para agilizar.` }];
}

export function opcoesAcordo(s: CobraSettings, c: Charge): { id: string; titulo: string; descricao: string; parcelas: number; parcela: number; total: number }[] {
  const n = s.negociacao;
  const out = [];
  if (n.desconto_a_vista_percentual > 0) {
    const total = Math.round(c.amount_cents * (1 - n.desconto_a_vista_percentual / 100));
    out.push({ id: "n_1", titulo: "À vista", descricao: `${formatBRL(total)} (${n.desconto_a_vista_percentual}% de desconto)`, parcelas: 1, parcela: total, total });
  }
  for (let p = 2; p <= n.max_parcelas; p++) {
    const parcela = Math.ceil(c.amount_cents / p);
    if (parcela < n.parcela_minima * 100) break;
    out.push({ id: `n_${p}`, titulo: `${p}x de ${formatBRL(parcela)}`, descricao: `Total ${formatBRL(parcela * p)}`, parcelas: p, parcela, total: parcela * p });
  }
  return out;
}

function ofertaNegociacao(ctx: Ctx, c: Charge): Outgoing[] {
  const ops = opcoesAcordo(ctx.settings, c);
  data(ctx).chargeId = c.id;
  if (ops.length === 0) return requestHandoff(ctx, "negociação sem opções automáticas", "Vou chamar uma pessoa da equipe para conversar com você sobre a melhor forma de resolver. 🙂");
  data(ctx).opts = ops.map((o) => o.id);
  ctx.conv.state = "neg_opcao";
  return [{ kind: "list", body: `Vamos encontrar uma forma de resolver *${c.description}* (${formatBRL(c.amount_cents)}). Escolha uma opção:`, button: "Ver opções", sectionTitle: "Opções",
    rows: [...ops.map((o) => ({ id: o.id, title: clip(o.titulo, 24), description: o.descricao })), { id: "n_outra", title: "Outra proposta", description: "Falar com uma pessoa" }] }];
}

// ---------------------------------------------------------------- entrada
export async function handleCobranca(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const s = ctx.settings, st = store(ctx);
  const rid = msg.replyId ?? "";
  const text = normalize(msg.text ?? "");
  const nome = ctx.contact.nome?.split(" ")[0] ?? "";

  if (!st.hasAny(ctx.tenant.id, ctx.contact.id)) {
    const ans = await answerFromKnowledge(knowledge(s), msg.text ?? "", ctx.env.ai);
    if (ans.found) return [{ kind: "text", body: ans.answer }];
    return [{ kind: "text", body: `Olá! Sou o assistente de cobranças da ${s.empresa.nome}. Não encontrei pendências para este número. Se precisar de ajuda, digite ATENDENTE.` }];
  }

  // 1) Titularidade
  const cli = st.client(ctx.tenant.id, ctx.contact.id);
  if (s.exigir_confirmacao_titular && !cli.identity_confirmed_at) {
    const respondeu = ctx.conv.state === "aguarda_titular" || !!cli.identity_asked_at;
    if (respondeu && (rid === "id_nao" || has(text, ERRADO) || text === "nao" || text === "n")) {
      st.markWrongNumber(ctx.tenant.id, ctx.contact.id);
      ctx.env.repo.setOptOut(ctx.contact.id, true, ctx.now);
      ctx.env.repo.event(ctx.tenant.id, "numero_errado", {}, ctx.now);
      reset(ctx);
      return [{ kind: "text", body: "Desculpe o engano! Removemos este número dos nossos avisos. Tenha um ótimo dia. 🙏" }];
    }
    if (respondeu && (rid === "id_sim" || SIM.has(text))) {
      st.confirmIdentity(ctx.tenant.id, ctx.contact.id, ctx.now);
      reset(ctx);
      const abertas = st.openFor(ctx.tenant.id, ctx.contact.id);
      // Já mostramos o resumo agora: marca os passos devidos como enviados para não repetir o mesmo aviso em seguida.
      for (const c of abertas) {
        const atraso = diasEntre(c.due_date, hoje(ctx));
        for (const p of s.regua.filter((x) => x.dias <= atraso && !st.stepSent(c.id, x.id))) st.logSend(ctx.tenant.id, ctx.contact.id, c.id, p.id, "resposta", ctx.now);
      }
      return [{ kind: "text", body: `Obrigado por confirmar${nome ? `, ${nome}` : ""}! 😊\n\n${abertas.length ? `Estas são suas pendências com a ${s.empresa.nome}:\n${resumo(abertas, hoje(ctx))}` : "No momento você não tem pendências."}` }, ...(abertas.length ? [acoes("O que você prefere fazer?")] : [])];
    }
    ctx.conv.state = "aguarda_titular";
    st.markAsked(ctx.tenant.id, ctx.contact.id, ctx.now);
    return [{ kind: "buttons", body: `Olá${nome ? `, ${nome}` : ""}! Aqui é a ${s.empresa.nome}. Antes de continuar, preciso confirmar: você é ${nome || "o(a) titular deste número"}?`, buttons: [{ id: "id_sim", title: "Sim, sou eu" }, { id: "id_nao", title: "Número errado" }] }];
  }

  // 2) Comprovante (foto/PDF) depois de "paguei"
  if (msg.type === "image" || msg.type === "document") {
    const emConf = st.openFor(ctx.tenant.id, ctx.contact.id).filter((c) => c.status === "em_conferencia");
    if (emConf.length) {
      ctx.env.repo.event(ctx.tenant.id, "comprovante", { media: msg.mediaId ?? null, charge: emConf[0].id }, ctx.now);
      return [{ kind: "text", body: "Comprovante recebido! ✅ A equipe vai conferir e te avisamos por aqui." }];
    }
    return [{ kind: "text", body: "Recebi o arquivo, mas não tenho nenhum pagamento aguardando comprovante. Se já pagou, responda PAGUEI. Para falar com uma pessoa, digite ATENDENTE." }];
  }
  if (msg.type !== "text" && msg.type !== "button" && msg.type !== "list") {
    return [{ kind: "text", body: "Só consigo entender mensagens de texto e botões. Para falar com uma pessoa, digite ATENDENTE." }];
  }

  const abertas = st.openFor(ctx.tenant.id, ctx.contact.id);
  const aPagar = abertas.filter((c) => c.status === "aberta");

  // 3) Estados de escolha
  if (ctx.conv.state === "escolhe_pix" || ctx.conv.state === "escolhe_pago" || ctx.conv.state === "neg_charge") {
    const c = pick(ctx, msg, abertas);
    if (!c) return escolherCharge(ctx, ctx.conv.state === "escolhe_pago" ? aPagar : abertas, ctx.conv.state, "Não entendi. Escolha uma opção da lista:");
    const estado = ctx.conv.state;
    reset(ctx);
    if (estado === "escolhe_pix") return mensagensPix(ctx, [c]);
    if (estado === "escolhe_pago") return declararPago(ctx, c);
    return ofertaNegociacao(ctx, c);
  }
  if (ctx.conv.state === "neg_opcao") {
    const c = st.charge(ctx.tenant.id, data(ctx).chargeId ?? 0);
    if (!c || c.contact_id !== ctx.contact.id) { reset(ctx); return [{ kind: "text", body: "Não encontrei essa pendência. Digite NEGOCIAR para recomeçar." }]; }
    if (rid === "n_outra" || text.includes("outra")) { reset(ctx); return requestHandoff(ctx, "proposta própria", "Combinado! Vou chamar uma pessoa da equipe para ouvir a sua proposta. 🙂"); }
    const idx = rid || (() => { const n = Number(text); const o = data(ctx).opts; return Number.isInteger(n) && o && n >= 1 && n <= o.length ? o[n - 1] : ""; })();
    const op = opcoesAcordo(s, c).find((o) => o.id === idx);
    if (!op) return ofertaNegociacao(ctx, c);
    const validade = new Date(ctx.now.getTime() + s.negociacao.validade_dias * 86_400_000);
    st.propose(ctx.tenant.id, c.id, op.parcelas, op.parcela, op.total, ctx.now);
    st.pause(ctx.tenant.id, c.id, validade.toISOString(), ctx.now);
    ctx.env.repo.event(ctx.tenant.id, "proposta_acordo", { id: c.id, parcelas: op.parcelas }, ctx.now);
    reset(ctx);
    return [{ kind: "text", body: `Proposta registrada! 📝\n\n*${c.description}*: ${op.parcelas === 1 ? `à vista por ${formatBRL(op.total)}` : `${op.parcelas}x de ${formatBRL(op.parcela)} (total ${formatBRL(op.total)})`}.\n\nUma pessoa da nossa equipe vai confirmar e te enviar os dados de pagamento por aqui. A proposta vale por ${s.negociacao.validade_dias} dias e, enquanto isso, não enviamos novos lembretes desta cobrança.` }];
  }

  // 4) Intenções
  if (rid === "cz_pix" || has(text, PIX_W)) {
    if (aPagar.length === 0) return [{ kind: "text", body: "Você não tem nenhum pagamento em aberto no momento. 🎉" }];
    return aPagar.length === 1 ? mensagensPix(ctx, aPagar) : escolherCharge(ctx, aPagar, "escolhe_pix", "Qual pagamento você quer pagar agora?");
  }
  if (rid === "cz_pago" || has(text, PAGO_W)) {
    if (aPagar.length === 0) return [{ kind: "text", body: "Você não tem nenhum pagamento em aberto no momento. 🎉" }];
    return aPagar.length === 1 ? declararPago(ctx, aPagar[0]) : escolherCharge(ctx, aPagar, "escolhe_pago", "Qual pagamento você já fez?");
  }
  if (rid === "cz_neg" || has(text, NEG_W)) {
    if (!s.negociacao.ativo) return requestHandoff(ctx, "negociação", "Vou chamar uma pessoa da equipe para conversar com você. 🙂");
    if (aPagar.length === 0) return [{ kind: "text", body: "Você não tem nenhum pagamento em aberto para negociar." }];
    return aPagar.length === 1 ? ofertaNegociacao(ctx, aPagar[0]) : escolherCharge(ctx, aPagar, "neg_charge", "Qual pendência você quer negociar?");
  }
  if (has(text, SALDO_W)) {
    return abertas.length ? [{ kind: "text", body: `Suas pendências com a ${s.empresa.nome}:\n${resumo(abertas, hoje(ctx))}` }, acoes("Como posso ajudar?")] : [{ kind: "text", body: "Você não tem pendências no momento. 🎉" }];
  }

  const ans = await answerFromKnowledge(knowledge(s), msg.text ?? "", ctx.env.ai);
  if (ans.found) return [{ kind: "text", body: ans.answer }];
  if (!text || ["oi", "ola", "bom dia", "boa tarde", "boa noite", "menu"].includes(text)) {
    return [{ kind: "text", body: `Olá${nome ? `, ${nome}` : ""}! Sou o assistente de cobranças da ${s.empresa.nome}.` }, acoes("Posso ajudar com o pagamento:")];
  }
  return requestHandoff(ctx, "pergunta sem resposta na base", ans.answer);
}
