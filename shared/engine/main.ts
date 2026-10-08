import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { AnthropicProvider, type AiProvider } from "../ai/provider.ts";
import { Db } from "../database/db.ts";
import { sharedMigrations } from "../database/migrations.ts";
import { Repo, hashToken as hashOf, type Tenant } from "../database/repo.ts";
import { CloudApiClient } from "../whatsapp/cloud-api.ts";
import type { Outgoing, WhatsAppClient } from "../whatsapp/types.ts";
import { env as getEnv, envInt, loadEnvFile, requireEnv } from "../utils/config.ts";
import { createLogger } from "../utils/logger.ts";
import { RateLimiter } from "../utils/rate-limit.ts";
import { createTickRunner } from "./scheduler.ts";
import { createApp } from "./server.ts";
import type { AppConfig, BotEnv, Robot } from "./types.ts";

/** Modo DRY_RUN: não envia nada ao WhatsApp, apenas imprime — ideal para conhecer o painel localmente. */
class ConsoleWhatsApp implements WhatsAppClient {
  private n = 0;
  async send(to: string, msg: Outgoing): Promise<{ id: string }> {
    process.stdout.write(`[DRY_RUN] -> ${to}: ${JSON.stringify(msg)}\n`);
    return { id: `dry-${++this.n}` };
  }
}

export interface StartOptions { configPath?: string }

export function buildEnv(): BotEnv {
  const log = createLogger();
  const production = getEnv("NODE_ENV") === "production";
  const dryRun = getEnv("DRY_RUN") === "true";

  const config: AppConfig = {
    appSecret: getEnv("WHATSAPP_APP_SECRET", "")!,
    verifyToken: getEnv("WHATSAPP_VERIFY_TOKEN", "")!,
    insecureSkipSignature: dryRun && getEnv("INSECURE_SKIP_SIGNATURE") === "true",
    retentionDays: envInt("RETENTION_DAYS", 180),
    trustProxy: getEnv("TRUST_PROXY") === "true",
    handoffResumeHours: envInt("HANDOFF_RESUME_HOURS", 12),
    sessionSecret: getEnv("SESSION_SECRET") ?? (production ? requireEnv("SESSION_SECRET") : randomBytes(32).toString("hex")),
    cookieSecure: getEnv("COOKIE_SECURE", production ? "true" : "false") === "true",
    mediaDir: getEnv("MEDIA_DIR", "./data/media")!,
  };
  if (!dryRun && (!config.appSecret || !config.verifyToken)) {
    throw new Error("Defina WHATSAPP_APP_SECRET e WHATSAPP_VERIFY_TOKEN (ou use DRY_RUN=true para testar sem WhatsApp).");
  }

  const wa: WhatsAppClient = dryRun && !getEnv("WHATSAPP_TOKEN")
    ? new ConsoleWhatsApp()
    : new CloudApiClient({ token: requireEnv("WHATSAPP_TOKEN"), phoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID"), apiVersion: getEnv("WHATSAPP_API_VERSION", "v21.0") });

  const aiKey = getEnv("AI_API_KEY");
  const ai: AiProvider | null = aiKey ? new AnthropicProvider({ apiKey: aiKey, model: getEnv("AI_MODEL", "claude-haiku-5-5")! }) : null;

  const db = new Db(getEnv("DATABASE_PATH", "./data/robot.db")!);
  db.migrate(sharedMigrations);
  return { repo: new Repo(db), db, wa, ai, log, clock: () => new Date(), config, contactLimiter: new RateLimiter(30, 60_000) };
}

/** Cria (ou atualiza credenciais de) a empresa desta instalação. As configurações do painel nunca são sobrescritas. */
export function ensureTenant<S>(env: BotEnv, robot: Robot<S>, opts: StartOptions = {}): Tenant {
  const slug = getEnv("TENANT_SLUG", "default")!;
  const adminToken = getEnv("ADMIN_TOKEN");
  const phoneNumberId = getEnv("WHATSAPP_PHONE_NUMBER_ID") ?? null;
  const existing = env.repo.tenantBySlug(slug);

  if (existing) {
    if (adminToken) env.db.run("UPDATE tenants SET admin_token_hash = ? WHERE id = ?", hashOf(adminToken), existing.id);
    if (phoneNumberId && phoneNumberId !== existing.phone_number_id) env.db.run("UPDATE tenants SET phone_number_id = ? WHERE id = ?", phoneNumberId, existing.id);
    return env.repo.tenantById(existing.id)!;
  }

  if (!adminToken || adminToken.length < 16) throw new Error("Defina ADMIN_TOKEN com pelo menos 16 caracteres (é a senha do painel).");
  const cfgPath = opts.configPath ?? "./config/empresa.json";
  let raw: unknown = robot.defaultSettings();
  if (existsSync(cfgPath)) raw = JSON.parse(readFileSync(cfgPath, "utf8"));
  else env.log.warn("config_empresa_ausente_usando_padrao", { esperado: cfgPath });
  const v = robot.validateSettings(raw);
  if (!v.ok) throw new Error(`Configuração inválida em ${cfgPath}: ${v.error}`);
  return env.repo.createTenant({
    slug, nome: robot.knowledge(v.value).empresa.nome, phone_number_id: phoneNumberId, admin_token: adminToken,
    timezone: getEnv("TIMEZONE", "America/Sao_Paulo"), settings: v.value as object,
  }, env.clock());
}


export async function startRobot<S>(robot: Robot<S>, opts: StartOptions = {}): Promise<void> {
  // O .env pode estar na pasta atual, na pasta do robô ou na raiz do pacote (duas pastas acima do robô).
  const robotDir = opts.configPath ? dirname(dirname(opts.configPath)) : null;
  const found = loadEnvFile([".env", ...(robotDir ? [join(robotDir, ".env"), join(robotDir, "..", "..", ".env")] : [])]);
  const env = buildEnv();
  if (!found) env.log.warn("env_nao_encontrado_usando_variaveis_do_sistema", {});
  env.db.migrate(robot.migrations);
  const tenant = ensureTenant(env, robot, opts);
  const app = createApp(env, robot);

  const port = envInt("PORT", 3000);
  app.server.listen(port, () => env.log.info("robo_iniciado", { robo: robot.id, empresa: tenant.slug, porta: port }));

  const tick = createTickRunner(env, robot);
  const timer = setInterval(() => void tick(), envInt("TICK_SECONDS", 60) * 1000);

  const stop = () => {
    clearInterval(timer);
    app.server.close(() => { env.db.close(); process.exit(0); });
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}
