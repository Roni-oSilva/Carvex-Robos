import { answerFromKnowledge } from "../../../shared/ai/knowledge.ts";
import { requestHandoff } from "../../../shared/engine/engine.ts";
import { customMsg } from "../../../shared/engine/settings.ts";
import type { FlowContext } from "../../../shared/engine/types.ts";
import type { InboundMessage, Outgoing } from "../../../shared/whatsapp/types.ts";
import { clip, formatBRL, isGreeting, normalize } from "../../../shared/utils/text.ts";
import { localDateTimeLabel } from "../../../shared/utils/time.ts";
import { diasDisponiveis, horariosLivres, inicioDe, labelDia } from "./agenda.ts";
import { compativeis, escolherCorretor, pontuar, type Perfil } from "./match.ts";
import { cents, knowledge, type Finalidade, type Imovel, type LeadSettings } from "./settings.ts";
import { LeadStore, type Prazo, type Visit } from "./store.ts";

type Ctx = FlowContext<LeadSettings>;
interface D { fin?: Finalidade; tipo?: string; bairro?: string; faixa?: number; quartos?: number; prazo?: Prazo; nome?: string; lead?: number; imovel?: string; dia?: string; opts?: string[] }

const MENU_W = new Set(["menu", "inicio", "oi", "ola", "bom dia", "boa tarde", "boa noite", "opa"]);
const data = (ctx: Ctx): D => ctx.conv.data as D;
const store = (ctx: Ctx): LeadStore => new LeadStore(ctx.env.db);
const sanitize = (t: string, max: number): string => t.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const PRAZOS: Record<Prazo, string> = { urgente: "até 30 dias", curto: "de 1 a 3 meses", pesquisando: "só pesquisando" };

function limpa(ctx: Ctx): void {
  const d = data(ctx);
  for (const k of ["fin", "tipo", "bairro", "faixa", "quartos", "prazo", "nome", "lead", "imovel", "dia", "opts"] as const) delete d[k];
}

export function menu(ctx: Ctx, intro?: string): Outgoing[] {
  limpa(ctx);
  ctx.conv.state = "inicio";
  const body = intro ?? customMsg(ctx.settings, "boas_vindas", `Olá! Bem-vindo à ${ctx.settings.empresa.nome}. Vou te ajudar a encontrar o imóvel certo. O que você procura?`);
  const f = ctx.settings.faixas;
  const buttons = [
    ...(f.comprar.length ? [{ id: "m_comprar", title: "Quero comprar" }] : []),
    ...(f.alugar.length ? [{ id: "m_alugar", title: "Quero alugar" }] : []),
    { id: "m_corretor", title: "Falar com corretor" },
  ];
  return [{ kind: "buttons", body, buttons }];
}

// ---------------------------------------------------------------- qualificação
function askTipo(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "tipo";
  return [{ kind: "list", body: `Que tipo de imóvel você quer ${data(ctx).fin === "alugar" ? "alugar" : "comprar"}?`, button: "Escolher tipo", sectionTitle: "Tipos", rows: ctx.settings.tipos.map((t) => ({ id: `t_${t.id}`, title: clip(t.nome, 24) })) }];
}
function askBairro(ctx: Ctx, aviso?: string): Outgoing[] {
  const b = ctx.settings.bairros;
  ctx.conv.state = "bairro";
  if (b.length && b.length <= 10) return [{ kind: "list", body: aviso ?? "Em qual bairro você quer morar?", button: "Escolher bairro", sectionTitle: "Bairros", rows: b.map((x, i) => ({ id: `b_${i}`, title: clip(x, 24) })) }];
  return [{ kind: "text", body: aviso ?? "Em qual bairro você quer morar? (escreva o nome)" }];
}
function askFaixa(ctx: Ctx): Outgoing[] {
  const fx = ctx.settings.faixas[data(ctx).fin ?? "comprar"];
  ctx.conv.state = "faixa";
  return [{ kind: "buttons", body: `Qual faixa de valor cabe no seu bolso?${data(ctx).fin === "alugar" ? " (aluguel mensal)" : ""}`, buttons: fx.map((f, i) => ({ id: `fx_${i}`, title: clip(f.nome, 20) })) }];
}
function askQuartos(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "quartos";
  return [{ kind: "list", body: "Quantos quartos, no mínimo?", button: "Escolher", sectionTitle: "Quartos", rows: [{ id: "q_0", title: "Tanto faz" }, { id: "q_1", title: "1 quarto ou mais" }, { id: "q_2", title: "2 quartos ou mais" }, { id: "q_3", title: "3 quartos ou mais" }] }];
}
function askPrazo(ctx: Ctx): Outgoing[] {
  ctx.conv.state = "prazo";
  return [{ kind: "buttons", body: "Para quando você pretende fechar?", buttons: [{ id: "pz_urgente", title: "Até 30 dias" }, { id: "pz_curto", title: "1 a 3 meses" }, { id: "pz_pesquisando", title: "Só pesquisando" }] }];
}
function askNome(ctx: Ctx): Outgoing[] {
  const n = ctx.contact.nome?.trim();
  if (n) { data(ctx).nome = n.split(" ").slice(0, 3).join(" "); return criarLead(ctx); }
  ctx.conv.state = "nome";
  return [{ kind: "text", body: "Qual o seu nome?" }];
}

function perfilDe(ctx: Ctx): Perfil | null {
  const d = data(ctx);
  if (!d.fin || !d.tipo || !d.bairro || d.faixa === undefined) return null;
  const f = ctx.settings.faixas[d.fin][d.faixa];
  if (!f) return null;
  return { finalidade: d.fin, tipoId: d.tipo, bairro: d.bairro, minCents: cents(f.min), maxCents: cents(f.max), quartos: d.quartos ?? 0 };
}

function criarLead(ctx: Ctx): Outgoing[] {
  const d = data(ctx), s = ctx.settings;
  const p = perfilDe(ctx);
  const tipo = s.tipos.find((t) => t.id === d.tipo);
  if (!p || !tipo || !d.prazo || !d.nome) return menu(ctx, "Não consegui registrar o seu pedido. Vamos recomeçar?");
  const lista = compativeis(s, p);
  const { pontos, temperatura } = pontuar(d.prazo, lista.length > 0, p.quartos);
  const abertos: Record<string, number> = {};
  for (const r of ctx.env.db.all<{ corretor_id: string; n: number }>("SELECT corretor_id, COUNT(*) n FROM leads WHERE tenant_id = ? AND corretor_id IS NOT NULL AND status IN ('novo','em_contato','visita') GROUP BY corretor_id", ctx.tenant.id)) abertos[r.corretor_id] = r.n;
  const corretor = escolherCorretor(s, p.bairro, abertos);
  const faixa = s.faixas[p.finalidade][d.faixa!];
  const lead = store(ctx).criar({
    tenantId: ctx.tenant.id, contactId: ctx.contact.id, finalidade: p.finalidade, tipoId: tipo.id, tipoNome: tipo.nome, bairro: p.bairro, faixaNome: faixa.nome,
    faixaMinCents: p.minCents, faixaMaxCents: p.maxCents, quartos: p.quartos, prazo: d.prazo, nome: d.nome, temperatura, pontos, corretorId: corretor?.id ?? null, interesse: null,
  }, ctx.now);
  ctx.env.repo.event(ctx.tenant.id, "lead_novo", { id: lead.id, temperatura }, ctx.now);
  d.lead = lead.id;
  const resumo = `Anotei, ${d.nome.split(" ")[0]}! Procura ${p.finalidade === "alugar" ? "alugar" : "comprar"} ${tipo.nome.toLowerCase()} em ${p.bairro}, faixa ${faixa.nome}${p.quartos ? `, ${p.quartos}+ quartos` : ""}, ${PRAZOS[d.prazo]}.`;
  if (!lista.length) {
    ctx.conv.state = "inicio";
    return [{ kind: "text", body: `${resumo}\n\nNo momento não tenho imóvel cadastrado com esse perfil, mas já registrei o seu interesse (#${lead.numero})${corretor ? ` e ${corretor.nome} da nossa equipe` : " e um corretor da nossa equipe"} vai entrar em contato quando houver opções.` }];
  }
  return [{ kind: "text", body: resumo }, ...listaImoveis(ctx, lista)];
}

// ---------------------------------------------------------------- imóveis e visitas
const precoImovel = (i: Imovel): string => formatBRL(cents(i.preco)) + (i.finalidade === "alugar" ? "/mês" : "");

function listaImoveis(ctx: Ctx, lista: Imovel[]): Outgoing[] {
  data(ctx).opts = lista.map((i) => i.id);
  ctx.conv.state = "imoveis";
  return [{ kind: "list", body: `Encontrei ${lista.length} opç${lista.length === 1 ? "ão" : "ões"} cadastrada${lista.length === 1 ? "" : "s"} para você. Escolha uma para ver os detalhes:`, button: "Ver imóveis", sectionTitle: "Imóveis", rows: lista.map((i) => ({ id: `im_${i.id}`, title: clip(i.titulo, 24), description: clip(`${precoImovel(i)} · ${i.bairro}`, 72) })) }];
}

function detalhes(ctx: Ctx, im: Imovel): Outgoing[] {
  const d = data(ctx);
  d.imovel = im.id;
  ctx.conv.state = "detalhe";
  const lead = d.lead ? store(ctx).get(ctx.tenant.id, d.lead) : undefined;
  if (lead) {
    const p = pontuar(lead.prazo, true, lead.quartos, true, false);
    ctx.env.db.run("UPDATE leads SET imovel_interesse = ?, pontos = MAX(pontos, ?), temperatura = CASE WHEN ? > pontos THEN ? ELSE temperatura END, updated_at = ? WHERE id = ?", im.id, p.pontos, p.pontos, p.temperatura, ctx.now.toISOString(), lead.id);
  }
  const corpo = [`*${im.titulo}*`, `${precoImovel(im)} · ${im.bairro}${im.quartos ? ` · ${im.quartos} quarto(s)` : ""}`, ...(im.descricao ? [im.descricao] : []), ...(im.link ? [`Fotos e detalhes: ${im.link}`] : [])].join("\n");
  const botoes = [
    ...(ctx.settings.visitas.ativo ? [{ id: "iv", title: "Agendar visita" }] : []),
    { id: "io", title: "Ver outras opções" }, { id: "ic", title: "Falar com corretor" },
  ];
  return [{ kind: "buttons", body: corpo, buttons: botoes }];
}

function askDia(ctx: Ctx, aviso?: string): Outgoing[] {
  const d = data(ctx);
  const dias = diasDisponiveis(ctx.settings, store(ctx), ctx.tenant.id, d.imovel ?? "", ctx.now, ctx.tenant.timezone);
  if (!dias.length) return requestHandoff(ctx, "sem horários de visita livres", "No momento não há horários livres para visita. Vou chamar um corretor para combinar com você. 🙂");
  ctx.conv.state = "vdia";
  d.opts = dias.map((x) => x.ymd);
  return [{ kind: "list", body: aviso ?? "Em qual dia você quer visitar?", button: "Escolher dia", sectionTitle: "Dias disponíveis", rows: dias.map((x) => ({ id: `vd_${x.ymd}`, title: x.label })) }];
}
function askHora(ctx: Ctx, ymd: string): Outgoing[] {
  const d = data(ctx);
  const hs = horariosLivres(ctx.settings, store(ctx), ctx.tenant.id, d.imovel ?? "", ymd, ctx.now, ctx.tenant.timezone);
  if (!hs.length) return askDia(ctx, "Esse dia ficou sem horários. Escolha outro:");
  d.dia = ymd;
  ctx.conv.state = "vhora";
  return [{ kind: "list", body: `Horários livres em ${labelDia(ymd)}:`, button: "Escolher horário", sectionTitle: "Horários", rows: hs.slice(0, 10).map((h) => ({ id: `vh_${h}`, title: h })) }];
}
function agendar(ctx: Ctx, hhmm: string): Outgoing[] {
  const d = data(ctx), s = ctx.settings, st = store(ctx);
  const im = s.imoveis.find((i) => i.id === d.imovel && i.disponivel);
  const lead = d.lead ? st.get(ctx.tenant.id, d.lead) : st.ultimoDe(ctx.tenant.id, ctx.contact.id);
  if (!im || !lead || !d.dia) return menu(ctx, "Não consegui agendar. Vamos recomeçar?");
  if (!horariosLivres(s, st, ctx.tenant.id, im.id, d.dia, ctx.now, ctx.tenant.timezone).includes(hhmm)) return askHora(ctx, d.dia);
  const ativa = st.proximaVisitaDe(ctx.tenant.id, ctx.contact.id, ctx.now);
  if (ativa) st.setVisita(ctx.tenant.id, ativa.id, "cancelada", ctx.now); // uma visita ativa por pessoa: a nova substitui a antiga
  const v = st.criarVisita({ tenantId: ctx.tenant.id, leadId: lead.id, contactId: ctx.contact.id, imovelId: im.id, imovelTitulo: im.titulo, startsAt: inicioDe(d.dia, hhmm, ctx.tenant.timezone) }, ctx.now);
  const p = pontuar(lead.prazo, true, lead.quartos, true, true);
  ctx.env.db.run("UPDATE leads SET pontos = MAX(pontos, ?), temperatura = CASE WHEN ? > pontos THEN ? ELSE temperatura END WHERE id = ?", p.pontos, p.pontos, p.temperatura, lead.id);
  ctx.env.repo.event(ctx.tenant.id, "visita_agendada", { id: v.id }, ctx.now);
  limpa(ctx);
  ctx.conv.state = "inicio";
  return [{ kind: "text", body: `Visita agendada! ✅\n${im.titulo}\n${localDateTimeLabel(new Date(v.starts_at), ctx.tenant.timezone)}\n\nVou te lembrar antes e pedir a sua confirmação. Para ver, remarcar ou cancelar, digite MINHA VISITA.` }];
}

function minhaVisita(ctx: Ctx): Outgoing[] {
  const v = store(ctx).proximaVisitaDe(ctx.tenant.id, ctx.contact.id, ctx.now);
  if (!v) return [{ kind: "text", body: "Você não tem visita marcada. Quer procurar um imóvel?" }, ...menu(ctx)];
  return [{ kind: "buttons", body: `Sua visita: ${v.imovel_titulo}\n${localDateTimeLabel(new Date(v.starts_at), ctx.tenant.timezone)}${v.status === "confirmada" ? "\n(presença confirmada)" : ""}`, buttons: botoesVisita(v.id) }];
}
export const botoesVisita = (id: number) => [{ id: `vc_${id}`, title: "Confirmo" }, { id: `vr_${id}`, title: "Remarcar" }, { id: `vx_${id}`, title: "Cancelar visita" }];

function respostaVisita(ctx: Ctx, rid: string): Outgoing[] {
  const m = /^(vc|vr|vx)_(\d{1,9})$/.exec(rid);
  const st = store(ctx);
  const v: Visit | undefined = m ? st.visita(ctx.tenant.id, Number(m[2])) : undefined;
  if (!m || !v || v.contact_id !== ctx.contact.id || !["agendada", "confirmada"].includes(v.status)) return [{ kind: "text", body: "Não encontrei uma visita ativa para essa opção. Digite MINHA VISITA para ver a sua." }];
  if (new Date(v.starts_at) <= ctx.now) return [{ kind: "text", body: "Essa visita já passou. Quer marcar outra?" }, ...menu(ctx)];
  if (m[1] === "vc") {
    st.setVisita(ctx.tenant.id, v.id, "confirmada", ctx.now);
    ctx.env.repo.event(ctx.tenant.id, "visita_confirmada", { id: v.id }, ctx.now);
    return [{ kind: "text", body: `Presença confirmada para ${localDateTimeLabel(new Date(v.starts_at), ctx.tenant.timezone)}. Até lá! 🏠` }];
  }
  st.setVisita(ctx.tenant.id, v.id, "cancelada", ctx.now);
  ctx.env.repo.event(ctx.tenant.id, m[1] === "vr" ? "visita_remarcada" : "visita_cancelada", { id: v.id }, ctx.now);
  if (m[1] === "vx") return [{ kind: "text", body: "Visita cancelada. Se quiser marcar outra, é só chamar." }];
  const d = data(ctx);
  d.imovel = v.imovel_id; d.lead = v.lead_id;
  return askDia(ctx, "Sem problema! Escolha o novo dia:");
}

// ---------------------------------------------------------------- entrada
export async function handleLead(ctx: Ctx, msg: InboundMessage): Promise<Outgoing[]> {
  const s = ctx.settings, d = data(ctx);
  const rid = msg.replyId ?? "";
  const raw = (msg.text ?? "").trim();
  const text = normalize(raw);
  store(ctx).tocaCliente(ctx.tenant.id, ctx.contact.id, ctx.now);

  if (msg.type !== "text" && msg.type !== "button" && msg.type !== "list") {
    return [{ kind: "text", body: "Só consigo entender texto e botões por aqui. 🙂 Digite MENU para ver as opções ou CORRETOR para falar com uma pessoa." }];
  }

  if (/^v[crx]_\d+$/.test(rid)) return respostaVisita(ctx, rid);
  if (/\b(minha visita|ver visita|remarcar visita|cancelar visita)\b/.test(text)) return minhaVisita(ctx);
  if (rid === "m_corretor" || text === "corretor" || /\bfalar com (um )?corretor\b/.test(text)) return requestHandoff(ctx, "cliente quer falar com corretor", "Certo! Já chamei um corretor da equipe. Ele responde assim que possível, por aqui mesmo. 🙂");
  if (rid === "ic") return requestHandoff(ctx, "cliente quer falar com corretor sobre o imóvel", "Certo! Já chamei um corretor para falar sobre esse imóvel. 🙂");
  if (rid === "m_menu" || MENU_W.has(text) || isGreeting(text)) return menu(ctx);
  if (rid === "m_comprar" || rid === "m_alugar") {
    limpa(ctx);
    d.fin = rid === "m_alugar" ? "alugar" : "comprar";
    if (!s.faixas[d.fin].length) return menu(ctx, "Esse tipo de atendimento não está disponível no momento. O que você procura?");
    return askTipo(ctx);
  }

  switch (ctx.conv.state) {
    case "tipo": {
      const id = rid.startsWith("t_") ? rid.slice(2) : s.tipos.find((t) => normalize(t.nome) === text)?.id;
      if (!id || !s.tipos.some((t) => t.id === id)) return askTipo(ctx);
      d.tipo = id;
      return askBairro(ctx);
    }
    case "bairro": {
      const lista = s.bairros;
      let nome: string | undefined;
      if (lista.length) {
        const idx = rid.startsWith("b_") ? Number(rid.slice(2)) : lista.findIndex((x) => normalize(x) === text || (text.length > 3 && normalize(x).includes(text)));
        nome = lista[idx];
        if (!nome) return askBairro(ctx, `Não trabalhamos nessa região no momento. 😕 Atendemos: ${lista.join(", ")}. Escolha uma delas ou digite CORRETOR.`);
      } else {
        nome = sanitize(raw, 40);
        if (nome.length < 2) return [{ kind: "text", body: "Escreva o nome do bairro, por favor." }];
      }
      d.bairro = nome;
      return askFaixa(ctx);
    }
    case "faixa": {
      const fx = s.faixas[d.fin ?? "comprar"];
      const idx = rid.startsWith("fx_") ? Number(rid.slice(3)) : fx.findIndex((f) => normalize(f.nome) === text);
      if (!fx[idx]) return askFaixa(ctx);
      d.faixa = idx;
      return askQuartos(ctx);
    }
    case "quartos": {
      const n = rid.startsWith("q_") ? Number(rid.slice(2)) : /^[0-3]$/.test(text) ? Number(text) : -1;
      if (!(n >= 0 && n <= 3)) return askQuartos(ctx);
      d.quartos = n;
      return askPrazo(ctx);
    }
    case "prazo": {
      const pz = rid.startsWith("pz_") ? rid.slice(3) : text.includes("pesquis") ? "pesquisando" : "";
      if (pz !== "urgente" && pz !== "curto" && pz !== "pesquisando") return askPrazo(ctx);
      d.prazo = pz;
      return askNome(ctx);
    }
    case "nome": {
      const n = sanitize(raw, 60);
      if (n.length < 2) return [{ kind: "text", body: "Pode me dizer seu nome? (mínimo 2 letras)" }];
      d.nome = n;
      return criarLead(ctx);
    }
    case "imoveis": {
      const id = rid.startsWith("im_") ? rid.slice(3) : undefined;
      const im = id ? s.imoveis.find((i) => i.id === id && i.disponivel) : undefined;
      if (!im) return [{ kind: "text", body: "Escolha um dos imóveis da lista, ou digite CORRETOR para falar com uma pessoa." }];
      return detalhes(ctx, im);
    }
    case "detalhe": {
      if (rid === "io") {
        const lead = d.lead ? store(ctx).get(ctx.tenant.id, d.lead) : undefined;
        const f = lead ? { finalidade: lead.finalidade, tipoId: lead.tipo_id, bairro: lead.bairro, minCents: lead.faixa_min_cents, maxCents: lead.faixa_max_cents, quartos: lead.quartos } : null;
        const lista = f ? compativeis(s, f) : [];
        return lista.length ? listaImoveis(ctx, lista) : menu(ctx);
      }
      if (rid === "iv" && s.visitas.ativo) return askDia(ctx);
      return d.imovel ? detalhes(ctx, s.imoveis.find((i) => i.id === d.imovel) ?? s.imoveis[0]) : menu(ctx);
    }
    case "vdia": {
      const ymd = rid.startsWith("vd_") ? rid.slice(3) : "";
      if (!ymd || !(d.opts ?? []).includes(ymd)) return askDia(ctx);
      return askHora(ctx, ymd);
    }
    case "vhora": {
      const hhmm = rid.startsWith("vh_") ? rid.slice(3) : "";
      if (!/^\d{2}:\d{2}$/.test(hhmm)) return d.dia ? askHora(ctx, d.dia) : askDia(ctx);
      return agendar(ctx, hhmm);
    }
  }

  const ans = await answerFromKnowledge(knowledge(s), raw, ctx.env.ai);
  if (ans.found) return [{ kind: "text", body: ans.answer }, ...menu(ctx, "Posso ajudar em mais alguma coisa?")];
  return requestHandoff(ctx, "pergunta sem resposta na base", ans.answer);
}
