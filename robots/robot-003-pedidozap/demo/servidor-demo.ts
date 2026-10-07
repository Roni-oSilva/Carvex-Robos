// Painel de demonstração com dados fictícios (em memória). Uso: node demo/servidor-demo.ts
import { readFileSync } from "node:fs";
import { startDemo } from "../../../shared/testing/demo-server.ts";
import { pedidoRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { PedidoStore, type OrderStatus } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);

await startDemo(pedidoRobot, cfg.value, (env, tenant, now) => {
  const st = new PedidoStore(env.db);
  const nomes = ["Ana Paula", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Nunes", "Fábio Reis", "Gabi Souza", "Hugo Alves"];
  const status: OrderStatus[] = ["novo", "novo", "aceito", "preparando", "preparando", "saiu", "pronto", "entregue"];
  nomes.forEach((nome, i) => {
    const c = env.repo.upsertContact(tenant.id, `55119${String(76000000 + i * 90001).slice(0, 8)}`, nome, now, "demo");
    const criado = new Date(now.getTime() - (8 - i) * 9 * 60_000);
    const entrega = i % 3 !== 2;
    const o = st.criar({
      tenantId: tenant.id, contactId: c.id, tipo: entrega ? "entrega" : "retirada", nome, endereco: entrega ? `Rua das Flores, ${100 + i * 7}` : null, bairro: entrega ? "Centro" : null,
      taxaCents: entrega ? 500 : 0, pagamento: (["pix", "dinheiro", "cartao_entrega"] as const)[i % 3], trocoParaCents: null, etaMin: 40,
      itens: [
        { itemId: "calabresa", nome: "Pizza Calabresa", variacao: i % 2 ? "Grande (8 fatias)" : "Média (6 fatias)", qty: 1 + (i % 2), unitCents: i % 2 ? 5200 : 4200, obs: i === 1 ? "sem cebola" : null },
        { itemId: "coca2l", nome: "Coca-Cola 2L", variacao: null, qty: 1, unitCents: 1200, obs: null },
      ],
    }, criado);
    st.setStatus(tenant.id, o.id, status[i], new Date(criado.getTime() + 28 * 60_000));
    if (status[i] === "entregue") st.setPago(tenant.id, o.id, true, now);
  });
});
