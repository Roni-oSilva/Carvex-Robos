import type { KnowledgeBase } from "../../../shared/ai/knowledge.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { parseHHMM } from "../../../shared/utils/time.ts";
import { Check, empresaFrom, faqFrom, mensagensFrom } from "../../../shared/utils/validate.ts";

export type Finalidade = "comprar" | "alugar";
export interface Tipo { id: string; nome: string }
export interface Faixa { nome: string; min: number; max: number }
export interface Imovel { id: string; finalidade: Finalidade; tipo: string; titulo: string; bairro: string; preco: number; quartos: number; descricao: string; link: string; disponivel: boolean }
export interface Corretor { id: string; nome: string; bairros: string[] }
export interface LeadSettings {
  empresa: { nome: string; endereco: string; telefone: string; horario_texto: string; pagamento: string; horario?: Record<string, { abre: string; fecha: string } | undefined> };
  tipos: Tipo[];
  bairros: string[];
  faixas: { comprar: Faixa[]; alugar: Faixa[] };
  imoveis: Imovel[];
  corretores: Corretor[];
  visitas: { ativo: boolean; dias_semana: number[]; horarios: string[]; janela_dias: number; antecedencia_horas: number; lembrete_horas: number };
  followup: { horas: number; sem_resposta_dias: number };
  template: { nome: string; idioma: string };
  faq: { pergunta: string; resposta: string; palavras_chave?: string[] }[];
  mensagens: { boas_vindas?: string; handoff?: string };
}

export const cents = (reais: number): number => Math.round(reais * 100);

export function defaultSettings(): LeadSettings {
  return {
    empresa: { nome: "Minha Imobiliária", endereco: "", telefone: "", horario_texto: "Segunda a sexta, 9h às 18h", pagamento: "Condições definidas por imóvel" },
    tipos: [{ id: "apartamento", nome: "Apartamento" }, { id: "casa", nome: "Casa" }],
    bairros: [],
    faixas: {
      comprar: [{ nome: "Até R$ 300 mil", min: 0, max: 300000 }, { nome: "R$ 300 a 600 mil", min: 300000, max: 600000 }, { nome: "Acima de R$ 600 mil", min: 600000, max: 100000000 }],
      alugar: [{ nome: "Até R$ 1.500", min: 0, max: 1500 }, { nome: "R$ 1.500 a 3.000", min: 1500, max: 3000 }, { nome: "Acima de R$ 3.000", min: 3000, max: 1000000 }],
    },
    imoveis: [],
    corretores: [],
    visitas: { ativo: true, dias_semana: [1, 2, 3, 4, 5, 6], horarios: ["09:00", "11:00", "14:00", "16:00"], janela_dias: 7, antecedencia_horas: 4, lembrete_horas: 24 },
    followup: { horas: 48, sem_resposta_dias: 7 },
    template: { nome: "", idioma: "pt_BR" },
    faq: [],
    mensagens: {},
  };
}

export function validateSettings(raw: unknown): { ok: true; value: LeadSettings } | { ok: false; error: string } {
  const c = new Check();
  const r = c.obj(raw, "configuração");
  const empresa = empresaFrom(c, r.empresa);

  const tipos = c.arr(r.tipos, "tipos", 10).map((t, i) => {
    const o = c.obj(t, `tipos[${i}]`);
    return { id: c.id(o.id, `tipos[${i}].id`), nome: c.str(o.nome, `tipos[${i}].nome`, { max: 24 }) };
  });
  if (tipos.length === 0) c.fail("tipos", "cadastre pelo menos 1 tipo de imóvel");
  if (new Set(tipos.map((x) => x.id)).size !== tipos.length) c.fail("tipos", "ids de tipos repetidos");

  const bairros = c.arr(r.bairros ?? [], "bairros", 100).map((b, i) => c.str(b, `bairros[${i}]`, { max: 40 }));

  const fx = c.obj(r.faixas ?? {}, "faixas");
  const faixasDe = (k: Finalidade): Faixa[] => {
    const lista = c.arr(fx[k] ?? [], `faixas.${k}`, 3).map((f, i) => {
      const o = c.obj(f, `faixas.${k}[${i}]`);
      const min = c.num(o.min, `faixas.${k}[${i}].min`, { min: 0, max: 1e9 });
      const max = c.num(o.max, `faixas.${k}[${i}].max`, { min: 1, max: 1e9 });
      if (max <= min) c.fail(`faixas.${k}[${i}]`, "max deve ser maior que min");
      return { nome: c.str(o.nome, `faixas.${k}[${i}].nome`, { max: 20 }), min, max };
    });
    return lista;
  };
  const faixas = { comprar: faixasDe("comprar"), alugar: faixasDe("alugar") };
  if (faixas.comprar.length === 0 && faixas.alugar.length === 0) c.fail("faixas", "cadastre faixas de valor para comprar e/ou alugar (até 3 cada)");

  const imoveis = c.arr(r.imoveis ?? [], "imoveis", 300).map((im, i) => {
    const p = `imoveis[${i}]`;
    const o = c.obj(im, p);
    const fin = String(o.finalidade);
    if (fin !== "comprar" && fin !== "alugar") c.fail(`${p}.finalidade`, 'use "comprar" ou "alugar"');
    const tipo = c.str(o.tipo, `${p}.tipo`, { max: 40 });
    if (tipo && !tipos.some((t) => t.id === tipo)) c.fail(`${p}.tipo`, "tipo não cadastrado em tipos");
    const link = c.str(o.link ?? "", `${p}.link`, { max: 300, optional: true });
    if (link && !/^https:\/\//.test(link)) c.fail(`${p}.link`, "use um endereço começando com https://");
    return {
      id: c.id(o.id, `${p}.id`), finalidade: (fin === "alugar" ? "alugar" : "comprar") as Finalidade, tipo, titulo: c.str(o.titulo, `${p}.titulo`, { max: 80 }),
      bairro: c.str(o.bairro, `${p}.bairro`, { max: 40 }), preco: c.num(o.preco, `${p}.preco`, { min: 1, max: 1e9 }), quartos: c.num(o.quartos ?? 0, `${p}.quartos`, { min: 0, max: 20, int: true, def: 0 }),
      descricao: c.str(o.descricao ?? "", `${p}.descricao`, { max: 300, optional: true }), link, disponivel: c.bool(o.disponivel, `${p}.disponivel`, true),
    };
  });
  if (new Set(imoveis.map((x) => x.id)).size !== imoveis.length) c.fail("imoveis", "ids de imóveis repetidos");

  const corretores = c.arr(r.corretores ?? [], "corretores", 30).map((x, i) => {
    const o = c.obj(x, `corretores[${i}]`);
    return { id: c.id(o.id, `corretores[${i}].id`), nome: c.str(o.nome, `corretores[${i}].nome`, { max: 40 }), bairros: c.arr(o.bairros ?? [], `corretores[${i}].bairros`, 100).map((b, j) => c.str(b, `corretores[${i}].bairros[${j}]`, { max: 40 })) };
  });
  if (new Set(corretores.map((x) => x.id)).size !== corretores.length) c.fail("corretores", "ids de corretores repetidos");

  const v = c.obj(r.visitas ?? {}, "visitas");
  const horarios = c.arr(v.horarios ?? ["09:00", "11:00", "14:00", "16:00"], "visitas.horarios", 12).map((hh, i) => {
    const s = c.str(hh, `visitas.horarios[${i}]`, { max: 5 });
    if (s && parseHHMM(s) === null) c.fail(`visitas.horarios[${i}]`, 'formato "HH:MM"');
    return s;
  });
  const dias = c.arr(v.dias_semana ?? [1, 2, 3, 4, 5, 6], "visitas.dias_semana", 7).map((d, i) => c.num(d, `visitas.dias_semana[${i}]`, { min: 0, max: 6, int: true }));
  const visitas = {
    ativo: c.bool(v.ativo, "visitas.ativo", true), dias_semana: dias, horarios,
    janela_dias: c.num(v.janela_dias, "visitas.janela_dias", { min: 1, max: 14, int: true, def: 7 }),
    antecedencia_horas: c.num(v.antecedencia_horas, "visitas.antecedencia_horas", { min: 1, max: 48, int: true, def: 4 }),
    lembrete_horas: c.num(v.lembrete_horas, "visitas.lembrete_horas", { min: 2, max: 72, int: true, def: 24 }),
  };
  if (visitas.ativo && (horarios.length === 0 || dias.length === 0)) c.fail("visitas", "informe horarios e dias_semana ou desative com ativo=false");

  const f = c.obj(r.followup ?? {}, "followup");
  const t = c.obj(r.template ?? {}, "template");
  const value: LeadSettings = {
    empresa: { nome: empresa.nome, endereco: empresa.endereco, telefone: empresa.telefone, horario_texto: empresa.horario_texto, pagamento: empresa.pagamento, ...(empresa.horario ? { horario: empresa.horario } : {}) },
    tipos, bairros, faixas, imoveis, corretores, visitas,
    followup: { horas: c.num(f.horas, "followup.horas", { min: 2, max: 720, int: true, def: 48 }), sem_resposta_dias: c.num(f.sem_resposta_dias, "followup.sem_resposta_dias", { min: 1, max: 90, int: true, def: 7 }) },
    template: { nome: c.str(t.nome ?? "", "template.nome", { max: 100, optional: true }), idioma: c.str(t.idioma ?? "pt_BR", "template.idioma", { max: 10 }) },
    faq: faqFrom(c, r.faq, "faq"),
    mensagens: mensagensFrom(c, r.mensagens, ["boas_vindas", "handoff"]),
  };
  return c.result(value);
}

export function knowledge(s: LeadSettings): KnowledgeBase {
  return {
    empresa: { nome: s.empresa.nome, endereco: s.empresa.endereco, telefone: s.empresa.telefone, horario_texto: s.empresa.horario_texto, pagamento: s.empresa.pagamento },
    faq: [
      ...s.faq,
      ...(s.bairros.length ? [{ pergunta: "Quais bairros e regiões vocês atendem?", resposta: `Trabalhamos com imóveis em: ${s.bairros.join(", ")}.`, palavras_chave: ["bairro", "bairros", "regiao", "atendem", "cidade"] }] : []),
      { pergunta: "Qual o preço de um imóvel? Valores, quanto custa?", resposta: "Cada imóvel tem o seu valor. Toque em “Quero comprar” ou “Quero alugar”, responda algumas perguntas e eu mostro as opções cadastradas dentro do seu orçamento.", palavras_chave: ["preco", "valor", "custa", "quanto", "imovel", "imoveis"] },
    ],
  };
}

export const faixaTexto = (f: Faixa): string => `${formatBRL(cents(f.min))} a ${formatBRL(cents(f.max))}`;
