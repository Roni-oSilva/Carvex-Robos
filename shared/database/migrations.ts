import type { Migration } from "./db.ts";

/**
 * Esquema base compartilhado por todos os robôs.
 * Multiempresa: toda tabela carrega tenant_id. Telefones só em contacts.wa_id.
 * Para Postgres/Supabase, o mesmo esquema se traduz quase 1:1 (veja docs/TECHNICAL.md de cada robô).
 */
export const sharedMigrations: Migration[] = [
  {
    id: "shared-001-base",
    sql: `
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  phone_number_id TEXT UNIQUE,
  admin_token_hash TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  settings TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,
  nome TEXT,
  opt_out INTEGER NOT NULL DEFAULT 0,
  opt_out_at TEXT,
  consent_basis TEXT,
  last_inbound_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, wa_id)
);

CREATE TABLE conversations (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'inicio',
  data TEXT NOT NULL DEFAULT '{}',
  mode TEXT NOT NULL DEFAULT 'bot' CHECK (mode IN ('bot','human')),
  handoff_reason TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  wa_message_id TEXT,
  type TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_messages_contact ON messages (tenant_id, contact_id, created_at);
CREATE INDEX idx_messages_wamid ON messages (wa_message_id);

CREATE TABLE processed_messages (
  wa_message_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_events_type ON events (tenant_id, type, created_at);
`,
  },
];
