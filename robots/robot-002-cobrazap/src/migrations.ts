import type { Migration } from "../../../shared/database/db.ts";

export const migrations: Migration[] = [
  {
    id: "cobra-001",
    sql: `
CREATE TABLE cz_clientes (
  contact_id INTEGER PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  identity_confirmed_at TEXT,
  identity_asked_at TEXT,
  wrong_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE charges (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  reference TEXT,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  due_date TEXT NOT NULL,
  pix_code TEXT,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_conferencia','paga','acordo','cancelada')),
  paused_until TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, reference)
);
CREATE INDEX idx_charges_status ON charges (tenant_id, status, due_date);
CREATE INDEX idx_charges_contact ON charges (tenant_id, contact_id);

CREATE TABLE cz_envios (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  charge_id INTEGER REFERENCES charges(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  result TEXT NOT NULL,
  sent_at TEXT NOT NULL
);
CREATE INDEX idx_envios_contact ON cz_envios (contact_id, sent_at);
CREATE INDEX idx_envios_charge ON cz_envios (charge_id, step_id);

CREATE TABLE cz_acordos (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  charge_id INTEGER NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
  parcelas INTEGER NOT NULL,
  parcela_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposto' CHECK (status IN ('proposto','aceito','recusado')),
  created_at TEXT NOT NULL,
  decided_at TEXT
);
`,
  },
];
