// Gera demo/CONVERSAS.md executando o robô DE VERDADE com um WhatsApp simulado.
// Uso: node demo/simulate.ts   (dentro da pasta do robô)
import { readFileSync, writeFileSync } from "node:fs";
import { makeWorld } from "../../../shared/testing/helpers.ts";
import { fmtOutgoing, runScenario } from "../../../shared/testing/transcript.ts";
import { orcaRobot } from "../src/robot.ts";
import { enviarPropostaAoCliente } from "../src/notify.ts";
import { validateSettings } from "../src/settings.ts";
import { OrcaStore } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = cfg.value;
const MANHA = new Date("2026-10-07T13:00:00Z"); // quarta, 10h em São Paulo
const ANA = "5511987654321";
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 1)]);
const novo = () => { const w = makeWorld(orcaRobot, { settings, now: MANHA }); for (const id of ["foto1", "foto2"]) w.wa.media.set(id, { data: JPG, mime: "image/jpeg" }); return w; };

const out: string[] = [
  "# Conversas de demonstração — OrcaZap",
  "",
  "> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Reforma Fácil Serviços). Nada foi enviado ao WhatsApp.",
  "> 🔘 = botão  ·  ▫️ = item de lista  ·  📎 = foto enviada pelo cliente  ·  Hoje (fictício) = quarta-feira, 10h.",
  "",
];

{
  const w = novo();
  out.push(await runScenario(w, ANA, "1. Fluxo normal — pedido de orçamento com fotos, proposta e aceite", [
    "Oi, bom dia",
    { say: "Pedir orçamento", tap: "m_novo" },
    { say: "Pintura", tap: "s_pintura" },
    "Pintar sala e dois quartos, tem mofo no canto de uma parede",
    { say: "(foto)", type: "image", media: "foto1" },
    { say: "(foto)", type: "image", media: "foto2" },
    { say: "Já enviei", tap: "f_fim" },
    { say: "Centro", tap: "b_0" },
    "Rua das Acácias, 45, apto 12",
    { say: "Manhã", tap: "p_manha" },
    { say: "Enviar pedido", tap: "c_sim" },
  ], { name: "Ana Paula" }), "");

  const st = new OrcaStore(w.env.db);
  const q = st.get(w.tenant.id, 1)!;
  out.push("_No painel, a equipe abre o pedido, vê as fotos, informa o valor e clica em “Enviar ao cliente”. O cliente recebe a proposta com botões:_", "");
  const antes = w.wa.sent.length;
  const dados = { valorCents: 285000, prazoTexto: "5 dias úteis; 50% de entrada", obs: "Inclui tratamento do mofo e 2 demãos de tinta (material por nossa conta).", validadeDias: 7, followupHoras: 24 };
  const previa = { ...q, valor_cents: dados.valorCents, prazo_texto: dados.prazoTexto, obs_proposta: dados.obs, validade_ate: new Date(MANHA.getTime() + 7 * 86_400_000).toISOString() };
  await enviarPropostaAoCliente(w.env, w.tenant, settings, previa, MANHA);
  st.enviarProposta(w.tenant.id, q.id, dados, MANHA);
  for (const x of w.wa.sent.slice(antes)) out.push(`**ROBÔ (proposta da equipe):** ${fmtOutgoing(x.msg)}`, "");
  out.push(await runScenario(w, ANA, "1b. Cliente aceita", [{ say: "Aceitar", tap: "oz_ok_1" }]), "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "2. Fluxo de dúvida — só responde o que está cadastrado", [
    "Quanto custa o orçamento?",
    "Quais bairros vocês atendem?",
    "Vocês consertam telhado?",
  ]), "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "3. Fluxo de erro — arquivo que não é foto e bairro fora da área", [
    { say: "Pedir orçamento", tap: "m_novo" },
    { say: "Elétrica", tap: "s_eletrica" },
    "Trocar o quadro de luz",
  ], { name: "Ana" }), "");
  w.wa.media.set("fake", { data: Buffer.from("este arquivo nao e uma imagem de verdade, so texto"), mime: "image/jpeg" });
  out.push(await runScenario(w, ANA, "3b. Continuação", [
    { say: "(arquivo)", type: "image", media: "fake" },
    { say: "Sem fotos", tap: "f_pular" },
    "Bairro Distante",
  ]), "");
}

{
  const w = novo();
  out.push(await runScenario(w, ANA, "4. Transferência para atendente humano", ["Quero falar com um atendente", "Alô?"]), "");
  out.push("_O robô fica em silêncio e a conversa aparece no painel (“Conversas”). Se ninguém assumir em 12h, o robô volta a atender._", "");
}

writeFileSync(new URL("./CONVERSAS.md", import.meta.url), out.join("\n"));
console.log("demo/CONVERSAS.md gerado.");
