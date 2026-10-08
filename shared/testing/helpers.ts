import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { signBody } from "../whatsapp/webhook.ts";
import { FakeWhatsApp } from "../whatsapp/cloud-api.ts";
import { Db } from "../database/db.ts";
import { sharedMigrations } from "../database/migrations.ts";
import { Repo, type Tenant } from "../database/repo.ts";
import { silentLogger } from "../utils/logger.ts";
import { RateLimiter } from "../utils/rate-limit.ts";
import { processInbound, type InboundOutcome } from "../engine/engine.ts";
import { createApp, type App } from "../engine/server.ts";
import type { AiProvider } from "../ai/provider.ts";
import type { AppConfig, BotEnv, Robot } from "../engine/types.ts";
import type { InboundMessage } from "../whatsapp/types.ts";

export const TEST_SECRET = "segredo-de-teste-do-app";
export const TEST_VERIFY = "token-verificacao-teste";
export const TEST_ADMIN = "chave-admin-de-teste-123456";
export const PHONE_NUMBER_ID = "100200300";

export interface TestWorld<S> {
  env: BotEnv;
  wa: FakeWhatsApp;
  robot: Robot<S>;
  tenant: Tenant;
  /** Relógio controlável. */
  setNow(d: Date): void;
  advance(ms: number): void;
  /** Simula o cliente escrevendo (texto) ou clicando (replyId). */
  say(from: string, text: string, opts?: { replyId?: string; name?: string; type?: InboundMessage["type"] }): Promise<InboundOutcome>;
  /** Textos enviados desde a última chamada, e zera o buffer. */
  drain(to?: string): string[];
  app(): App;
}

export function makeWorld<S>(robot: Robot<S>, opts: { settings?: S; now?: Date; ai?: AiProvider | null; config?: Partial<AppConfig> } = {}): TestWorld<S> {
  let now = opts.now ?? new Date("2026-10-07T15:00:00Z"); // 12:00 em São Paulo
  const db = new Db(":memory:");
  db.migrate(sharedMigrations);
  db.migrate(robot.migrations);
  const wa = new FakeWhatsApp();
  const config: AppConfig = {
    appSecret: TEST_SECRET, verifyToken: TEST_VERIFY, insecureSkipSignature: false, retentionDays: 180,
    trustProxy: false, handoffResumeHours: 12, sessionSecret: "sessao-de-teste", cookieSecure: false, mediaDir: mkdtempSync(join(tmpdir(), "midia-teste-")), ...opts.config,
  };
  const env: BotEnv = { repo: new Repo(db), db, wa, ai: opts.ai ?? null, log: silentLogger, clock: () => now, config, contactLimiter: new RateLimiter(1000, 60_000) };
  const settings = opts.settings ?? robot.defaultSettings();
  const tenant = env.repo.createTenant({
    slug: "teste", nome: robot.knowledge(settings).empresa.nome, phone_number_id: PHONE_NUMBER_ID, admin_token: TEST_ADMIN, settings: settings as object,
  }, now);

  let seq = 0;
  const cursors = new Map<string, number>();
  return {
    env, wa, robot, tenant,
    setNow: (d) => { now = d; },
    advance: (ms) => { now = new Date(now.getTime() + ms); },
    async say(from, text, o = {}) {
      const msg: InboundMessage = {
        id: `wamid.IN${++seq}`, from, name: o.name, timestamp: Math.floor(now.getTime() / 1000),
        type: o.type ?? (o.replyId ? "button" : "text"), text, replyId: o.replyId, phoneNumberId: PHONE_NUMBER_ID,
      };
      return processInbound(env, robot, msg);
    },
    drain(to) {
      // Cada destinatário (e o "todos") tem o seu próprio ponto de leitura.
      const key = to ?? "*";
      const from = cursors.get(key) ?? 0;
      cursors.set(key, wa.sent.length);
      return FakeWhatsApp.format(wa.sent.slice(from).filter((s) => !to || s.to === to));
    },
    app: () => createApp(env, robot),
  };
}

/** Payload no formato real da Cloud API. */
export function webhookPayload(from: string, text: string, id = `wamid.T${Math.random().toString(36).slice(2)}`, phoneNumberId = PHONE_NUMBER_ID): object {
  return {
    object: "whatsapp_business_account",
    entry: [{ id: "WABA", changes: [{ field: "messages", value: {
      messaging_product: "whatsapp", metadata: { display_phone_number: "5511999990000", phone_number_id: phoneNumberId },
      contacts: [{ profile: { name: "Cliente Teste" }, wa_id: from }],
      messages: [{ from, id, timestamp: "1790000000", type: "text", text: { body: text } }],
    } }] }],
  };
}

export function signedHeaders(body: string): Record<string, string> {
  return { "content-type": "application/json", "x-hub-signature-256": signBody(body, TEST_SECRET) };
}
