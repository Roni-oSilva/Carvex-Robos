// Gera demo/CONVERSAS.md executando o robô DE VERDADE com um WhatsApp simulado.
// Uso: node demo/simulate.ts   (dentro da pasta do robô)
import { readFileSync, writeFileSync } from "node:fs";
import { makeWorld } from "../../../shared/testing/helpers.ts";
import { fmtOutgoing, runScenario } from "../../../shared/testing/transcript.ts";
import { rodarAcompanhamento } from "../src/followup.ts";
import { leadRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = cfg.value;
const MANHA = new Date("2026-10-07T13:00:00Z"); // quarta, 10h em São Paulo
const ANA = "5511987654321";
const novo = () => makeWorld(leadRobot, { settings, now: MANHA });

const out: string[] = [
  "# Conversas de demonstração — LeadZap",
  "",
  "> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Casa Certa Imóveis). Nada foi enviado ao WhatsApp.",
  "> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 10h.",
  "",
];

{
  const w = novo();
  out.push(await runScenario(w, ANA, "1. Fluxo normal — qualificação, imóvel compatível e visita agendada", [
    "Oi, bom dia",
    { say: "Quero alugar", tap: "m_alugar" },
    { say: "Apartamento", tap: "t_apartamento" },
    { say: "Centro", tap: "b_0" },
    { say: "R$ 1.500 a 3.000", tap: "fx_1" },
    { say: "2 quartos ou mais", tap: "q_2" },
    { say: "Até 30 dias", tap: "pz_urgente" },
    { say: "Apartamento 2 quartos no Centro", tap: "im_ap-centro-2q" },
    { say: "Agendar visita", tap: "iv" },
    { say: "qui 08/10", tap: "vd_2026-10-08" },
    { say: "14:00", tap: "vh_14:00" },
  ], { name: "Ana Paula" }), "");
  out.push("_Para a equipe, o lead aparece no painel como **quente**, já atribuído ao corretor do bairro, com a visita marcada._", "");

  w.setNow(new Date("2026-10-07T18:30:00Z")); // véspera: menos de 24 h para a visita
  const antes = w.wa.sent.length;
  await rodarAcompanhamento(w.env, leadRobot, w.env.clock());
  out.push("_No dia anterior, o robô lembra e pede confirmação:_", "");
  for (const x of w.wa.sent.slice(antes)) out.push(`**ROBÔ (lembrete automático):** ${fmtOutgoing(x.msg)}`, "");
  out.push(await runScenario(w, ANA, "1b. Cliente confirma", [{ say: "Confirmo", tap: `vc_1` }]), "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "2. Fluxo de dúvida — só responde o que está cadastrado", [
    "Vocês fazem financiamento?",
    "Quais bairros vocês atendem?",
    "O apartamento da Bela Vista aceita pet?",
  ]), "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "3. Fluxo de erro — bairro fora da área e perfil sem imóvel cadastrado", [
    { say: "Quero comprar", tap: "m_comprar" },
    { say: "Casa", tap: "t_casa" },
    "Zona Rural",
    { say: "Vila Nova", tap: "b_2" },
    { say: "Acima de R$ 600 mil", tap: "fx_2" },
    { say: "Tanto faz", tap: "q_0" },
    { say: "Só pesquisando", tap: "pz_pesquisando" },
  ], { name: "Ana" }), "");
  out.push("_O lead fica registrado como **frio** para a equipe retomar quando surgir um imóvel desse perfil._", "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "4. Transferência para corretor humano", ["Quero falar com um corretor", "Alô?"]), "");
  out.push("_O robô fica em silêncio e a conversa aparece no painel (“Conversas”). Se ninguém assumir em 12h, o robô volta a atender._", "");
}

writeFileSync(new URL("./CONVERSAS.md", import.meta.url), out.join("\n"));
console.log("demo/CONVERSAS.md gerado.");
