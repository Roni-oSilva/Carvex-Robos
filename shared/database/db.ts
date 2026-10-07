import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

type Param = string | number | null | bigint | Uint8Array;

export interface Migration { id: string; sql: string }

/** Wrapper fino sobre node:sqlite (embutido no Node 22+; sem dependências nativas para instalar). */
export class Db {
  raw: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.raw = new DatabaseSync(path);
    this.raw.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  }

  private p(params: unknown[]): Param[] {
    return params.map((x) => (x === undefined ? null : typeof x === "boolean" ? (x ? 1 : 0) : (x as Param)));
  }

  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    return this.raw.prepare(sql).all(...this.p(params)) as unknown as T[];
  }

  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    return this.raw.prepare(sql).get(...this.p(params)) as unknown as T | undefined;
  }

  run(sql: string, ...params: unknown[]): { changes: number; lastId: number } {
    const r = this.raw.prepare(sql).run(...this.p(params));
    return { changes: Number(r.changes), lastId: Number(r.lastInsertRowid) };
  }

  /** Executa `fn` dentro de uma transação; reverte tudo se lançar erro. */
  tx<T>(fn: () => T): T {
    this.raw.exec("BEGIN IMMEDIATE");
    try {
      const out = fn();
      this.raw.exec("COMMIT");
      return out;
    } catch (e) {
      this.raw.exec("ROLLBACK");
      throw e;
    }
  }

  /** Aplica migrações ainda não registradas (idempotente). */
  migrate(migrations: Migration[]): void {
    this.raw.exec("CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
    for (const m of migrations) {
      if (this.get("SELECT id FROM _migrations WHERE id = ?", m.id)) continue;
      this.tx(() => {
        this.raw.exec(m.sql);
        this.run("INSERT INTO _migrations (id, applied_at) VALUES (?, ?)", m.id, new Date().toISOString());
      });
    }
  }

  close(): void {
    this.raw.close();
  }
}
