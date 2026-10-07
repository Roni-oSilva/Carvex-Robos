import type { Db, Migration } from "../database/db.ts";
import type { Repo, Tenant, Contact } from "../database/repo.ts";
import type { AiProvider } from "../ai/provider.ts";
import type { KnowledgeBase } from "../ai/knowledge.ts";
import type { Logger } from "../utils/logger.ts";
import type { Reply } from "../utils/http.ts";
import type { SafeHtml } from "../dashboard/html.ts";
import type { InboundMessage, Outgoing, WhatsAppClient } from "../whatsapp/types.ts";
import type { RateLimiter } from "../utils/rate-limit.ts";

export interface AppConfig {
  appSecret: string;
  verifyToken: string;
  /** Somente desenvolvimento local: aceita webhook sem assinatura. NUNCA em produção. */
  insecureSkipSignature: boolean;
  retentionDays: number;
  trustProxy: boolean;
  handoffResumeHours: number;
  sessionSecret: string;
  cookieSecure: boolean;
}

export interface BotEnv {
  repo: Repo;
  db: Db;
  wa: WhatsAppClient;
  ai: AiProvider | null;
  log: Logger;
  clock: () => Date;
  config: AppConfig;
  contactLimiter: RateLimiter;
}

/** Estado mutável da conversa; o motor grava ao final do turno. */
export interface ConvState {
  id: number;
  state: string;
  data: Record<string, unknown>;
  mode: "bot" | "human";
  handoff_reason: string | null;
}

export interface FlowContext<S> {
  env: BotEnv;
  tenant: Tenant;
  settings: S;
  contact: Contact;
  conv: ConvState;
  now: Date;
}

export interface AdminRequest {
  query: URLSearchParams;
  form: Record<string, string>;
  params: Record<string, string>;
}

export interface AdminContext<S> {
  env: BotEnv;
  tenant: Tenant;
  settings: S;
  now: Date;
  page(title: string, body: SafeHtml): Reply;
}

export interface AdminRoute<S> {
  method: "GET" | "POST";
  /** Caminho relativo a /admin, com :params. Ex.: "/agenda/:id/presenca" */
  path: string;
  handler(ctx: AdminContext<S>, req: AdminRequest): Reply | Promise<Reply>;
}

export interface Robot<S> {
  id: string;
  nome: string;
  version: string;
  migrations: Migration[];
  defaultSettings(): S;
  validateSettings(raw: unknown): { ok: true; value: S } | { ok: false; error: string };
  knowledge(settings: S): KnowledgeBase;
  handle(ctx: FlowContext<S>, msg: InboundMessage): Promise<Outgoing[]> | Outgoing[];
  /** Tarefas periódicas (lembretes, réguas...). Chamado a cada TICK_SECONDS. */
  tick?(env: BotEnv, now: Date): Promise<void>;
  admin: {
    nav: { href: string; label: string }[];
    home(ctx: AdminContext<S>): SafeHtml;
    routes: AdminRoute<S>[];
  };
  /** Retorna um motivo (string) para BLOQUEAR a exclusão LGPD do contato, ou null para permitir. */
  beforeDeleteContact?(env: BotEnv, tenantId: number, contactId: number): string | null;
}
