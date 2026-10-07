// Gera demo/CONVERSAS.md executando o robô DE VERDADE com um WhatsApp simulado.
// Uso: node demo/simulate.ts   (dentro da pasta do robô)
import { readFileSync, writeFileSync } from "node:fs";
import { makeWorld } from "../../../shared/testing/helpers.ts";
import { fmtOutgoing, runScenario } from "../../../shared/testing/transcript.ts";
import { cobraRobot } from "../src/robot.ts";
import { rodarRegua } from "../src/regua.ts";
import { validateSettings } from "../src/settings.ts";
import { CobraStore } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = { ...cfg.value, template: { nome: "cobranca_aviso", idioma: "pt_BR" } };
const MARIA = "5511987654321";

const out: string[] = [
  "# Conversas de demonstração — CobraZap",
  "",
  "> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Academia Corpo em Movimento). Nada foi enviado ao WhatsApp.",
  "> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 12:00. A empresa tem um modelo de mensagem aprovado, usado quando o cliente não escreveu nas últimas 24h.",
  "",
];

function novo(venc: string, opts: { cents?: number; desc?: string } = {}) {
  const w = makeWorld(cobraRobot, { settings });
  const c = w.env.repo.upsertContact(w.tenant.id, MARIA, "Maria Souza", w.env.clock(), "relacao_contratual");
  const id = new CobraStore(w.env.db).create({ tenantId: w.tenant.id, contactId: c.id, description: opts.desc ?? "Mensalidade outubro", amountCents: opts.cents ?? 15000, dueDate: venc, reference: "MENS-1042" }, w.env.clock())!;
  return { w, c, id };
}
async function regua(w: ReturnType<typeof novo>["w"], titulo: string) {
  const before = w.wa.sent.length;
  await rodarRegua(w.env, cobraRobot, w.env.clock());
  out.push(titulo, "");
  for (const x of w.wa.sent.slice(before)) out.push(`**ROBÔ (enviado sozinho):** ${fmtOutgoing(x.msg)}`, "");
}

// 1) Fluxo normal
{
  const { w, id } = novo("2026-10-10");
  out.push("### 1. Fluxo normal — da régua automática ao pagamento", "");
  await regua(w, "_Quarta, 12h: faltam 3 dias para o vencimento. O robô confirma antes se está falando com a pessoa certa (não revela valores ainda):_");
  out.push(await runScenario(w, MARIA, "1b. A cliente responde", [
    { say: "Sim, sou eu", tap: "id_sim" },
    { say: "Pagar com Pix", tap: "cz_pix" },
    "paguei!",
  ], { name: "Maria Souza" }).then((t) => t.split("\n").slice(2).join("\n")), "");
  void id;
  out.push("_No painel, a empresa confere no banco e clica em “Recebi”. A cobrança sai da régua._", "");
}

// 2) Dúvida
{
  const { w } = novo("2026-10-10");
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, w.env.repo.contactByWaId(w.tenant.id, MARIA)!.id, w.env.clock());
  out.push(await runScenario(w, MARIA, "2. Fluxo de dúvida — responde só o que está cadastrado", ["Posso trancar meu plano?", "Qual o horário de funcionamento?"]), "");
}

// 3) Erro: número errado e entrada inválida
{
  const { w } = novo("2026-10-10");
  await rodarRegua(w.env, cobraRobot, w.env.clock());
  out.push("### 3. Fluxo de erro — número errado (a cobrança nunca é exposta)", "", "_O robô perguntou se falava com a Maria; quem recebeu a mensagem não é ela:_", "");
  out.push(await runScenario(w, MARIA, "3a. Resposta", [{ say: "Número errado", tap: "id_nao" }]).then((t) => t.split("\n").slice(2).join("\n")), "");
  out.push("_O número é removido de todos os avisos e o fato fica registrado no painel._", "");
  const { w: w2 } = novo("2026-10-10");
  new CobraStore(w2.env.db).confirmIdentity(w2.tenant.id, w2.env.repo.contactByWaId(w2.tenant.id, MARIA)!.id, w2.env.clock());
  out.push(await runScenario(w2, MARIA, "3b. Mensagem que o robô não entende (áudio)", [{ say: "", type: "audio" }]), "");
}

// 4) Humano
{
  const { w, c } = novo("2026-09-20");
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, c.id, w.env.clock());
  out.push(await runScenario(w, MARIA, "4. Transferência para atendente humano", ["Quero falar com um atendente", "Alô?"]), "");
  out.push("_A régua continua respeitando o limite de contatos, mas a conversa passa a ser da equipe, no painel._", "");
}

// 5) Negociação
{
  const { w, c } = novo("2026-09-20");
  new CobraStore(w.env.db).confirmIdentity(w.tenant.id, c.id, w.env.clock());
  out.push(await runScenario(w, MARIA, "5. Negociação — o cliente propõe parcelar", [
    "Não consigo pagar tudo agora, dá pra parcelar?",
    { say: "3x de R$ 50,00", tap: "n_3" },
  ], { name: "Maria Souza" }), "");
  out.push("_A equipe vê a proposta em “Acordos”, escolhe o 1º vencimento e aceita: o robô cria as 3 parcelas, avisa a cliente e passa a lembrar de cada uma._", "");
}

// 6) Quem não deve nada
{
  const { w } = novo("2026-10-10");
  out.push(await runScenario(w, "5511900001111", "6. Número sem pendências", ["Oi"]), "");
}

writeFileSync(new URL("./CONVERSAS.md", import.meta.url), out.join("\n"));
console.log("demo/CONVERSAS.md gerado.");
