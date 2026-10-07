import { randomBytes } from "node:crypto";
import { Db } from "../database/db.ts";
import { sharedMigrations } from "../database/migrations.ts";
import { Repo, type Tenant } from "../database/repo.ts";
import { FakeWhatsApp } from "../whatsapp/cloud-api.ts";
import { createLogger } from "../utils/logger.ts";
import { RateLimiter } from "../utils/rate-limit.ts";
import { createApp } from "../engine/server.ts";
import type { BotEnv, Robot } from "../engine/types.ts";

export const DEMO_ADMIN_TOKEN = "demo-demo-demo-1234";

/**
 * Sobe o painel com DADOS FICTÍCIOS em memória e relógio real, para demonstrações e vendas.
 * Nada é enviado ao WhatsApp (FakeWhatsApp). A chave do painel é DEMO_ADMIN_TOKEN.
 */
export async function startDemo<S>(robot: Robot<S>, settings: S, seed: (env: BotEnv, tenant: Tenant, now: Date) => void | Promise<void>, port = 3100): Promise<void> {
  const db = new Db(":memory:");
  db.migrate(sharedMigrations);
  db.migrate(robot.migrations);
  const env: BotEnv = {
    repo: new Repo(db), db, wa: new FakeWhatsApp(), ai: null, log: createLogger(), clock: () => new Date(),
    config: { appSecret: "demo", verifyToken: "demo", insecureSkipSignature: true, retentionDays: 180, trustProxy: false, handoffResumeHours: 12, sessionSecret: randomBytes(16).toString("hex"), cookieSecure: false },
    contactLimiter: new RateLimiter(1000, 60_000),
  };
  const tenant = env.repo.createTenant({ slug: "demo", nome: robot.knowledge(settings).empresa.nome, phone_number_id: "DEMO", admin_token: DEMO_ADMIN_TOKEN, settings: settings as object }, env.clock());
  await seed(env, tenant, env.clock());
  const app = createApp(env, robot);
  app.server.listen(port, () => {
    process.stdout.write(`\nDemonstração de ${robot.nome} em http://localhost:${port}/admin\nChave de acesso: ${DEMO_ADMIN_TOKEN}\n(dados fictícios, em memória; Ctrl+C para sair)\n\n`);
  });
}
