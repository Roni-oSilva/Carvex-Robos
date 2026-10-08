import type { Db } from "../../../shared/database/db.ts";
import { removerImagem } from "../../../shared/media/store.ts";

export type QuoteStatus = "novo" | "em_analise" | "enviado" | "aceito" | "recusado" | "expirado" | "cancelado";
export type Periodo = "manha" | "tarde" | "qualquer";
export interface Quote {
  id: number; tenant_id: number; contact_id: number; numero: number; servico_id: string; servico_nome: string; descricao: string;
  bairro: string; endereco: string | null; periodo: Periodo; nome: string; status: QuoteStatus; valor_cents: number | null;
  prazo_texto: string | null; obs_proposta: string | null; enviado_em: string | null; validade_ate: string | null; followup_em: string | null;
  followup_enviado: number; recusa_motivo: string | null; created_at: string; updated_at: string;
}
export interface Photo { id: number; tenant_id: number; contact_id: number; quote_id: number | null; arquivo: string; mime: string; bytes: number; created_at: string }

export interface NovoOrcamento {
  tenantId: number; contactId: number; servicoId: string; servicoNome: string; descricao: string; bairro: string; endereco: string | null;
  periodo: Periodo; nome: string; fotos: string[];
}

export const ABERTOS = "('novo','em_analise','enviado')";

export class OrcaStore {
  db: Db;
  constructor(db: Db) { this.db = db; }

  get(tenantId: number, id: number): Quote | undefined {
    return this.db.get<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND id = ?", tenantId, id);
  }
  ultimoDe(tenantId: number, contactId: number): Quote | undefined {
    return this.db.get<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND contact_id = ? ORDER BY id DESC LIMIT 1", tenantId, contactId);
  }
  fotos(quoteId: number): Photo[] {
    return this.db.all<Photo>("SELECT * FROM quote_photos WHERE quote_id = ? ORDER BY id", quoteId);
  }
  fotoDoTenant(tenantId: number, arquivo: string): Photo | undefined {
    return this.db.get<Photo>("SELECT * FROM quote_photos WHERE tenant_id = ? AND arquivo = ?", tenantId, arquivo);
  }
  /** Foto recebida durante a conversa, ainda sem orçamento. */
  addFoto(tenantId: number, contactId: number, f: { arquivo: string; mime: string; bytes: number }, now: Date): void {
    this.db.run("INSERT INTO quote_photos (tenant_id, contact_id, quote_id, arquivo, mime, bytes, created_at) VALUES (?,?,NULL,?,?,?,?)", tenantId, contactId, f.arquivo, f.mime, f.bytes, now.toISOString());
  }

  /** Cria o orçamento numa transação: número sequencial por empresa + vínculo das fotos já recebidas. */
  criar(p: NovoOrcamento, now: Date): Quote {
    return this.db.tx(() => {
      const numero = this.db.get<{ n: number }>("SELECT COALESCE(MAX(numero), 0) + 1 AS n FROM quotes WHERE tenant_id = ?", p.tenantId)!.n;
      const r = this.db.run(
        `INSERT INTO quotes (tenant_id, contact_id, numero, servico_id, servico_nome, descricao, bairro, endereco, periodo, nome, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        p.tenantId, p.contactId, numero, p.servicoId, p.servicoNome, p.descricao, p.bairro, p.endereco, p.periodo, p.nome, now.toISOString(), now.toISOString());
      for (const a of p.fotos) this.db.run("UPDATE quote_photos SET quote_id = ? WHERE tenant_id = ? AND contact_id = ? AND arquivo = ? AND quote_id IS NULL", r.lastId, p.tenantId, p.contactId, a);
      return this.get(p.tenantId, r.lastId)!;
    });
  }

  setStatus(tenantId: number, id: number, status: QuoteStatus, now: Date): void {
    this.db.run("UPDATE quotes SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", status, now.toISOString(), tenantId, id);
  }

  enviarProposta(tenantId: number, id: number, p: { valorCents: number; prazoTexto: string; obs: string | null; validadeDias: number; followupHoras: number }, now: Date): void {
    const validade = new Date(now.getTime() + p.validadeDias * 86_400_000).toISOString();
    const follow = new Date(now.getTime() + p.followupHoras * 3_600_000).toISOString();
    this.db.run(
      `UPDATE quotes SET status = 'enviado', valor_cents = ?, prazo_texto = ?, obs_proposta = ?, enviado_em = ?, validade_ate = ?, followup_em = ?, followup_enviado = 0, updated_at = ?
       WHERE tenant_id = ? AND id = ?`, p.valorCents, p.prazoTexto, p.obs, now.toISOString(), validade, follow, now.toISOString(), tenantId, id);
  }

  /** Apaga fotos (arquivo + linha) por condição já resolvida em SQL. Devolve quantas. */
  apagarFotos(dir: string, fotos: Photo[]): number {
    for (const f of fotos) {
      removerImagem(dir, f.arquivo);
      this.db.run("DELETE FROM quote_photos WHERE id = ?", f.id);
    }
    return fotos.length;
  }
}
