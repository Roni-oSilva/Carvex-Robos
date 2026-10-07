// Gera demo/CONVERSAS.md executando o robô DE VERDADE com um WhatsApp simulado.
// Uso: node demo/simulate.ts   (dentro da pasta do robô)
import { readFileSync, writeFileSync } from "node:fs";
import { makeWorld } from "../../../shared/testing/helpers.ts";
import { fmtOutgoing, runScenario } from "../../../shared/testing/transcript.ts";
import { pedidoRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { PedidoStore } from "../src/store.ts";
import { avisarStatus } from "../src/notify.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = cfg.value;
const NOITE = new Date("2026-10-07T23:00:00Z"); // quarta, 20h em São Paulo
const ANA = "5511987654321";
const novo = (now = NOITE) => makeWorld(pedidoRobot, { settings, now });

const out: string[] = [
  "# Conversas de demonstração — PedidoZap",
  "",
  "> Gerado automaticamente por `node demo/simulate.ts`: respostas **reais** do robô com dados fictícios (Pizzaria Bella Massa). Nada foi enviado ao WhatsApp.",
  "> 🔘 = botão  ·  ▫️ = item de lista  ·  Hoje (fictício) = quarta-feira, 20h (loja aberta).",
  "",
];

// 1) Fluxo normal
{
  const w = novo();
  out.push(await runScenario(w, ANA, "1. Fluxo normal — pedido de entrega pago com Pix", [
    "Oi, boa noite",
    { say: "Fazer pedido", tap: "m_pedir" },
    { say: "Pizzas", tap: "c_pizzas" },
    { say: "Pizza Calabresa", tap: "i_calabresa" },
    { say: "Grande (8 fatias)", tap: "v_grande" },
    { say: "2", tap: "q_2" },
    "sem cebola, por favor",
    { say: "Adicionar mais", tap: "k_mais" },
    { say: "Bebidas", tap: "c_bebidas" },
    { say: "Coca-Cola 2L", tap: "i_coca2l" },
    { say: "1", tap: "q_1" },
    { say: "Sem observação", tap: "o_nao" },
    { say: "Finalizar pedido", tap: "k_fim" },
    { say: "Entrega 🛵", tap: "t_entrega" },
    { say: "Centro", tap: "b_0" },
    "Rua das Palmeiras, 123, apto 4",
    { say: "Pix", tap: "p_pix" },
    { say: "Confirmar ✅", tap: "f_sim" },
  ], { name: "Ana Paula" }), "");

  // atualização de status pelo painel
  const st = new PedidoStore(w.env.db);
  const o = st.ultimoDe(w.tenant.id, w.env.repo.contactByWaId(w.tenant.id, ANA)!.id)!;
  out.push("_No painel, a pizzaria clica nos botões do pedido. O cliente é avisado sozinho a cada etapa:_", "");
  for (const status of ["aceito", "preparando", "saiu", "entregue"] as const) {
    const before = w.wa.sent.length;
    st.setStatus(w.tenant.id, o.id, status, w.env.clock());
    await avisarStatus(w.env, w.tenant, settings, st.get(w.tenant.id, o.id)!, w.env.clock());
    for (const x of w.wa.sent.slice(before)) out.push(`**ROBÔ (aviso automático):** ${fmtOutgoing(x.msg)}`, "");
  }
}

// 2) Dúvida
{
  const w = novo();
  out.push(await runScenario(w, ANA, "2. Fluxo de dúvida — só responde o que está cadastrado", [
    "Vocês entregam no Jardim América? Qual a taxa?",
    "Onde fica a pizzaria?",
    "Vocês têm opção sem glúten?",
  ]), "");
}

// 3) Erros
{
  const w = novo();
  out.push(await runScenario(w, ANA, "3. Fluxo de erro — pedido mínimo, bairro fora da área e quantidade inválida", [
    { say: "Fazer pedido", tap: "m_pedir" },
    { say: "Bebidas", tap: "c_bebidas" },
    { say: "Guaraná lata", tap: "i_guarana" },
    "50",
    { say: "1", tap: "q_1" },
    { say: "Sem observação", tap: "o_nao" },
    { say: "Finalizar pedido", tap: "k_fim" },
    { say: "Entrega 🛵", tap: "t_entrega" },
  ], { name: "Ana" }), "");
  const w2 = novo();
  out.push(await runScenario(w2, ANA, "3b. Bairro fora da área de entrega", [
    { say: "Fazer pedido", tap: "m_pedir" }, { say: "Brownie", tap: "c_sobremesas" }, { say: "Brownie com sorvete", tap: "i_brownie" },
    { say: "2", tap: "q_2" }, { say: "Sem observação", tap: "o_nao" }, { say: "Finalizar pedido", tap: "k_fim" }, { say: "Entrega 🛵", tap: "t_entrega" },
    "Bairro Distante",
  ], { name: "Ana" }), "");
  const w3 = makeWorld(pedidoRobot, { settings, now: new Date("2026-10-05T15:00:00Z") });
  out.push(await runScenario(w3, ANA, "3c. Loja fechada (segunda, 12h)", [{ say: "Fazer pedido", tap: "m_pedir" }]), "");
}

// 4) Humano
{
  const w = novo();
  out.push(await runScenario(w, ANA, "4. Transferência para atendente humano", ["Quero falar com um atendente", "Alô?"]), "");
  out.push("_O robô fica em silêncio e a conversa aparece no painel (“Conversas”) como aguardando atendente. Se ninguém assumir em 12h, o robô volta a atender._", "");
}

writeFileSync(new URL("./CONVERSAS.md", import.meta.url), out.join("\n"));
console.log("demo/CONVERSAS.md gerado.");
