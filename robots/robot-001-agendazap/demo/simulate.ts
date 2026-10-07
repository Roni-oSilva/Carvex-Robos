// Gera demo/CONVERSAS.md executando o robô DE VERDADE com um WhatsApp simulado.
// Uso: node demo/simulate.ts   (dentro da pasta do robô)
import { readFileSync, writeFileSync } from "node:fs";
import { makeWorld } from "../../../shared/testing/helpers.ts";
import { fmtOutgoing, runScenario } from "../../../shared/testing/transcript.ts";
import { agendaRobot } from "../src/robot.ts";
import { sendDueReminders } from "../src/reminders.ts";
import { notifyWaitlist } from "../src/flow.ts";
import { validateSettings } from "../src/settings.ts";
import { AgendaStore } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = cfg.value;
const slot = (day: string) => `h_${day}T13:00:00.000Z|joao`; // 10:00 em São Paulo

const out: string[] = [
  "# Conversas de demonstração — AgendaZap",
  "",
  "> Gerado automaticamente por `node demo/simulate.ts`: são respostas **reais** do robô rodando com dados fictícios (Barbearia do Zé). Nada foi enviado ao WhatsApp.",
  "> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 12:00.",
  "",
];

// 1) Fluxo normal
{
  const w = makeWorld(agendaRobot, { settings });
  out.push(await runScenario(w, "5511987654321", "1. Fluxo normal — agendar um corte", [
    "Oi, quero marcar um horário",
    { say: "Corte masculino", tap: "s_corte" },
    { say: "Sem preferência", tap: "p_any" },
    { say: "Amanhã (qui 08/10)", tap: "d_2026-10-08" },
    { say: "10:00", tap: slot("2026-10-08") },
    { say: "Confirmar ✅", tap: "c_sim" },
  ], { name: "Ana" }), "");
}

// 2) Dúvida
{
  const w = makeWorld(agendaRobot, { settings });
  out.push(await runScenario(w, "5511987654321", "2. Fluxo de dúvida — o robô só responde o que está cadastrado", [
    "Vocês aceitam cartão e pix?",
    "Qual o endereço?",
  ]), "");
}

// 3) Erro / horário ocupado / entrada inválida
{
  const w = makeWorld(agendaRobot, { settings });
  const ANA = "5511987654321", BIA = "5511911112222";
  for (const who of [ANA, BIA]) {
    await w.say(who, "agendar", { replyId: "m_agendar" });
    await w.say(who, "Corte", { replyId: "s_corte" });
    await w.say(who, "Sem preferência", { replyId: "p_any" });
    await w.say(who, "dia", { replyId: "d_2026-10-08" });
    await w.say(who, "10:00", { replyId: "h_2026-10-08T13:00:00.000Z|joao" });
  }
  // Outro barbeiro ocupa o mesmo horário no meio tempo
  await w.say(ANA, "sim", { replyId: "c_sim" });
  out.push("### 3. Fluxo de erro — o horário foi ocupado por outra pessoa e entrada inválida", "");
  const before = w.wa.sent.length;
  await w.say(BIA, "Confirmar", { replyId: "c_sim" });
  out.push("**CLIENTE (Bia):** *toca em* “Confirmar ✅” _(a Ana confirmou o mesmo horário um minuto antes, com o mesmo barbeiro)_", "");
  for (const x of w.wa.sent.slice(before).filter((y) => y.to === BIA)) out.push(`**ROBÔ:** ${fmtOutgoing(x.msg)}`, "");
  out.push(await runScenario(makeWorld(agendaRobot, { settings }), "5511900001111", "3b. Entrada que o robô não entende (áudio)", [{ say: "", type: "audio" }]), "");
}

// 4) Transferência para humano
{
  const w = makeWorld(agendaRobot, { settings });
  out.push(await runScenario(w, "5511987654321", "4. Transferência para atendente humano — a pedido do cliente", [
    "Oi",
    { say: "Falar com atendente", tap: "m_humano" },
    "Alô?",
  ]), "");
  out.push("_Depois do pedido o robô fica em silêncio: a conversa aparece no painel como “aguardando atendente” e a equipe responde por lá. Se ninguém assumir em 12h, o robô volta a atender._", "");
  const w2 = makeWorld(agendaRobot, { settings });
  out.push(await runScenario(w2, "5511911112222", "4b. Transferência automática — pergunta que não está na base de conhecimento", [
    "Vocês fazem tatuagem?",
  ]), "");
  out.push("_O robô não inventa resposta: avisa que não sabe e chama uma pessoa._", "");
}

// 5) Lembrete e confirmação
{
  const w = makeWorld(agendaRobot, { settings });
  const ANA = "5511987654321";
  await w.say(ANA, "agendar", { replyId: "m_agendar" });
  await w.say(ANA, "Corte", { replyId: "s_corte" });
  await w.say(ANA, "Sem preferência", { replyId: "p_any" });
  await w.say(ANA, "dia", { replyId: "d_2026-10-09" });
  await w.say(ANA, "10:00", { replyId: slot("2026-10-09") });
  await w.say(ANA, "sim", { replyId: "c_sim" });
  w.setNow(new Date("2026-10-08T13:30:00Z")); // 24h antes
  const before = w.wa.sent.length;
  await sendDueReminders(w.env, agendaRobot, w.env.clock());
  out.push("### 5. Lembrete automático 24h antes e confirmação", "");
  for (const x of w.wa.sent.slice(before)) out.push(`**ROBÔ (lembrete enviado sozinho):** ${fmtOutgoing(x.msg)}`, "");
  out.push(await runScenario(w, ANA, "5b. Cliente responde ao lembrete", [{ say: "Confirmo ✅", tap: "rc" }]).then((t) => t.split("\n").slice(2).join("\n")), "");
}

// 6) Lista de espera
{
  const w = makeWorld(agendaRobot, { settings: { ...settings, profissionais: settings.profissionais.filter((p) => p.id === "joao"), servicos: settings.servicos.filter((s) => s.id !== "sobrancelha") } });
  const BIA = "5511911112222";
  const store = new AgendaStore(w.env.db);
  const lotador = w.env.repo.upsertContact(w.tenant.id, "5511900000000", "Lotador", w.env.clock());
  const svc = settings.servicos[0];
  for (let t = 12 * 60; t < 21 * 60; t += 30) {
    store.book({ tenantId: w.tenant.id, contactId: lotador.id, service: svc, professionalId: "joao", professionalName: "João", start: new Date(Date.UTC(2026, 9, 8, Math.floor(t / 60), t % 60)), source: "painel" }, settings, w.env.clock());
  }
  out.push(await runScenario(w, BIA, "6. Lista de espera — o dia está lotado e uma vaga abre", [
    { say: "Quero marcar", tap: "m_agendar" },
    { say: "Corte masculino", tap: "s_corte" },
    "08/10",
    { say: "Entrar na espera", tap: "w_sim" },
  ], { name: "Bia" }), "");
  const vaga = w.env.db.get<{ id: number }>("SELECT id FROM appointments WHERE starts_at = '2026-10-08T13:00:00.000Z'")!;
  const before = w.wa.sent.length;
  store.cancel(w.tenant.id, vaga.id, "cliente desistiu", w.env.clock());
  await notifyWaitlist(w.env, w.tenant, settings, w.env.clock(), vaga.id);
  out.push("_Horas depois, outro cliente cancela o das 10:00. O robô avisa quem estava esperando:_", "");
  for (const x of w.wa.sent.slice(before)) out.push(`**ROBÔ (aviso automático):** ${fmtOutgoing(x.msg)}`, "");
  out.push(await runScenario(w, BIA, "6b. A Bia responde", [{ say: "QUERO", tap: "wl_quero" }]).then((t) => t.split("\n").slice(2).join("\n")), "");
}

writeFileSync(new URL("./CONVERSAS.md", import.meta.url), out.join("\n"));
console.log("demo/CONVERSAS.md gerado.");
