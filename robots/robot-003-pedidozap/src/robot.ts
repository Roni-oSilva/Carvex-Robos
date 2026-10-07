import type { Robot } from "../../../shared/engine/types.ts";
import { adminRoutes, home } from "./admin.ts";
import { handlePedido } from "./flow.ts";
import { migrations } from "./migrations.ts";
import { defaultSettings, knowledge, validateSettings, type PedidoSettings } from "./settings.ts";

export const pedidoRobot: Robot<PedidoSettings> = {
  id: "robot-003-pedidozap",
  nome: "PedidoZap",
  version: "1.0.0",
  migrations,
  defaultSettings,
  validateSettings,
  knowledge,
  handle: handlePedido,
  admin: {
    nav: [{ href: "/admin/pedidos", label: "Pedidos" }, { href: "/admin/cardapio", label: "Cardápio" }, { href: "/admin/historico", label: "Histórico" }],
    home,
    routes: adminRoutes,
  },
  beforeDeleteContact(env, tenantId, contactId) {
    const n = env.db.get<{ n: number }>("SELECT COUNT(*) n FROM orders WHERE tenant_id = ? AND contact_id = ? AND status IN ('novo','aceito','preparando','saiu','pronto')", tenantId, contactId)!.n;
    return n > 0 ? "o cliente tem pedido em andamento." : null;
  },
};
