import type { Migration } from "../../../shared/database/db.ts";

export const migrations: Migration[] = [
  {
    id: "orca-001",
    sql: `
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  servico_id TEXT NOT NULL,
  servico_nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  bairro TEXT NOT NULL,
  endereco TEXT,
  periodo TEXT NOT NULL CHECK (periodo IN ('manha','tarde','qualquer')),
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_analise','enviado','aceito','recusado','expirado','cancelado')),
  valor_cents INTEGER,
  prazo_texto TEXT,
  obs_proposta TEXT,
  enviado_em TEXT,
  validade_ate TEXT,
  followup_em TEXT,
  followup_enviado INTEGER NOT NULL DEFAULT 0,
  recusa_motivo TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, numero)
);
CREATE INDEX idx_quotes_board ON quotes (tenant_id, status, created_at);
CREATE INDEX idx_quotes_contact ON quotes (tenant_id, contact_id, created_at);

CREATE TABLE quote_photos (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
  arquivo TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_quote_photos_quote ON quote_photos (quote_id);
CREATE INDEX idx_quote_photos_contact ON quote_photos (tenant_id, contact_id, quote_id);
`,
  },
];
