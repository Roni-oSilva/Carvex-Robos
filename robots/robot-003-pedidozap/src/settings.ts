import type { KnowledgeBase } from "../../../shared/ai/knowledge.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import type { Horario } from "../../../shared/utils/time.ts";
import { Check, empresaFrom, faqFrom, mensagensFrom } from "../../../shared/utils/validate.ts";

export interface Variacao { id: string; nome: string; preco: number }
export interface Item { id: string; nome: string; descricao: string; preco: number; variacoes?: Variacao[]; disponivel: boolean }
export interface Categoria { id: string; nome: string; itens: Item[] }
export interface Bairro { nome: string; taxa: number; tempo_min: number }
export type FormaPagamento = "pix" | "dinheiro" | "cartao_entrega";

export interface PedidoSettings {
  empresa: { nome: string; endereco: string; telefone: string; horario_texto: string; pagamento: string; horario?: Horario };
  cardapio: Categoria[];
  entrega: { entrega_ativa: boolean; retirada_ativa: boolean; bairros: Bairro[]; pedido_minimo: number; tempo_retirada_min: number };
  pagamento: { formas: FormaPagamento[]; pix: { chave: string; beneficiario: string; cidade: string } };
  template: { nome: string; idioma: string };
  faq: { pergunta: string; resposta: string; palavras_chave?: string[] }[];
  mensagens: { boas_vindas?: string; fora_horario?: string; handoff?: string };
}

export const cents = (reais: number): number => Math.round(reais * 100);

export function defaultSettings(): PedidoSettings {
  const dia = { abre: "18:00", fecha: "23:30" };
  return {
    empresa: { nome: "Meu Restaurante", endereco: "", telefone: "", horario_texto: "Todos os dias, 18h às 23h30", pagamento: "Pix, dinheiro e cartão", horario: { "0": dia, "1": dia, "2": dia, "3": dia, "4": dia, "5": dia, "6": dia } },
    cardapio: [{ id: "lanches", nome: "Lanches", itens: [{ id: "lanche-exemplo", nome: "Lanche exemplo", descricao: "Edite o cardápio nas configurações", preco: 20, disponivel: true }] }],
    entrega: { entrega_ativa: true, retirada_ativa: true, bairros: [{ nome: "Centro", taxa: 5, tempo_min: 40 }], pedido_minimo: 0, tempo_retirada_min: 25 },
    pagamento: { formas: ["dinheiro", "cartao_entrega"], pix: { chave: "", beneficiario: "", cidade: "" } },
    template: { nome: "", idioma: "pt_BR" },
    faq: [],
    mensagens: {},
  };
}

const FORMAS = new Set<string>(["pix", "dinheiro", "cartao_entrega"]);

export function validateSettings(raw: unknown): { ok: true; value: PedidoSettings } | { ok: false; error: string } {
  const c = new Check();
  const r = c.obj(raw, "configuração");
  const empresa = empresaFrom(c, r.empresa);

  const cardapio = c.arr(r.cardapio, "cardapio", 10).map((cat, i) => {
    const o = c.obj(cat, `cardapio[${i}]`);
    const itens = c.arr(o.itens, `cardapio[${i}].itens`, 60).map((it, j) => {
      const p = `cardapio[${i}].itens[${j}]`;
      const x = c.obj(it, p);
      const variacoes = x.variacoes === undefined ? undefined : c.arr(x.variacoes, `${p}.variacoes`, 9).map((v, k) => {
        const vo = c.obj(v, `${p}.variacoes[${k}]`);
        return { id: c.id(vo.id, `${p}.variacoes[${k}].id`), nome: c.str(vo.nome, `${p}.variacoes[${k}].nome`, { max: 40 }), preco: c.num(vo.preco, `${p}.variacoes[${k}].preco`, { min: 0.01, max: 10000 }) };
      });
      const preco = variacoes?.length ? (variacoes[0]?.preco ?? 0) : c.num(x.preco, `${p}.preco`, { min: 0.01, max: 10000 });
      return {
        id: c.id(x.id, `${p}.id`), nome: c.str(x.nome, `${p}.nome`, { max: 60 }),
        descricao: c.str(x.descricao ?? "", `${p}.descricao`, { max: 200, optional: true }),
        preco, ...(variacoes?.length ? { variacoes } : {}), disponivel: c.bool(x.disponivel, `${p}.disponivel`, true),
      };
    });
    if (new Set(itens.map((x) => x.id)).size !== itens.length) c.fail(`cardapio[${i}].itens`, "ids de itens repetidos");
    return { id: c.id(o.id, `cardapio[${i}].id`), nome: c.str(o.nome, `cardapio[${i}].nome`, { max: 24 }), itens };
  });
  if (cardapio.length === 0) c.fail("cardapio", "cadastre pelo menos 1 categoria");
  if (new Set(cardapio.map((x) => x.id)).size !== cardapio.length) c.fail("cardapio", "ids de categorias repetidos");
  const todosIds = cardapio.flatMap((x) => x.itens.map((i) => i.id));
  if (new Set(todosIds).size !== todosIds.length) c.fail("cardapio", "o id de cada item deve ser único em todo o cardápio");

  const e = c.obj(r.entrega ?? {}, "entrega");
  const bairros = c.arr(e.bairros ?? [], "entrega.bairros", 80).map((b, i) => {
    const o = c.obj(b, `entrega.bairros[${i}]`);
    return { nome: c.str(o.nome, `entrega.bairros[${i}].nome`, { max: 40 }), taxa: c.num(o.taxa, `entrega.bairros[${i}].taxa`, { min: 0, max: 500 }), tempo_min: c.num(o.tempo_min, `entrega.bairros[${i}].tempo_min`, { min: 5, max: 240, int: true, def: 45 }) };
  });
  const entrega = {
    entrega_ativa: c.bool(e.entrega_ativa, "entrega.entrega_ativa", true), retirada_ativa: c.bool(e.retirada_ativa, "entrega.retirada_ativa", true),
    bairros, pedido_minimo: c.num(e.pedido_minimo, "entrega.pedido_minimo", { min: 0, max: 1000, def: 0 }),
    tempo_retirada_min: c.num(e.tempo_retirada_min, "entrega.tempo_retirada_min", { min: 5, max: 240, int: true, def: 25 }),
  };
  if (!entrega.entrega_ativa && !entrega.retirada_ativa) c.fail("entrega", "ative entrega e/ou retirada");
  if (entrega.entrega_ativa && bairros.length === 0) c.fail("entrega.bairros", "cadastre pelo menos 1 bairro atendido");

  const pg = c.obj(r.pagamento ?? {}, "pagamento");
  const formas = c.arr(pg.formas ?? ["pix", "dinheiro", "cartao_entrega"], "pagamento.formas", 3).map((f, i) => {
    const s = String(f);
    if (!FORMAS.has(s)) c.fail(`pagamento.formas[${i}]`, 'use "pix", "dinheiro" ou "cartao_entrega"');
    return s as FormaPagamento;
  });
  if (formas.length === 0) c.fail("pagamento.formas", "informe pelo menos 1 forma de pagamento");
  const px = c.obj(pg.pix ?? {}, "pagamento.pix");
  const pix = { chave: c.str(px.chave ?? "", "pagamento.pix.chave", { max: 77, optional: true }), beneficiario: c.str(px.beneficiario ?? "", "pagamento.pix.beneficiario", { max: 25, optional: true }), cidade: c.str(px.cidade ?? "", "pagamento.pix.cidade", { max: 15, optional: true }) };
  if (formas.includes("pix") && !pix.chave) c.fail("pagamento.pix", 'a forma "pix" exige chave, beneficiario e cidade');
  if (pix.chave && (!pix.beneficiario || !pix.cidade)) c.fail("pagamento.pix", "informe também beneficiario e cidade");

  const t = c.obj(r.template ?? {}, "template");
  const value: PedidoSettings = {
    empresa: { nome: empresa.nome, endereco: empresa.endereco, telefone: empresa.telefone, horario_texto: empresa.horario_texto, pagamento: empresa.pagamento, ...(empresa.horario ? { horario: empresa.horario } : {}) },
    cardapio, entrega, pagamento: { formas, pix },
    template: { nome: c.str(t.nome ?? "", "template.nome", { max: 100, optional: true }), idioma: c.str(t.idioma ?? "pt_BR", "template.idioma", { max: 10 }) },
    faq: faqFrom(c, r.faq, "faq"),
    mensagens: mensagensFrom(c, r.mensagens, ["boas_vindas", "fora_horario", "handoff"]),
  };
  return c.result(value);
}

export function knowledge(s: PedidoSettings): KnowledgeBase {
  const bairros = s.entrega.bairros.map((b) => `${b.nome}: taxa ${formatBRL(cents(b.taxa))}, ${b.tempo_min} min`).join("; ");
  return {
    empresa: { nome: s.empresa.nome, endereco: s.empresa.endereco, telefone: s.empresa.telefone, horario_texto: s.empresa.horario_texto, pagamento: s.empresa.pagamento },
    faq: [
      ...s.faq,
      ...(s.entrega.entrega_ativa ? [{ pergunta: "Vocês entregam? Qual a taxa de entrega e o tempo? Quais bairros atendem?", resposta: `Entregamos nestes bairros: ${bairros}.${s.entrega.pedido_minimo > 0 ? ` Pedido mínimo para entrega: ${formatBRL(cents(s.entrega.pedido_minimo))}.` : ""}`, palavras_chave: ["entrega", "taxa", "bairro", "frete", "entregam", "tempo"] }] : []),
    ],
  };
}

export function achaItem(s: PedidoSettings, itemId: string): { cat: Categoria; item: Item } | null {
  for (const cat of s.cardapio) { const item = cat.itens.find((i) => i.id === itemId); if (item) return { cat, item }; }
  return null;
}
