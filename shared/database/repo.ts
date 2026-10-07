import { createHash, timingSafeEqual } from "node:crypto";
import type { Db } from "./db.ts";

export interface Tenant {
  id: number; slug: string; nome: string; phone_number_id: string | null;
  admin_token_hash: string | null; timezone: string; settings: string; created_at: string;
}
export interface Contact {
  id: number; tenant_id: number; wa_id: string; nome: string | null; opt_out: number;
  opt_out_at: string | null; consent_basis: string | null; last_inbound_at: string | null; created_at: string;
}
export interface Conversation {
  id: number; tenant_id: number; contact_id: number; state: string; data: string;
  mode: "bot" | "human"; handoff_reason: string | null; updated_at: string;
}
export interface MessageRow {
  id: number; tenant_id: number; contact_id: number; direction: "in" | "out";
  wa_message_id: string | null; type: string; body: string; status: string; created_at: string;
}

export const hashToken = (t: string): string => createHash("sha256").update(t).digest("hex");

export function tokenMatches(token: string, hash: string | null): boolean {
  if (!hash) return false;
  const a = Buffer.from(hashToken(token)), b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class Repo {
  db: Db;
  constructor(db: Db) { this.db = db; }

  // ---- tenants
  tenantBySlug(slug: string): Tenant | undefined { return this.db.get<Tenant>("SELECT * FROM tenants WHERE slug = ?", slug); }
  tenantById(id: number): Tenant | undefined { return this.db.get<Tenant>("SELECT * FROM tenants WHERE id = ?", id); }
  tenantByPhoneNumberId(pnid: string): Tenant | undefined { return this.db.get<Tenant>("SELECT * FROM tenants WHERE phone_number_id = ?", pnid); }
  tenants(): Tenant[] { return this.db.all<Tenant>("SELECT * FROM tenants ORDER BY id"); }

  tenantByAdminToken(token: string): Tenant | undefined {
    return this.db.get<Tenant>("SELECT * FROM tenants WHERE admin_token_hash = ?", hashToken(token));
  }

  createTenant(t: { slug: string; nome: string; phone_number_id?: string | null; admin_token?: string | null; timezone?: string; settings: object }, now: Date): Tenant {
    const r = this.db.run(
      "INSERT INTO tenants (slug, nome, phone_number_id, admin_token_hash, timezone, settings, created_at) VALUES (?,?,?,?,?,?,?)",
      t.slug, t.nome, t.phone_number_id ?? null, t.admin_token ? hashToken(t.admin_token) : null,
      t.timezone ?? "America/Sao_Paulo", JSON.stringify(t.settings), now.toISOString(),
    );
    return this.tenantById(r.lastId)!;
  }

  updateTenantSettings(id: number, settings: object): void {
    this.db.run("UPDATE tenants SET settings = ? WHERE id = ?", JSON.stringify(settings), id);
  }

  // ---- contatos
  contact(tenantId: number, id: number): Contact | undefined {
    return this.db.get<Contact>("SELECT * FROM contacts WHERE tenant_id = ? AND id = ?", tenantId, id);
  }

  contactByWaId(tenantId: number, waId: string): Contact | undefined {
    return this.db.get<Contact>("SELECT * FROM contacts WHERE tenant_id = ? AND wa_id = ?", tenantId, waId);
  }

  upsertContact(tenantId: number, waId: string, nome: string | undefined, now: Date, consentBasis?: string): Contact {
    const existing = this.contactByWaId(tenantId, waId);
    if (existing) {
      if (nome && !existing.nome) this.db.run("UPDATE contacts SET nome = ? WHERE id = ?", nome, existing.id);
      return this.contact(tenantId, existing.id)!;
    }
    const r = this.db.run(
      "INSERT INTO contacts (tenant_id, wa_id, nome, consent_basis, created_at) VALUES (?,?,?,?,?)",
      tenantId, waId, nome ?? null, consentBasis ?? null, now.toISOString(),
    );
    return this.contact(tenantId, r.lastId)!;
  }

  touchInbound(contactId: number, now: Date): void {
    this.db.run("UPDATE contacts SET last_inbound_at = ? WHERE id = ?", now.toISOString(), contactId);
  }

  setOptOut(contactId: number, optOut: boolean, now: Date): void {
    this.db.run("UPDATE contacts SET opt_out = ?, opt_out_at = ? WHERE id = ?", optOut ? 1 : 0, optOut ? now.toISOString() : null, contactId);
  }

  contacts(tenantId: number, limit = 200): Contact[] {
    return this.db.all<Contact>("SELECT * FROM contacts WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?", tenantId, limit);
  }

  /** LGPD: apaga contato e tudo ligado a ele (ON DELETE CASCADE). */
  deleteContact(tenantId: number, contactId: number): void {
    this.db.run("DELETE FROM contacts WHERE tenant_id = ? AND id = ?", tenantId, contactId);
  }

  // ---- conversas
  conversationFor(tenantId: number, contactId: number, now: Date): Conversation {
    const c = this.db.get<Conversation>("SELECT * FROM conversations WHERE contact_id = ?", contactId);
    if (c) return c;
    const r = this.db.run("INSERT INTO conversations (tenant_id, contact_id, updated_at) VALUES (?,?,?)", tenantId, contactId, now.toISOString());
    return this.db.get<Conversation>("SELECT * FROM conversations WHERE id = ?", r.lastId)!;
  }

  saveConversation(c: { id: number; state: string; data: string; mode: "bot" | "human"; handoff_reason: string | null }, now: Date): void {
    this.db.run("UPDATE conversations SET state = ?, data = ?, mode = ?, handoff_reason = ?, updated_at = ? WHERE id = ?",
      c.state, c.data, c.mode, c.handoff_reason, now.toISOString(), c.id);
  }

  conversations(tenantId: number, limit = 100): (Conversation & { wa_id: string; nome: string | null })[] {
    return this.db.all(
      `SELECT v.*, c.wa_id, c.nome FROM conversations v JOIN contacts c ON c.id = v.contact_id
       WHERE v.tenant_id = ? ORDER BY (v.mode = 'human') DESC, v.updated_at DESC LIMIT ?`, tenantId, limit);
  }

  // ---- mensagens
  logMessage(m: { tenantId: number; contactId: number; direction: "in" | "out"; waMessageId?: string | null; type: string; body: string; status?: string }, now: Date): void {
    this.db.run("INSERT INTO messages (tenant_id, contact_id, direction, wa_message_id, type, body, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
      m.tenantId, m.contactId, m.direction, m.waMessageId ?? null, m.type, m.body, m.status ?? "ok", now.toISOString());
  }

  setMessageStatus(waMessageId: string, status: string): void {
    this.db.run("UPDATE messages SET status = ? WHERE wa_message_id = ? AND direction = 'out'", status, waMessageId);
  }

  messages(tenantId: number, contactId: number, limit = 50): MessageRow[] {
    return this.db.all<MessageRow>(
      "SELECT * FROM (SELECT * FROM messages WHERE tenant_id = ? AND contact_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id", tenantId, contactId, limit);
  }

  /** LGPD: apaga mensagens mais antigas que `days`. Retorna quantas foram removidas. */
  purgeMessagesOlderThan(days: number, now: Date): number {
    const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString();
    return this.db.run("DELETE FROM messages WHERE created_at < ?", cutoff).changes;
  }

  // ---- idempotência (a Meta reenvia webhooks)
  /** true se é a primeira vez que vemos este id. */
  markProcessed(waMessageId: string, now: Date): boolean {
    const r = this.db.run("INSERT OR IGNORE INTO processed_messages (wa_message_id, created_at) VALUES (?, ?)", waMessageId, now.toISOString());
    return r.changes === 1;
  }

  // ---- métricas
  event(tenantId: number, type: string, data: object, now: Date): void {
    this.db.run("INSERT INTO events (tenant_id, type, data, created_at) VALUES (?,?,?,?)", tenantId, type, JSON.stringify(data), now.toISOString());
  }

  countEvents(tenantId: number, type: string, sinceIso: string): number {
    return this.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM events WHERE tenant_id = ? AND type = ? AND created_at >= ?", tenantId, type, sinceIso)?.n ?? 0;
  }
}
