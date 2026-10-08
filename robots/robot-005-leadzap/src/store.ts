import type { Db } from "../../../shared/database/db.ts";
import type { Finalidade } from "./settings.ts";

export type Prazo = "urgente" | "curto" | "pesquisando";
export type Temperatura = "quente" | "morno" | "frio";
export type LeadStatus = "novo" | "em_contato" | "visita" | "ganho" | "perdido" | "sem_resposta";
export type VisitStatus = "agendada" | "confirmada" | "realizada" | "faltou" | "cancelada";

export interface Lead {
  id: number; tenant_id: number; contact_id: number; numero: number; finalidade: Finalidade; tipo_id: string; tipo_nome: string; bairro: string;
  faixa_nome: string; faixa_min_cents: number; faixa_max_cents: number; quartos: number; prazo: Prazo; nome: string; temperatura: Temperatura; pontos: number;
  status: LeadStatus; corretor_id: string | null; imovel_interesse: string | null; perdido_motivo: string | null; followup_enviado: number;
  ultimo_cliente_em: string; created_at: string; updated_at: string;
}
export interface Visit { id: number; tenant_id: number; lead_id: number; contact_id: number; imovel_id: string; imovel_titulo: string; starts_at: string; status: VisitStatus; lembrete_enviado: number; created_at: string; updated_at: string }

export interface NovoLead {
  tenantId: number; contactId: number; finalidade: Finalidade; tipoId: string; tipoNome: string; bairro: string; faixaNome: string; faixaMinCents: number; faixaMaxCents: number;
  quartos: number; prazo: Prazo; nome: string; temperatura: Temperatura; pontos: number; corretorId: string | null; interesse: string | null;
}

export const VISITA_ATIVA = "('agendada','confirmada')";

export class LeadStore {
  db: Db;
  constructor(db: Db) { this.db = db; }

  get(tenantId: number, id: number): Lead | undefined { return this.db.get<Lead>("SELECT * FROM leads WHERE tenant_id = ? AND id = ?", tenantId, id); }
  ultimoDe(tenantId: number, contactId: number): Lead | undefined { return this.db.get<Lead>("SELECT * FROM leads WHERE tenant_id = ? AND contact_id = ? ORDER BY id DESC LIMIT 1", tenantId, contactId); }
  visita(tenantId: number, id: number): Visit | undefined { return this.db.get<Visit>("SELECT * FROM visits WHERE tenant_id = ? AND id = ?", tenantId, id); }
  proximaVisitaDe(tenantId: number, contactId: number, now: Date): Visit | undefined {
    return this.db.get<Visit>(`SELECT * FROM visits WHERE tenant_id = ? AND contact_id = ? AND status IN ${VISITA_ATIVA} AND starts_at > ? ORDER BY starts_at LIMIT 1`, tenantId, contactId, now.toISOString());
  }

  criar(p: NovoLead, now: Date): Lead {
    return this.db.tx(() => {
      const numero = this.db.get<{ n: number }>("SELECT COALESCE(MAX(numero), 0) + 1 AS n FROM leads WHERE tenant_id = ?", p.tenantId)!.n;
      const r = this.db.run(
        `INSERT INTO leads (tenant_id, contact_id, numero, finalidade, tipo_id, tipo_nome, bairro, faixa_nome, faixa_min_cents, faixa_max_cents, quartos, prazo, nome, temperatura, pontos, corretor_id, imovel_interesse, ultimo_cliente_em, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        p.tenantId, p.contactId, numero, p.finalidade, p.tipoId, p.tipoNome, p.bairro, p.faixaNome, p.faixaMinCents, p.faixaMaxCents, p.quartos, p.prazo, p.nome, p.temperatura, p.pontos, p.corretorId, p.interesse, now.toISOString(), now.toISOString(), now.toISOString());
      return this.get(p.tenantId, r.lastId)!;
    });
  }

  setStatus(tenantId: number, id: number, status: LeadStatus, now: Date, motivo?: string): void {
    this.db.run("UPDATE leads SET status = ?, perdido_motivo = COALESCE(?, perdido_motivo), updated_at = ? WHERE tenant_id = ? AND id = ?", status, motivo ?? null, now.toISOString(), tenantId, id);
  }
  /** Marca que o cliente escreveu agora (zera o acompanhamento de "sem resposta"). */
  tocaCliente(tenantId: number, contactId: number, now: Date): void {
    this.db.run("UPDATE leads SET ultimo_cliente_em = ?, status = CASE WHEN status = 'sem_resposta' THEN 'novo' ELSE status END WHERE tenant_id = ? AND contact_id = ? AND status NOT IN ('ganho','perdido')", now.toISOString(), tenantId, contactId);
  }

  criarVisita(p: { tenantId: number; leadId: number; contactId: number; imovelId: string; imovelTitulo: string; startsAt: Date }, now: Date): Visit {
    return this.db.tx(() => {
      const r = this.db.run("INSERT INTO visits (tenant_id, lead_id, contact_id, imovel_id, imovel_titulo, starts_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
        p.tenantId, p.leadId, p.contactId, p.imovelId, p.imovelTitulo, p.startsAt.toISOString(), now.toISOString(), now.toISOString());
      this.db.run("UPDATE leads SET status = CASE WHEN status IN ('novo','em_contato','sem_resposta') THEN 'visita' ELSE status END, imovel_interesse = ?, updated_at = ? WHERE id = ?", p.imovelId, now.toISOString(), p.leadId);
      return this.visita(p.tenantId, r.lastId)!;
    });
  }
  setVisita(tenantId: number, id: number, status: VisitStatus, now: Date): void {
    this.db.run("UPDATE visits SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", status, now.toISOString(), tenantId, id);
  }
  /** O horário já está ocupado para este imóvel? (impede duas visitas ao mesmo imóvel na mesma hora) */
  ocupado(tenantId: number, imovelId: string, startsAt: Date): boolean {
    return !!this.db.get(`SELECT 1 FROM visits WHERE tenant_id = ? AND imovel_id = ? AND starts_at = ? AND status IN ${VISITA_ATIVA}`, tenantId, imovelId, startsAt.toISOString());
  }
}
