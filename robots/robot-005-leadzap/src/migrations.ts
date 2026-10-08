import type { Migration } from "../../../shared/database/db.ts";

export const migrations: Migration[] = [
  {
    id: "lead-001",
    sql: `
CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  finalidade TEXT NOT NULL CHECK (finalidade IN ('comprar','alugar')),
  tipo_id TEXT NOT NULL,
  tipo_nome TEXT NOT NULL,
  bairro TEXT NOT NULL,
  faixa_nome TEXT NOT NULL,
  faixa_min_cents INTEGER NOT NULL,
  faixa_max_cents INTEGER NOT NULL,
  quartos INTEGER NOT NULL DEFAULT 0,
  prazo TEXT NOT NULL CHECK (prazo IN ('urgente','curto','pesquisando')),
  nome TEXT NOT NULL,
  temperatura TEXT NOT NULL CHECK (temperatura IN ('quente','morno','frio')),
  pontos INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_contato','visita','ganho','perdido','sem_resposta')),
  corretor_id TEXT,
  imovel_interesse TEXT,
  perdido_motivo TEXT,
  followup_enviado INTEGER NOT NULL DEFAULT 0,
  ultimo_cliente_em TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, numero)
);
CREATE INDEX idx_leads_board ON leads (tenant_id, status, temperatura, created_at);
CREATE INDEX idx_leads_contact ON leads (tenant_id, contact_id, created_at);

CREATE TABLE visits (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  imovel_id TEXT NOT NULL,
  imovel_titulo TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada','confirmada','realizada','faltou','cancelada')),
  lembrete_enviado INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_visits_agenda ON visits (tenant_id, status, starts_at);
CREATE INDEX idx_visits_imovel ON visits (tenant_id, imovel_id, starts_at);
`,
  },
];
