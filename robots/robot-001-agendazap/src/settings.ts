import type { KnowledgeBase } from "../../../shared/ai/knowledge.ts";
import { Check, empresaFrom, faqFrom, mensagensFrom } from "../../../shared/utils/validate.ts";
import type { Horario } from "../../../shared/utils/time.ts";

export interface Servico { id: string; nome: string; duracao_min: number; preco: number; profissionais?: string[] }
export interface Profissional { id: string; nome: string; horario: Horario; folgas: string[] }

export interface AgendaSettings {
  empresa: { nome: string; endereco: string; telefone: string; horario_texto: string; pagamento: string; horario?: Horario };
  servicos: Servico[];
  profissionais: Profissional[];
  agenda: { intervalo_min: number; antecedencia_horas: number; dias_max: number; cancelar_ate_horas: number };
  lembretes: { ativo: boolean; horas_antes: number[]; template_nome: string; template_idioma: string };
  lista_espera: { ativo: boolean; avisar_ate: number };
  faq: { pergunta: string; resposta: string; palavras_chave?: string[] }[];
  mensagens: { boas_vindas?: string; fora_horario?: string; handoff?: string; politica_cancelamento?: string };
}

const SEG_SEX = { "1": { abre: "09:00", fecha: "18:00" }, "2": { abre: "09:00", fecha: "18:00" }, "3": { abre: "09:00", fecha: "18:00" }, "4": { abre: "09:00", fecha: "18:00" }, "5": { abre: "09:00", fecha: "18:00" }, "6": { abre: "09:00", fecha: "13:00" } };

export function defaultSettings(): AgendaSettings {
  return {
    empresa: { nome: "Minha Empresa", endereco: "", telefone: "", horario_texto: "Seg a sex 9h–18h, sáb 9h–13h", pagamento: "Pix, dinheiro e cartão", horario: SEG_SEX },
    servicos: [{ id: "atendimento", nome: "Atendimento", duracao_min: 30, preco: 0 }],
    profissionais: [{ id: "equipe", nome: "Equipe", horario: SEG_SEX, folgas: [] }],
    agenda: { intervalo_min: 30, antecedencia_horas: 2, dias_max: 30, cancelar_ate_horas: 2 },
    lembretes: { ativo: true, horas_antes: [24, 2], template_nome: "", template_idioma: "pt_BR" },
    lista_espera: { ativo: true, avisar_ate: 3 },
    faq: [],
    mensagens: {},
  };
}

export function validateSettings(raw: unknown): { ok: true; value: AgendaSettings } | { ok: false; error: string } {
  const c = new Check();
  const r = c.obj(raw, "configuração");
  const empresa = empresaFrom(c, r.empresa);

  const profissionais = c.arr(r.profissionais, "profissionais", 30).map((p, i) => {
    const o = c.obj(p, `profissionais[${i}]`);
    return {
      id: c.id(o.id, `profissionais[${i}].id`),
      nome: c.str(o.nome, `profissionais[${i}].nome`, { max: 60 }),
      horario: c.horario(o.horario, `profissionais[${i}].horario`),
      folgas: c.arr(o.folgas ?? [], `profissionais[${i}].folgas`, 400).map((d, j) => c.date(d, `profissionais[${i}].folgas[${j}]`)),
    };
  });
  if (profissionais.length === 0) c.fail("profissionais", "cadastre pelo menos 1 profissional");
  const profIds = new Set(profissionais.map((p) => p.id));
  if (profIds.size !== profissionais.length) c.fail("profissionais", "ids repetidos");

  const servicos = c.arr(r.servicos, "servicos", 60).map((s, i) => {
    const o = c.obj(s, `servicos[${i}]`);
    const profs = o.profissionais === undefined ? undefined : c.arr(o.profissionais, `servicos[${i}].profissionais`, 30).map(String);
    for (const pid of profs ?? []) if (!profIds.has(pid)) c.fail(`servicos[${i}].profissionais`, `profissional "${pid}" não existe`);
    return {
      id: c.id(o.id, `servicos[${i}].id`),
      nome: c.str(o.nome, `servicos[${i}].nome`, { max: 60 }),
      duracao_min: c.num(o.duracao_min, `servicos[${i}].duracao_min`, { min: 5, max: 480, int: true }),
      preco: c.num(o.preco, `servicos[${i}].preco`, { min: 0, max: 100000 }),
      ...(profs ? { profissionais: profs } : {}),
    };
  });
  if (servicos.length === 0) c.fail("servicos", "cadastre pelo menos 1 serviço");
  if (new Set(servicos.map((s) => s.id)).size !== servicos.length) c.fail("servicos", "ids repetidos");

  const a = c.obj(r.agenda ?? {}, "agenda");
  const l = c.obj(r.lembretes ?? {}, "lembretes");
  const w = c.obj(r.lista_espera ?? {}, "lista_espera");
  const horas = c.arr(l.horas_antes ?? [24, 2], "lembretes.horas_antes", 4).map((n, i) => c.num(n, `lembretes.horas_antes[${i}]`, { min: 1, max: 168, int: true }));

  const value: AgendaSettings = {
    empresa: { nome: empresa.nome, endereco: empresa.endereco, telefone: empresa.telefone, horario_texto: empresa.horario_texto, pagamento: empresa.pagamento, ...(empresa.horario ? { horario: empresa.horario } : {}) },
    servicos, profissionais,
    agenda: {
      intervalo_min: c.num(a.intervalo_min, "agenda.intervalo_min", { min: 5, max: 240, int: true, def: 30 }),
      antecedencia_horas: c.num(a.antecedencia_horas, "agenda.antecedencia_horas", { min: 0, max: 72, def: 2 }),
      dias_max: c.num(a.dias_max, "agenda.dias_max", { min: 1, max: 90, int: true, def: 30 }),
      cancelar_ate_horas: c.num(a.cancelar_ate_horas, "agenda.cancelar_ate_horas", { min: 0, max: 72, def: 2 }),
    },
    lembretes: {
      ativo: c.bool(l.ativo, "lembretes.ativo", true),
      horas_antes: [...new Set(horas)].sort((x, y) => y - x),
      template_nome: c.str(l.template_nome ?? "", "lembretes.template_nome", { max: 100, optional: true }),
      template_idioma: c.str(l.template_idioma ?? "pt_BR", "lembretes.template_idioma", { max: 10 }),
    },
    lista_espera: { ativo: c.bool(w.ativo, "lista_espera.ativo", true), avisar_ate: c.num(w.avisar_ate, "lista_espera.avisar_ate", { min: 1, max: 10, int: true, def: 3 }) },
    faq: faqFrom(c, r.faq, "faq"),
    mensagens: mensagensFrom(c, r.mensagens, ["boas_vindas", "fora_horario", "handoff", "politica_cancelamento"]),
  };
  return c.result(value);
}

export function knowledge(s: AgendaSettings): KnowledgeBase {
  const servicosTxt = s.servicos.map((x) => `${x.nome}: ${x.duracao_min} min, R$ ${x.preco.toFixed(2).replace(".", ",")}`).join("; ");
  return {
    empresa: { nome: s.empresa.nome, endereco: s.empresa.endereco, telefone: s.empresa.telefone, horario_texto: s.empresa.horario_texto, pagamento: s.empresa.pagamento },
    faq: [
      ...s.faq,
      { pergunta: "Quais serviços e preços vocês têm? valores tabela", resposta: `Nossos serviços: ${servicosTxt}.`, palavras_chave: ["servicos", "preco", "valor", "quanto custa", "tabela"] },
    ],
    politicas: s.mensagens.politica_cancelamento ? [s.mensagens.politica_cancelamento] : [`Cancelamentos e remarcações até ${s.agenda.cancelar_ate_horas}h antes do horário.`],
  };
}
