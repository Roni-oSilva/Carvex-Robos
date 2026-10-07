import type { KnowledgeBase } from "../../../shared/ai/knowledge.ts";
import { Check, empresaFrom, faqFrom, mensagensFrom } from "../../../shared/utils/validate.ts";
import { parseHHMM } from "../../../shared/utils/time.ts";
import { normalize } from "../../../shared/utils/text.ts";

export interface PassoRegua { id: string; dias: number; mensagem?: string }

export interface CobraSettings {
  empresa: { nome: string; endereco: string; telefone: string; horario_texto: string; pagamento: string; horario?: Record<string, { abre: string; fecha: string } | undefined> };
  pix: { chave: string; beneficiario: string; cidade: string };
  regua: PassoRegua[];
  envio: { inicio: string; fim: string; dias_semana: number[]; max_por_semana: number; intervalo_horas: number };
  exigir_confirmacao_titular: boolean;
  negociacao: { ativo: boolean; max_parcelas: number; parcela_minima: number; desconto_a_vista_percentual: number; validade_dias: number };
  template: { nome: string; idioma: string };
  faq: { pergunta: string; resposta: string; palavras_chave?: string[] }[];
  mensagens: { handoff?: string };
}

/**
 * Termos que o robô NÃO aceita em mensagens de cobrança. O Código de Defesa do Consumidor (art. 42)
 * proíbe expor o consumidor a ridículo, constrangimento ou ameaça. Ameaças e menções a órgãos de
 * restrição/Justiça devem ser tratadas por um humano/advogado, nunca por automação.
 */
export const TERMOS_PROIBIDOS = ["spc", "serasa", "protesto", "protestar", "negativar", "negativacao", "nome sujo", "processo", "processar", "advogado", "justica", "policia", "delegacia", "cadeia", "preso", "vergonha", "calote", "caloteiro", "golpista", "vagabundo", "ladrao", "vamos expor", "expor"];

export function termoProibido(texto: string): string | null {
  const n = ` ${normalize(texto)} `;
  return TERMOS_PROIBIDOS.find((t) => n.includes(` ${t} `) || n.includes(` ${t}s `)) ?? null;
}

export function defaultSettings(): CobraSettings {
  return {
    empresa: { nome: "Minha Empresa", endereco: "", telefone: "", horario_texto: "Seg a sex 9h–18h", pagamento: "Pix", horario: { "1": { abre: "09:00", fecha: "18:00" }, "2": { abre: "09:00", fecha: "18:00" }, "3": { abre: "09:00", fecha: "18:00" }, "4": { abre: "09:00", fecha: "18:00" }, "5": { abre: "09:00", fecha: "18:00" } } },
    pix: { chave: "", beneficiario: "", cidade: "" },
    regua: [{ id: "antes-3", dias: -3 }, { id: "vence-hoje", dias: 0 }, { id: "atraso-3", dias: 3 }, { id: "atraso-7", dias: 7 }, { id: "atraso-15", dias: 15 }],
    envio: { inicio: "08:00", fim: "20:00", dias_semana: [1, 2, 3, 4, 5, 6], max_por_semana: 3, intervalo_horas: 48 },
    exigir_confirmacao_titular: true,
    negociacao: { ativo: true, max_parcelas: 3, parcela_minima: 50, desconto_a_vista_percentual: 0, validade_dias: 7 },
    template: { nome: "", idioma: "pt_BR" },
    faq: [],
    mensagens: {},
  };
}

export function validateSettings(raw: unknown): { ok: true; value: CobraSettings } | { ok: false; error: string } {
  const c = new Check();
  const r = c.obj(raw, "configuração");
  const empresa = empresaFrom(c, r.empresa);
  const px = c.obj(r.pix ?? {}, "pix");
  const pix = {
    chave: c.str(px.chave ?? "", "pix.chave", { max: 77, optional: true }),
    beneficiario: c.str(px.beneficiario ?? "", "pix.beneficiario", { max: 25, optional: true }),
    cidade: c.str(px.cidade ?? "", "pix.cidade", { max: 15, optional: true }),
  };
  if (pix.chave && (!pix.beneficiario || !pix.cidade)) c.fail("pix", "com chave Pix, informe também beneficiario e cidade");

  const regua = c.arr(r.regua, "regua", 12).map((p, i) => {
    const o = c.obj(p, `regua[${i}]`);
    const mensagem = o.mensagem === undefined ? undefined : c.str(o.mensagem, `regua[${i}].mensagem`, { max: 600 });
    if (mensagem) {
      const t = termoProibido(mensagem);
      if (t) c.fail(`regua[${i}].mensagem`, `contém o termo "${t}". Por segurança jurídica (CDC art. 42) o robô não envia ameaças nem menção a órgãos de restrição ou Justiça`);
    }
    return { id: c.id(o.id, `regua[${i}].id`), dias: c.num(o.dias, `regua[${i}].dias`, { min: -30, max: 365, int: true }), ...(mensagem ? { mensagem } : {}) };
  }).sort((a, b) => a.dias - b.dias);
  if (regua.length === 0) c.fail("regua", "defina pelo menos 1 passo");
  if (new Set(regua.map((p) => p.id)).size !== regua.length) c.fail("regua", "ids repetidos");

  const e = c.obj(r.envio ?? {}, "envio");
  const inicio = c.str(e.inicio ?? "08:00", "envio.inicio", { max: 5 }), fim = c.str(e.fim ?? "20:00", "envio.fim", { max: 5 });
  const ini = parseHHMM(inicio), fi = parseHHMM(fim);
  if (ini === null || fi === null) c.fail("envio", 'inicio e fim no formato "HH:MM"');
  else if (fi <= ini) c.fail("envio", "fim deve ser depois de inicio");
  else if (ini < 7 * 60 || fi > 21 * 60) c.fail("envio", "por respeito ao cliente, o robô só envia entre 07:00 e 21:00");
  const dias = c.arr(e.dias_semana ?? [1, 2, 3, 4, 5, 6], "envio.dias_semana", 7).map((d, i) => c.num(d, `envio.dias_semana[${i}]`, { min: 0, max: 6, int: true }));

  const n = c.obj(r.negociacao ?? {}, "negociacao");
  const t = c.obj(r.template ?? {}, "template");
  const value: CobraSettings = {
    empresa: { nome: empresa.nome, endereco: empresa.endereco, telefone: empresa.telefone, horario_texto: empresa.horario_texto, pagamento: empresa.pagamento, ...(empresa.horario ? { horario: empresa.horario } : {}) },
    pix, regua,
    envio: { inicio, fim, dias_semana: [...new Set(dias)], max_por_semana: c.num(e.max_por_semana, "envio.max_por_semana", { min: 1, max: 7, int: true, def: 3 }), intervalo_horas: c.num(e.intervalo_horas, "envio.intervalo_horas", { min: 24, max: 168, int: true, def: 48 }) },
    exigir_confirmacao_titular: c.bool(r.exigir_confirmacao_titular, "exigir_confirmacao_titular", true),
    negociacao: {
      ativo: c.bool(n.ativo, "negociacao.ativo", true),
      max_parcelas: c.num(n.max_parcelas, "negociacao.max_parcelas", { min: 1, max: 12, int: true, def: 3 }),
      parcela_minima: c.num(n.parcela_minima, "negociacao.parcela_minima", { min: 1, max: 100000, def: 50 }),
      desconto_a_vista_percentual: c.num(n.desconto_a_vista_percentual, "negociacao.desconto_a_vista_percentual", { min: 0, max: 50, def: 0 }),
      validade_dias: c.num(n.validade_dias, "negociacao.validade_dias", { min: 1, max: 30, int: true, def: 7 }),
    },
    template: { nome: c.str(t.nome ?? "", "template.nome", { max: 100, optional: true }), idioma: c.str(t.idioma ?? "pt_BR", "template.idioma", { max: 10 }) },
    faq: faqFrom(c, r.faq, "faq"),
    mensagens: mensagensFrom(c, r.mensagens, ["handoff"]),
  };
  for (const [i, f] of value.faq.entries()) {
    const bad = termoProibido(f.resposta);
    if (bad) c.fail(`faq[${i}].resposta`, `contém o termo "${bad}", não permitido em mensagens automáticas de cobrança`);
  }
  return c.result(value);
}

export function knowledge(s: CobraSettings): KnowledgeBase {
  return {
    empresa: { nome: s.empresa.nome, endereco: s.empresa.endereco, telefone: s.empresa.telefone, horario_texto: s.empresa.horario_texto, pagamento: s.empresa.pagamento },
    faq: s.faq,
  };
}
