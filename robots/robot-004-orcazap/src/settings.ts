import type { KnowledgeBase } from "../../../shared/ai/knowledge.ts";
import { Check, empresaFrom, faqFrom, mensagensFrom } from "../../../shared/utils/validate.ts";

export interface Servico { id: string; nome: string; exige_visita: boolean }
export interface OrcaSettings {
  empresa: { nome: string; endereco: string; telefone: string; horario_texto: string; pagamento: string; horario?: Record<string, { abre: string; fecha: string } | undefined> };
  servicos: Servico[];
  atendimento: { bairros: string[]; max_fotos: number; validade_dias: number; followup_horas: number; pedir_endereco: boolean };
  template: { nome: string; idioma: string };
  faq: { pergunta: string; resposta: string; palavras_chave?: string[] }[];
  mensagens: { boas_vindas?: string; handoff?: string };
}

export function defaultSettings(): OrcaSettings {
  return {
    empresa: { nome: "Minha Empresa de Serviços", endereco: "", telefone: "", horario_texto: "Segunda a sexta, 8h às 18h", pagamento: "Combinado na proposta" },
    servicos: [{ id: "servico-geral", nome: "Serviço geral", exige_visita: false }],
    atendimento: { bairros: [], max_fotos: 4, validade_dias: 7, followup_horas: 24, pedir_endereco: true },
    template: { nome: "", idioma: "pt_BR" },
    faq: [],
    mensagens: {},
  };
}

export function validateSettings(raw: unknown): { ok: true; value: OrcaSettings } | { ok: false; error: string } {
  const c = new Check();
  const r = c.obj(raw, "configuração");
  const empresa = empresaFrom(c, r.empresa);
  const servicos = c.arr(r.servicos, "servicos", 20).map((s, i) => {
    const o = c.obj(s, `servicos[${i}]`);
    return { id: c.id(o.id, `servicos[${i}].id`), nome: c.str(o.nome, `servicos[${i}].nome`, { max: 24 }), exige_visita: c.bool(o.exige_visita, `servicos[${i}].exige_visita`, false) };
  });
  if (servicos.length === 0) c.fail("servicos", "cadastre pelo menos 1 serviço");
  if (new Set(servicos.map((x) => x.id)).size !== servicos.length) c.fail("servicos", "ids de serviços repetidos");
  const a = c.obj(r.atendimento ?? {}, "atendimento");
  const bairros = c.arr(a.bairros ?? [], "atendimento.bairros", 100).map((b, i) => c.str(b, `atendimento.bairros[${i}]`, { max: 40 }));
  const atendimento = {
    bairros,
    max_fotos: c.num(a.max_fotos, "atendimento.max_fotos", { min: 1, max: 6, int: true, def: 4 }),
    validade_dias: c.num(a.validade_dias, "atendimento.validade_dias", { min: 1, max: 90, int: true, def: 7 }),
    followup_horas: c.num(a.followup_horas, "atendimento.followup_horas", { min: 2, max: 240, int: true, def: 24 }),
    pedir_endereco: c.bool(a.pedir_endereco, "atendimento.pedir_endereco", true),
  };
  const t = c.obj(r.template ?? {}, "template");
  const value: OrcaSettings = {
    empresa: { nome: empresa.nome, endereco: empresa.endereco, telefone: empresa.telefone, horario_texto: empresa.horario_texto, pagamento: empresa.pagamento, ...(empresa.horario ? { horario: empresa.horario } : {}) },
    servicos, atendimento,
    template: { nome: c.str(t.nome ?? "", "template.nome", { max: 100, optional: true }), idioma: c.str(t.idioma ?? "pt_BR", "template.idioma", { max: 10 }) },
    faq: faqFrom(c, r.faq, "faq"),
    mensagens: mensagensFrom(c, r.mensagens, ["boas_vindas", "handoff"]),
  };
  return c.result(value);
}

export function knowledge(s: OrcaSettings): KnowledgeBase {
  const lista = s.servicos.map((x) => x.nome).join(", ");
  return {
    empresa: { nome: s.empresa.nome, endereco: s.empresa.endereco, telefone: s.empresa.telefone, horario_texto: s.empresa.horario_texto, pagamento: s.empresa.pagamento },
    faq: [
      ...s.faq,
      { pergunta: "Quais serviços vocês fazem?", resposta: `Fazemos: ${lista}.`, palavras_chave: ["servico", "servicos", "fazem", "trabalham", "atendem"] },
      { pergunta: "Quanto custa? Qual o preço, valor ou orçamento?", resposta: "O valor depende do serviço e do local. Eu reúno as informações e as fotos aqui no WhatsApp e a equipe envia o orçamento. Toque em “Pedir orçamento” para começar.", palavras_chave: ["preco", "valor", "custa", "orcamento", "quanto"] },
      ...(s.atendimento.bairros.length ? [{ pergunta: "Quais bairros ou regiões vocês atendem?", resposta: `Atendemos: ${s.atendimento.bairros.join(", ")}.`, palavras_chave: ["bairro", "regiao", "atendem", "cidade", "area"] }] : []),
    ],
  };
}
