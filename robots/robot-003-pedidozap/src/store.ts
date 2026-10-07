import type { Db } from "../../../shared/database/db.ts";

export type OrderStatus = "novo" | "aceito" | "preparando" | "saiu" | "pronto" | "entregue" | "cancelado";
export interface Order {
  id: number; tenant_id: number; contact_id: number; numero: number; tipo: "entrega" | "retirada"; status: OrderStatus;
  nome: string; endereco: string | null; bairro: string | null; subtotal_cents: number; taxa_cents: number; total_cents: number;
  pagamento: "pix" | "dinheiro" | "cartao_entrega"; troco_para_cents: number | null; pago: number; eta_min: number | null;
  cancel_reason: string | null; created_at: string; updated_at: string;
}
export interface OrderItem { id: number; order_id: number; item_id: string; nome: string; variacao: string | null; qty: number; unit_cents: number; obs: string | null }

export interface NovoPedido {
  tenantId: number; contactId: number; tipo: "entrega" | "retirada"; nome: string; endereco: string | null; bairro: string | null;
  taxaCents: number; pagamento: Order["pagamento"]; trocoParaCents: number | null; etaMin: number;
  itens: { itemId: string; nome: string; variacao: string | null; qty: number; unitCents: number; obs: string | null }[];
}

export const ATIVOS = "('novo','aceito','preparando','saiu','pronto')";

export class PedidoStore {
  db: Db;
  constructor(db: Db) { this.db = db; }

  get(tenantId: number, id: number): Order | undefined {
    return this.db.get<Order>("SELECT * FROM orders WHERE tenant_id = ? AND id = ?", tenantId, id);
  }
  itens(orderId: number): OrderItem[] {
    return this.db.all<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", orderId);
  }
  ultimoDe(tenantId: number, contactId: number): Order | undefined {
    return this.db.get<Order>("SELECT * FROM orders WHERE tenant_id = ? AND contact_id = ? ORDER BY id DESC LIMIT 1", tenantId, contactId);
  }

  /** Cria o pedido numa transação: número sequencial por empresa + itens + totais calculados aqui (nunca vindos do cliente). */
  criar(p: NovoPedido, now: Date): Order {
    return this.db.tx(() => {
      const numero = this.db.get<{ n: number }>("SELECT COALESCE(MAX(numero), 0) + 1 AS n FROM orders WHERE tenant_id = ?", p.tenantId)!.n;
      const subtotal = p.itens.reduce((s, i) => s + i.unitCents * i.qty, 0);
      const r = this.db.run(
        `INSERT INTO orders (tenant_id, contact_id, numero, tipo, nome, endereco, bairro, subtotal_cents, taxa_cents, total_cents, pagamento, troco_para_cents, eta_min, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        p.tenantId, p.contactId, numero, p.tipo, p.nome, p.endereco, p.bairro, subtotal, p.taxaCents, subtotal + p.taxaCents, p.pagamento, p.trocoParaCents, p.etaMin, now.toISOString(), now.toISOString());
      for (const i of p.itens) this.db.run("INSERT INTO order_items (order_id, item_id, nome, variacao, qty, unit_cents, obs) VALUES (?,?,?,?,?,?,?)", r.lastId, i.itemId, i.nome, i.variacao, i.qty, i.unitCents, i.obs);
      return this.get(p.tenantId, r.lastId)!;
    });
  }

  setStatus(tenantId: number, id: number, status: OrderStatus, now: Date, reason?: string): void {
    this.db.run("UPDATE orders SET status = ?, cancel_reason = COALESCE(?, cancel_reason), updated_at = ? WHERE tenant_id = ? AND id = ?", status, reason ?? null, now.toISOString(), tenantId, id);
  }
  setPago(tenantId: number, id: number, pago: boolean, now: Date): void {
    this.db.run("UPDATE orders SET pago = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", pago ? 1 : 0, now.toISOString(), tenantId, id);
  }
}
