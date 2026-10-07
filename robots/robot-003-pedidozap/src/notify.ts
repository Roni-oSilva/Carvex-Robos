import { sendProactive, type ProactiveResult } from "../../../shared/engine/proactive.ts";
import type { BotEnv } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import type { PedidoSettings } from "./settings.ts";
import type { Order, OrderStatus } from "./store.ts";

export function textoStatus(o: Order, s: PedidoSettings): string {
  const n = `#${o.numero}`;
  switch (o.status) {
    case "novo": return `Recebemos o seu pedido ${n}. Já já confirmamos! 🙌`;
    case "aceito": return `Seu pedido ${n} foi aceito ✅ ${o.tipo === "entrega" ? `Previsão de entrega: cerca de ${o.eta_min} min.` : `Fica pronto em cerca de ${o.eta_min} min para retirada.`}`;
    case "preparando": return `Seu pedido ${n} está sendo preparado 👨‍🍳`;
    case "saiu": return `Seu pedido ${n} saiu para entrega 🛵 Fique de olho no portão!`;
    case "pronto": return `Seu pedido ${n} está pronto para retirada 🛍️${s.empresa.endereco ? ` — ${s.empresa.endereco}` : ""}`;
    case "entregue": return `Pedido ${n} concluído. Bom apetite! 😋 Obrigado por pedir na ${s.empresa.nome}.`;
    case "cancelado": return `Seu pedido ${n} foi cancelado${o.cancel_reason ? `: ${o.cancel_reason}` : ""}. Se foi um engano, responda ATENDENTE.`;
  }
}

export const STATUS_NOTIFICADOS: OrderStatus[] = ["aceito", "preparando", "saiu", "pronto", "entregue", "cancelado"];

/** Avisa o cliente da mudança de status (texto livre dentro das 24h; senão, modelo aprovado se houver). */
export async function avisarStatus(env: BotEnv, tenant: Tenant, s: PedidoSettings, o: Order, now: Date): Promise<ProactiveResult | "ignorado"> {
  if (!STATUS_NOTIFICADOS.includes(o.status)) return "ignorado";
  const contact = env.repo.contact(tenant.id, o.contact_id);
  if (!contact) return "ignorado";
  const text = textoStatus(o, s);
  return sendProactive(env, tenant, contact, {
    text,
    template: s.template.nome ? { name: s.template.nome, language: s.template.idioma, params: [o.nome.split(" ")[0], String(o.numero), text, s.empresa.nome] } : undefined,
  }, now);
}
