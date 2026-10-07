import type { Migration } from "../../../shared/database/db.ts";

export const migrations: Migration[] = [
  {
    id: "pedido-001",
    sql: `
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrega','retirada')),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','aceito','preparando','saiu','pronto','entregue','cancelado')),
  nome TEXT NOT NULL,
  endereco TEXT,
  bairro TEXT,
  subtotal_cents INTEGER NOT NULL,
  taxa_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  pagamento TEXT NOT NULL CHECK (pagamento IN ('pix','dinheiro','cartao_entrega')),
  troco_para_cents INTEGER,
  pago INTEGER NOT NULL DEFAULT 0,
  eta_min INTEGER,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, numero)
);
CREATE INDEX idx_orders_board ON orders (tenant_id, status, created_at);
CREATE INDEX idx_orders_contact ON orders (tenant_id, contact_id, created_at);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  variacao TEXT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_cents INTEGER NOT NULL,
  obs TEXT
);
CREATE INDEX idx_order_items_order ON order_items (order_id);
`,
  },
];
