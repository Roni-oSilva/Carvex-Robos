import type { Migration } from "../../../shared/database/db.ts";

export const migrations: Migration[] = [
  {
    id: "agenda-001",
    sql: `
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado','confirmado','cancelado','concluido','faltou')),
  source TEXT NOT NULL DEFAULT 'whatsapp',
  confirmed_at TEXT,
  cancelled_at TEXT,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_appt_prof_time ON appointments (tenant_id, professional_id, starts_at);
CREATE INDEX idx_appt_contact ON appointments (tenant_id, contact_id, starts_at);

CREATE TABLE reminders (
  id INTEGER PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  hours_before INTEGER NOT NULL,
  due_at TEXT NOT NULL,
  sent_at TEXT,
  result TEXT,
  next_try_at TEXT
);
CREATE INDEX idx_reminders_due ON reminders (sent_at, due_at);

CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  professional_id TEXT,
  day TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando','avisado','atendido','cancelado')),
  created_at TEXT NOT NULL,
  notified_at TEXT
);
CREATE INDEX idx_waitlist_lookup ON waitlist (tenant_id, service_id, day, status);
`,
  },
];
