import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeWorld, type TestWorld } from "../../../shared/testing/helpers.ts";
import { leadRobot } from "../src/robot.ts";
import { defaultSettings, validateSettings, type LeadSettings } from "../src/settings.ts";
import { LeadStore } from "../src/store.ts";
import { compativeis, escolherCorretor, pontuar } from "../src/match.ts";
import { rodarAcompanhamento } from "../src/followup.ts";

const exemplo = JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")) as unknown;
const mk = (mut?: (s: LeadSettings) => void): LeadSettings => {
  const v = validateSettings(structuredClone(exemplo));
  if (!v.ok) throw new Error(v.error);
  mut?.(v.value);
  return v.value;
};
// Hoje = quarta 2026-10-07, 10:00 em São Paulo.
const T0 = new Date("2026-10-07T13:00:00Z");
const world = (mut?: (s: LeadSettings) => void) => makeWorld(leadRobot, { settings: mk(mut), now: T0 });
const ANA = "5511987654321";
type W = TestWorld<LeadSettings>;
const tap = (w: W, id: string, label = id, who = ANA) => w.say(who, label, { replyId: id });
const leads = (w: W) => w.env.db.all<Record<string, any>>("SELECT * FROM leads ORDER BY id");
const visitas = (w: W) => w.env.db.all<Record<string, any>>("SELECT * FROM visits ORDER BY id");

/** Alugar apartamento no Centro, até R$ 3.000, 2+ quartos, urgente. */
async function qualificaAluguel(w: W, prazo = "pz_urgente", who = ANA) {
  await w.say(who, "oi", { name: "Ana Paula" });
  await tap(w, "m_alugar", "Quero alugar", who);
  await tap(w, "t_apartamento", "Apartamento", who);
  await tap(w, "b_0", "Centro", who);
  await tap(w, "fx_1", "R$ 1.500 a 3.000", who);
  await tap(w, "q_2", "2 quartos ou mais", who);
  await tap(w, prazo, "prazo", who);
}

test("configuração de exemplo e padrão são válidas; erros são claros", () => {
  assert.ok(validateSettings(exemplo).ok);
  assert.ok(validateSettings(defaultSettings()).ok);
  const a = structuredClone(exemplo) as any; a.imoveis[0].tipo = "submarino";
  assert.match((validateSettings(a) as any).error, /tipo não cadastrado/);
  const b = structuredClone(exemplo) as any; b.faixas.comprar[0].max = 0.5; b.faixas.comprar[0].min = 0;
  assert.match((validateSettings(b) as any).error, /faixas\.comprar\[0\]/);
  const c = structuredClone(exemplo) as any; c.imoveis[1].id = c.imoveis[0].id;
  assert.match((validateSettings(c) as any).error, /ids de imóveis repetidos/);
  const d = structuredClone(exemplo) as any; d.imoveis[0].link = "http://inseguro";
  assert.match((validateSettings(d) as any).error, /https/);
  const e = structuredClone(exemplo) as any; e.faixas.alugar.push({ nome: "x", min: 1, max: 2 }, { nome: "y", min: 1, max: 2 });
  assert.match((validateSettings(e) as any).error, /no máximo 3/);
});

test("qualificação completa mostra só imóveis cadastrados que cabem no perfil", async () => {
  const w = world();
  await qualificaAluguel(w);
  const t = w.drain(ANA).join("\n");
  assert.match(t, /Procura alugar apartamento em Centro/);
  assert.match(t, /Apartamento 2 quartos n/);
  assert.ok(!t.includes("Kitnet"), "1 quarto não atende ao mínimo de 2 quartos");
  assert.ok(!t.includes("Casa 3 quartos"));
  const l = leads(w)[0];
  assert.equal(l.status, "novo");
  assert.equal(l.faixa_nome, "R$ 1.500 a 3.000");
  assert.equal(l.corretor_id, "marcos");
  await tap(w, "im_ap-centro-2q", "Apartamento 2 quartos");
  assert.match(w.drain(ANA).join("\n"), /R\$ 2\.100,00\/mês · Centro · 2 quarto\(s\)/);
});

test("temperatura: urgente com imóvel compatível = quente; só pesquisando sem imóvel = frio", async () => {
  const w = world();
  await qualificaAluguel(w);
  assert.equal(leads(w)[0].temperatura, "quente"); // 4 (urgente) + 2 (imóvel) + 1 (quartos) = 7
  const w2 = world();
  await w2.say(ANA, "oi", { name: "Bia" });
  await tap(w2, "m_comprar"); await tap(w2, "t_terreno"); await tap(w2, "b_2"); await tap(w2, "fx_2"); await tap(w2, "q_0"); await tap(w2, "pz_pesquisando");
  const l = leads(w2)[0];
  assert.equal(l.temperatura, "frio");
  assert.match(w2.drain(ANA).join("\n"), /não tenho imóvel cadastrado com esse perfil/);
  assert.deepEqual(pontuar("curto", false, 0), { pontos: 2, temperatura: "morno" });
});

test("bairro fora da área não cria lead e orienta", async () => {
  const w = world();
  await w.say(ANA, "oi", { name: "Ana" });
  await tap(w, "m_alugar"); await tap(w, "t_apartamento");
  await w.say(ANA, "Zona Rural");
  assert.match(w.drain(ANA).join("\n"), /Não trabalhamos nessa região/);
  assert.equal(leads(w).length, 0);
});

test("roteamento: corretor do bairro com menos leads; sem corretor do bairro cai no geral", () => {
  const s = mk();
  assert.equal(escolherCorretor(s, "Centro", {})?.id, "marcos");
  assert.equal(escolherCorretor(s, "Bela Vista", {})?.id, "patricia");
  assert.equal(escolherCorretor(s, "Outro Bairro", { geral: 3 })?.id, "geral");
  assert.equal(escolherCorretor({ ...s, corretores: [] }, "Centro", {}), null);
  const dois = { ...s, corretores: [{ id: "a", nome: "A", bairros: ["Centro"] }, { id: "b", nome: "B", bairros: ["Centro"] }] };
  assert.equal(escolherCorretor(dois, "Centro", { a: 2, b: 1 })?.id, "b");
});

test("compativeis respeita disponibilidade, finalidade, tipo, bairro, faixa e quartos", () => {
  const s = mk();
  const base = { finalidade: "alugar" as const, tipoId: "apartamento", bairro: "centro", minCents: 0, maxCents: 300000, quartos: 0 };
  assert.equal(compativeis(s, base).length, 2);
  assert.equal(compativeis(s, { ...base, quartos: 2 }).length, 1);
  s.imoveis[0].disponivel = false;
  assert.equal(compativeis(s, base).length, 1);
  assert.equal(compativeis(s, { ...base, finalidade: "comprar" }).length, 0);
});

test("agendar visita: dias e horários livres, confirmação, lead vira 'visita' e esquenta", async () => {
  const w = world((s) => { s.template.nome = ""; });
  await qualificaAluguel(w, "pz_curto");
  assert.equal(leads(w)[0].temperatura, "quente"); // 2 + 2 + 1 = 5
  await tap(w, "im_ap-centro-2q", "Apartamento 2 quartos");
  assert.match(w.drain(ANA).join("\n"), /exemplo\.com\.br\/imoveis\/ap-centro-2q/);
  await tap(w, "iv", "Agendar visita");
  const dias = w.drain(ANA).join("\n");
  assert.match(dias, /qua 07\/10/); // hoje ainda tem horário (>= 4 h de antecedência: 14h e 16h)
  await tap(w, "vd_2026-10-07", "qua 07/10");
  const horas = w.drain(ANA).join("\n");
  assert.ok(!horas.includes("09:00") && !horas.includes("11:00"), "horários com menos de 4 h de antecedência não aparecem");
  assert.match(horas, /14:00/);
  await tap(w, "vh_14:00", "14:00");
  assert.match(w.drain(ANA).join("\n"), /Visita agendada[\s\S]*07\/10 às 14:00/);
  const v = visitas(w)[0];
  assert.equal(v.starts_at, "2026-10-07T17:00:00.000Z");
  assert.equal(v.imovel_id, "ap-centro-2q");
  assert.equal(leads(w)[0].status, "visita");
});

test("o mesmo horário do mesmo imóvel não pode ser reservado duas vezes", async () => {
  const w = world();
  for (const who of [ANA, "5511900000002"]) {
    await qualificaAluguel(w, "pz_urgente", who);
    await tap(w, "im_ap-centro-2q", "Apt", who);
    await tap(w, "iv", "Agendar", who);
    if (who === ANA) { await tap(w, "vd_2026-10-08", "qui", who); await tap(w, "vh_09:00", "09:00", who); }
    else {
      await tap(w, "vd_2026-10-08", "qui", who);
      const horas = w.drain(who).join("\n");
      assert.ok(!horas.includes("09:00"), "09:00 já foi reservado");
      assert.match(horas, /11:00/);
    }
  }
  assert.equal(visitas(w).length, 1);
});

test("lembrete de visita: enviado 1 vez dentro da janela; confirmar, remarcar e cancelar", async () => {
  const w = world();
  await qualificaAluguel(w);
  await tap(w, "im_ap-centro-2q"); await tap(w, "iv"); await tap(w, "vd_2026-10-09"); await tap(w, "vh_11:00");
  w.drain(ANA);
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 0, "ainda faltam mais de 24 h");
  w.setNow(new Date("2026-10-08T14:30:00Z")); // falta menos de 24 h para a visita; o cliente falou há mais de 24 h => janela fechada => usa modelo
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 1);
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 0, "não repete");
  assert.match(w.drain(ANA).join("\n"), /lead_visita/);
  await w.say(ANA, "oi"); w.drain(ANA);
  const id = visitas(w)[0].id;
  await tap(w, `vc_${id}`, "Confirmo");
  assert.equal(visitas(w)[0].status, "confirmada");
  await tap(w, `vr_${id}`, "Remarcar");
  assert.equal(visitas(w)[0].status, "cancelada");
  assert.match(w.drain(ANA).join("\n"), /Escolha o novo dia/);
  await tap(w, "vd_2026-10-10"); await tap(w, "vh_09:00");
  assert.equal(visitas(w).length, 2);
  await tap(w, `vx_${visitas(w)[1].id}`, "Cancelar visita");
  assert.equal(visitas(w)[1].status, "cancelada");
});

test("cliente não mexe na visita de outro cliente", async () => {
  const w = world();
  await qualificaAluguel(w);
  await tap(w, "im_ap-centro-2q"); await tap(w, "iv"); await tap(w, "vd_2026-10-09"); await tap(w, "vh_11:00");
  const OUTRO = "5511911112222";
  await w.say(OUTRO, "oi");
  await tap(w, `vx_${visitas(w)[0].id}`, "Cancelar visita", OUTRO);
  assert.equal(visitas(w)[0].status, "agendada");
  assert.match(w.drain(OUTRO).join("\n"), /Não encontrei uma visita ativa/);
});

test("follow-up do lead: 1 vez, com imóvel real do cadastro; depois vira 'sem resposta'", async () => {
  const w = world();
  await qualificaAluguel(w);
  w.drain(ANA);
  w.advance(49 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 1);
  const t = w.drain(ANA).join("\n");
  assert.match(t, /lead_visita/); // janela de 24h fechada => modelo
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 0);
  w.advance(8 * 86_400_000);
  await rodarAcompanhamento(w.env, leadRobot, w.env.clock());
  assert.equal(leads(w)[0].status, "sem_resposta");
  await w.say(ANA, "ainda quero");
  assert.equal(leads(w)[0].status, "novo", "cliente voltou a falar");
});

test("follow-up usa texto com imóvel quando a janela de 24 h está aberta e não envia a quem tem visita ou pediu para parar", async () => {
  const w = world((s) => { s.followup.horas = 2; s.template.nome = ""; });
  await qualificaAluguel(w);
  w.drain(ANA);
  w.advance(3 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w.env, leadRobot, w.env.clock()), 1);
  assert.match(w.drain(ANA).join("\n"), /Separei uma opção[\s\S]*Apartamento 2 quartos no Centro \(R\$ 2\.100,00\)/);
  const w2 = world((s) => { s.followup.horas = 2; });
  await qualificaAluguel(w2);
  await tap(w2, "im_ap-centro-2q"); await tap(w2, "iv"); await tap(w2, "vd_2026-10-09"); await tap(w2, "vh_11:00");
  w2.advance(3 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w2.env, leadRobot, w2.env.clock()), 0);
  const w3 = world((s) => { s.followup.horas = 2; });
  await qualificaAluguel(w3);
  await w3.say(ANA, "parar");
  w3.advance(3 * 3_600_000);
  assert.equal(await rodarAcompanhamento(w3.env, leadRobot, w3.env.clock()), 0);
});

test("dúvida só com o que está cadastrado; sem resposta chama corretor", async () => {
  const w = world();
  await w.say(ANA, "Vocês fazem financiamento?");
  assert.match(w.drain(ANA).join("\n"), /simulação com bancos parceiros/);
  await w.say("5511900000009", "Esse apartamento tem IPTU baixo?");
  assert.match(w.drain("5511900000009").join("\n"), /Não tenho essa informação no momento/);
});

test("exclusão LGPD bloqueada com visita marcada", async () => {
  const w = world();
  await qualificaAluguel(w);
  await tap(w, "im_ap-centro-2q"); await tap(w, "iv"); await tap(w, "vd_2026-10-09"); await tap(w, "vh_11:00");
  const c = w.env.repo.contactByWaId(w.tenant.id, ANA)!;
  assert.match(leadRobot.beforeDeleteContact!(w.env, w.tenant.id, c.id) ?? "", /visita marcada/);
  new LeadStore(w.env.db).setVisita(w.tenant.id, visitas(w)[0].id, "cancelada", w.env.clock());
  assert.equal(leadRobot.beforeDeleteContact!(w.env, w.tenant.id, c.id), null);
});
