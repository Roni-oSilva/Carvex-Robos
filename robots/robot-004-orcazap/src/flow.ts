import { answerFromKnowledge } from "../../../shared/ai/knowledge.ts";
import { requestHandoff } from "../../../shared/engine/engine.ts";
import { customMsg } from "../../../shared/engine/settings.ts";
import type { FlowContext } from "../../../shared/engine/types.ts";
import { removerImagem, salvarImagem } from "../../../shared/media/store.ts";
import type { InboundMessage, Outgoing } from "../../../shared/whatsapp/types.ts";
import { clip, formatBRL, isGreeting, normalize } from "../../../shared/utils/text.ts";
import { textoProposta } from "./notify.ts";
import { knowledge, type OrcaSettings } from "./settings.ts";
import { OrcaStore, type Periodo, type Photo, type Quote } from "./store.ts";

type Ctx = FlowContext<OrcaSettings>;
interface D { servico?: string; descricao?: string; bairro?: string; endereco?: string; periodo?: Periodo; nome?: string; recusando?: number; opts?: string[] }

const SIM = new Set(["sim", "s", "confirmo", "confirmar", "enviar", "pode", "ok", "isso"]);
const NAO = new Set(["nao", "n", "cancelar", "cancela"]);
const MENU_W = new Set(["menu", "inicio", "oi", "ola", "bom dia", "boa tarde", "boa noite", "opa"]);
const PERIODOS: Record<Periodo, string> = { manha: "Manhã", tarde: "Tarde", qualquer: "Tanto faz" };

const data = (ctx: Ctx): D => ctx.conv.data as D;
const store = (ctx: Ctx): OrcaStore => new OrcaStore(ctx.env.db);
const sanitize = (t: string, max: number): string => t.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** Fotos recebidas e ainda sem orçamento (o banco é a fonte da verdade: várias fotos podem chegar ao mesmo tempo). */
function pendentes(ctx: Ctx): { arquivo: string }[] {
  return ctx.env.db.all<{ arquivo: string }>("SELECT arquivo FROM quote_photos WHERE tenant_id = ? AND contact_id = ? AND quote_id IS NULL ORDER BY id", ctx.tenant.id, ctx.contact.id);
}
function descartaPendentes(ctx: Ctx): void {
  const fotos = ctx.env.db.all<Photo>("SELECT * FROM quote_photos WHERE tenant_id = ? AND contact_id = ? AND quote_id IS NULL", ctx.tenant.id, ctx.contact.id);
  store(ctx).apagarFotos(ctx.env.config.mediaDir, fotos);
}
function limpaFluxo(ctx: Ctx): void {
  const d = data(ctx);
  for (const k of ["servico", "descricao", "bairro", "endereco", "periodo", "nome", "recusando", "opts"] as const) delete d[k];
}

export function menu(ctx: Ctx, intro?: string): Outgoing[] {
  limpaFluxo(ctx);
  ctx.conv.state = "inicio";
  const body = intro ?? customMsg(ctx.settings, "boas_vindas", `Olá! Aqui é a ${ctx.settings.empresa.nome}. Posso receber o seu pedido de orçamento com fotos. Como posso ajudar?`);
  return [{ kind: "buttons", body, buttons: [{ id: "m_novo", title: "Pedir orçamento" }, { id: "m_meu", title: "Meu orçamento" }, { id: "m_duvida", title: "Tirar dúvida" }] }];
}

function askServico(ctx: Ctx, aviso?: string): Outgoing[] {
  const sv = ctx.settings.servicos;
  data(ctx).opts = sv.map((x) => x.id);
  ctx.conv.state = "servico";
  return [{ kind: "list", body: aviso ?? "Qual serviço você precisa?", button: "Ver serviços", sectionTitle: "Serviços", rows: sv.slice(0, 10).map((x) => ({ id: `s_${x.id}`, title: clip(x.nome, 24) })) }];
}
function askDescricao(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "descricao";
  return [{ kind: "text", body: "Descreva o que precisa ser feito (o que está acontecendo, medidas aproximadas, material, o que você espera). Quanto mais detalhes, mais preciso o orçamento." }];
}
function askFotos(ctx: Ctx, aviso?: string): Outgoing[] {
  const max = ctx.settings.atendimento.max_fotos;
  const n = pendentes(ctx).length;
  ctx.conv.state = "fotos";
  return [{
    kind: "buttons",
    body: aviso ?? `Agora envie fotos do local ou do problema (até ${max}). ${n ? `Já recebi ${n}. ` : ""}Quando terminar, toque em “Já enviei”.`,
    buttons: n ? [{ id: "f_fim", title: "Já enviei" }] : [{ id: "f_pular", title: "Sem fotos" }],
  }];
}
function askBairro(ctx: Ctx): Outgoing[] {
  const b = ctx.settings.atendimento.bairros;
  ctx.conv.state = "bairro";
  if (b.length && b.length <= 10) {
    data(ctx).opts = b;
    return [{ kind: "list", body: "Em qual bairro fica o serviço?", button: "Escolher bairro", sectionTitle: "Bairros atendidos", rows: b.map((x, i) => ({ id: `b_${i}`, title: clip(x, 24) })) }];
  }
  return [{ kind: "text", body: "Em qual bairro fica o serviço? (escreva o nome)" }];
}
function askEndereco(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "endereco";
  return [{ kind: "text", body: "Qual o endereço (rua, número e ponto de referência)? Usamos só para a equipe avaliar e agendar." }];
}
function askPeriodo(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "periodo";
  return [{ kind: "buttons", body: "Se for preciso uma visita, qual período é melhor para você?", buttons: [{ id: "p_manha", title: "Manhã" }, { id: "p_tarde", title: "Tarde" }, { id: "p_qualquer", title: "Tanto faz" }] }];
}
function askNome(ctx: Ctx): Outgoing[] {
  const n = ctx.contact.nome?.trim();
  if (n) { data(ctx).nome = n.split(" ").slice(0, 3).join(" "); return askConfirmar(ctx); }
  ctx.conv.state = "nome";
  return [{ kind: "text", body: "Qual o seu nome?" }];
}
function askConfirmar(ctx: Ctx): Outgoing[] {
  const d = data(ctx);
  const sv = ctx.settings.servicos.find((x) => x.id === d.servico);
  ctx.conv.state = "confirmar";
  const corpo = [
    "Confira o seu pedido de orçamento:", `Serviço: ${sv?.nome ?? ""}`, `O que precisa: ${d.descricao}`, `Local: ${d.endereco ? `${d.endereco} — ` : ""}${d.bairro}`,
    `Fotos: ${pendentes(ctx).length}`, `Período para visita: ${PERIODOS[d.periodo ?? "qualquer"]}`, `Nome: ${d.nome}`,
    ...(sv?.exige_visita ? ["", "Esse tipo de serviço costuma precisar de visita; o valor final pode ser confirmado após a avaliação."] : []),
  ].join("\n");
  return [{ kind: "buttons", body: corpo, buttons: [{ id: "c_sim", title: "Enviar pedido" }, { id: "c_nao", title: "Cancelar" }] }];
}

function enviar(ctx: Ctx): Outgoing[] {
  const d = data(ctx), s = ctx.settings;
  const sv = s.servicos.find((x) => x.id === d.servico);
  if (!sv || !d.descricao || !d.bairro || !d.nome) return menu(ctx, "Não consegui fechar o pedido. Vamos recomeçar?");
  const fotos = pendentes(ctx).map((f) => f.arquivo);
  const q = store(ctx).criar({
    tenantId: ctx.tenant.id, contactId: ctx.contact.id, servicoId: sv.id, servicoNome: sv.nome, descricao: d.descricao, bairro: d.bairro,
    endereco: d.endereco ?? null, periodo: d.periodo ?? "qualquer", nome: d.nome, fotos,
  }, ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "orcamento_novo", { id: q.id, fotos: fotos.length }, ctx.now);
  limpaFluxo(ctx);
  ctx.conv.state = "inicio";
  return [{ kind: "text", body: `Pedido de orçamento *#${q.numero}* recebido!\nA equipe vai analisar${fotos.length ? " as fotos" : ""} e enviar o valor por aqui. Se precisar de mais informações, entraremos em contato.\n\nPara ver a situação, digite MEU ORÇAMENTO.` }];
}

function statusTexto(q: Quote, tz: string): string {
  switch (q.status) {
    case "novo": return `O pedido #${q.numero} (${q.servico_nome}) foi recebido e aguarda análise da equipe.`;
    case "em_analise": return `O pedido #${q.numero} (${q.servico_nome}) está sendo analisado pela equipe.`;
    case "enviado": return `O orçamento #${q.numero} está pronto:\n${textoProposta(q, tz)}`;
    case "aceito": return `Você aceitou o orçamento #${q.numero} (${q.servico_nome}). A equipe vai combinar os próximos passos com você.`;
    case "recusado": return `O orçamento #${q.numero} foi recusado. Se mudar de ideia, é só pedir um novo.`;
    case "expirado": return `O orçamento #${q.numero} venceu. Responda aqui se ainda tiver interesse que a equipe atualiza o valor.`;
    case "cancelado": return `O pedido #${q.numero} foi cancelado.`;
  }
}
function meuOrcamento(ctx: Ctx): Outgoing[] {
  const q = store(ctx).ultimoDe(ctx.tenant.id, ctx.contact.id);
  if (!q) return [{ kind: "text", body: "Você ainda não pediu nenhum orçamento por aqui. Quer começar agora?" }, ...menu(ctx)];
  const txt = statusTexto(q, ctx.tenant.timezone);
  if (q.status === "enviado") return [{ kind: "buttons", body: txt, buttons: [{ id: `oz_ok_${q.id}`, title: "Aceitar" }, { id: `oz_no_${q.id}`, title: "Recusar" }, { id: `oz_duv_${q.id}`, title: "Tenho dúvida" }] }];
  return [{ kind: "text", body: txt }];
}

/** Resposta do cliente à proposta (botões). A posse e a situação são conferidas no servidor. */
function respostaProposta(ctx: Ctx, rid: string): Outgoing[] {
  const m = /^oz_(ok|no|duv)_(\d{1,9})$/.exec(rid);
  if (!m) return menu(ctx);
  const q = store(ctx).get(ctx.tenant.id, Number(m[2]));
  if (!q || q.contact_id !== ctx.contact.id) return [{ kind: "text", body: "Não encontrei esse orçamento. Digite MEU ORÇAMENTO para ver o mais recente." }];
  if (q.status !== "enviado") return [{ kind: "text", body: statusTexto(q, ctx.tenant.timezone) }];
  if (q.validade_ate && new Date(q.validade_ate) <= ctx.now) {
    store(ctx).setStatus(ctx.tenant.id, q.id, "expirado", ctx.now);
    return [{ kind: "text", body: statusTexto({ ...q, status: "expirado" }, ctx.tenant.timezone) }];
  }
  if (m[1] === "ok") {
    store(ctx).setStatus(ctx.tenant.id, q.id, "aceito", ctx.now);
    ctx.env.repo.event(ctx.tenant.id, "orcamento_aceito", { id: q.id, valor: q.valor_cents }, ctx.now);
    return [{ kind: "text", body: `Combinado! Orçamento #${q.numero} aceito (${formatBRL(q.valor_cents ?? 0)}). A equipe vai falar com você para combinar a data e os detalhes.` }];
  }
  if (m[1] === "no") {
    store(ctx).setStatus(ctx.tenant.id, q.id, "recusado", ctx.now);
    ctx.env.repo.event(ctx.tenant.id, "orcamento_recusado", { id: q.id }, ctx.now);
    data(ctx).recusando = q.id;
    ctx.conv.state = "motivo";
    return [{ kind: "buttons", body: "Tudo bem, obrigado por avisar. Se quiser, conte o motivo (preço, prazo, outro fornecedor…) para a gente melhorar.", buttons: [{ id: "mo_pular", title: "Prefiro não dizer" }] }];
  }
  return requestHandoff(ctx, `dúvida sobre o orçamento #${q.numero}`, "Claro! Já chamei alguém da equipe para tirar suas dúvidas sobre o orçamento. 🙂");
}

async function receberFoto(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const max = ctx.settings.atendimento.max_fotos;
  if (pendentes(ctx).length >= max) return askFotos(ctx, `Já recebi o máximo de ${max} fotos. Toque em “Já enviei” para continuar.`);
  const dl = ctx.env.wa.downloadMedia;
  if (!msg.mediaId || !dl) return [{ kind: "text", body: "Não consegui receber essa foto. Tente enviar de novo ou descreva por texto." }];
  let arquivo;
  try {
    const f = await dl.call(ctx.env.wa, msg.mediaId);
    arquivo = salvarImagem(ctx.env.config.mediaDir, f.data, f.mime);
  } catch (e) {
    ctx.env.log.warn("foto_nao_baixada", { erro: e instanceof Error ? e.message : String(e) });
    return [{ kind: "text", body: "Não consegui baixar essa foto agora. Pode enviar de novo? Se preferir, toque em “Sem fotos”." }];
  }
  if (!arquivo.ok) return [{ kind: "text", body: `Não consegui usar esse arquivo (${arquivo.motivo}). Envie uma foto em JPEG, PNG ou WebP de até 5 MB.` }];
  // Reconfere o limite agora que o download terminou (várias fotos podem chegar juntas).
  if (pendentes(ctx).length >= max) { removerImagem(ctx.env.config.mediaDir, arquivo.arquivo); return askFotos(ctx, `Já recebi o máximo de ${max} fotos. Toque em “Já enviei” para continuar.`); }
  store(ctx).addFoto(ctx.tenant.id, ctx.contact.id, arquivo, ctx.now);
  const n = pendentes(ctx).length;
  if (n >= max) return avancaDepoisFotos(ctx, `Foto ${n} de ${max} recebida. Chegamos ao limite de fotos.`);
  return [{ kind: "buttons", body: `Foto ${n} de ${max} recebida. Pode enviar mais ou tocar em “Já enviei”.`, buttons: [{ id: "f_fim", title: "Já enviei" }] }];
}

function avancaDepoisFotos(ctx: Ctx, aviso?: string): Outgoing[] {
  const prox = askBairro(ctx);
  return aviso ? [{ kind: "text", body: aviso }, ...prox] : prox;
}

export async function handleOrca(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const s = ctx.settings, d = data(ctx);
  const rid = msg.replyId ?? "";
  const raw = msg.type === "image" ? "" : (msg.text ?? "").trim();
  const text = normalize(raw);

  if (msg.type === "image") {
    if (ctx.conv.state === "fotos") return receberFoto(ctx, msg);
    return [{ kind: "text", body: "Recebi a foto, mas ainda não estamos na etapa de fotos. Toque em “Pedir orçamento” e eu peço na hora certa. 🙂" }, ...menu(ctx)];
  }
  if (msg.type !== "text" && msg.type !== "button" && msg.type !== "list") {
    return [{ kind: "text", body: "Só consigo entender texto, botões e fotos. Digite MENU para ver as opções ou ATENDENTE para falar com uma pessoa." }];
  }

  if (/^oz_(ok|no|duv)_\d+$/.test(rid)) return respostaProposta(ctx, rid);
  if (rid === "m_meu" || /\b(meu orcamento|status|situacao|andamento)\b/.test(text)) return meuOrcamento(ctx);
  if (rid === "m_menu" || MENU_W.has(text) || isGreeting(text)) {
    if (ctx.conv.state === "fotos" || ctx.conv.state === "confirmar") descartaPendentes(ctx);
    return menu(ctx);
  }
  if (rid === "m_novo" || (ctx.conv.state === "inicio" && /\b(pedir orcamento|fazer orcamento|quero um orcamento|orcamento)\b/.test(text))) {
    descartaPendentes(ctx);
    limpaFluxo(ctx);
    return askServico(ctx);
  }
  if (rid === "m_duvida") { ctx.conv.state = "inicio"; return [{ kind: "text", body: "Pode perguntar! Respondo o que estiver cadastrado (serviços, regiões, horários). Se eu não souber, chamo uma pessoa." }]; }

  switch (ctx.conv.state) {
    case "servico": {
      const id = rid.startsWith("s_") ? rid.slice(2) : s.servicos.find((x) => normalize(x.nome) === text)?.id;
      if (!id || !s.servicos.some((x) => x.id === id)) return askServico(ctx, "Não entendi. Escolha um serviço da lista:");
      d.servico = id;
      return askDescricao(ctx);
    }
    case "descricao": {
      const t = sanitize(raw, 600);
      if (t.length < 10) return [{ kind: "text", body: "Conte um pouco mais (pelo menos uma frase) para a equipe entender o que precisa." }];
      d.descricao = t;
      return askFotos(ctx);
    }
    case "fotos": {
      if (rid === "f_fim" || rid === "f_pular" || ["ja enviei", "pronto", "terminei", "sem fotos", "nao tenho", "pular"].includes(text)) return askBairro(ctx);
      return askFotos(ctx, "Envie as fotos aqui na conversa (ou toque no botão para continuar).");
    }
    case "bairro": {
      const lista = s.atendimento.bairros;
      let nome: string | undefined;
      if (lista.length) {
        const idx = rid.startsWith("b_") ? Number(rid.slice(2)) : lista.findIndex((x) => normalize(x) === text || (text.length > 3 && normalize(x).includes(text)));
        nome = lista[idx];
        if (!nome) return [{ kind: "text", body: `Ainda não atendemos esse bairro. 😕 Atendemos: ${lista.join(", ")}. Se achar que é um engano, digite ATENDENTE.` }];
      } else {
        nome = sanitize(raw, 40);
        if (nome.length < 2) return [{ kind: "text", body: "Escreva o nome do bairro, por favor." }];
      }
      d.bairro = nome;
      return s.atendimento.pedir_endereco ? askEndereco(ctx) : askPeriodo(ctx);
    }
    case "endereco": {
      const e = sanitize(raw, 160);
      if (e.length < 8) return [{ kind: "text", body: "Preciso do endereço completo: rua, número e ponto de referência." }];
      d.endereco = e;
      return askPeriodo(ctx);
    }
    case "periodo": {
      const p = rid.startsWith("p_") ? rid.slice(2) : text.includes("manha") ? "manha" : text.includes("tarde") ? "tarde" : text.includes("tanto") || text.includes("qualquer") ? "qualquer" : "";
      if (p !== "manha" && p !== "tarde" && p !== "qualquer") return askPeriodo(ctx);
      d.periodo = p;
      return askNome(ctx);
    }
    case "nome": {
      const n = sanitize(raw, 60);
      if (n.length < 2) return [{ kind: "text", body: "Pode me dizer seu nome? (mínimo 2 letras)" }];
      d.nome = n;
      return askConfirmar(ctx);
    }
    case "confirmar": {
      if (rid === "c_sim" || SIM.has(text)) return enviar(ctx);
      if (rid === "c_nao" || NAO.has(text)) { descartaPendentes(ctx); return menu(ctx, "Tudo bem, pedido cancelado. Posso ajudar com mais alguma coisa?"); }
      return askConfirmar(ctx);
    }
    case "motivo": {
      const id = d.recusando;
      if (id && rid !== "mo_pular" && text.length > 1 && !["nao", "pular"].includes(text)) {
        ctx.env.db.run("UPDATE quotes SET recusa_motivo = ?, updated_at = ? WHERE tenant_id = ? AND id = ? AND contact_id = ?", sanitize(raw, 300), ctx.now.toISOString(), ctx.tenant.id, id, ctx.contact.id);
      }
      return menu(ctx, "Obrigado pelo retorno! Quando precisar de um novo orçamento, é só chamar.");
    }
  }

  // Estado "inicio": dúvidas (FAQ / IA restrita à base) ou encaminhamento humano
  const ans = await answerFromKnowledge(knowledge(s), raw, ctx.env.ai);
  if (ans.found) return [{ kind: "text", body: ans.answer }, { kind: "buttons", body: "Posso ajudar em mais alguma coisa?", buttons: [{ id: "m_novo", title: "Pedir orçamento" }, { id: "m_menu", title: "Menu" }] }];
  return requestHandoff(ctx, "pergunta sem resposta na base", ans.answer);
}
