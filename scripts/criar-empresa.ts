// Cadastra uma nova empresa em um robô já instalado.
// Uso: node scripts/criar-empresa.ts --robo robot-001-agendazap --slug barbearia-ze --config ./empresa.json [--phone-number-id 123456] [--db ./data/robot.db]
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { Db } from "../shared/database/db.ts";
import { sharedMigrations } from "../shared/database/migrations.ts";
import { Repo } from "../shared/database/repo.ts";
import { criarEmpresa } from "../shared/engine/tenants.ts";
import type { BotEnv } from "../shared/engine/types.ts";
import { registry } from "../robots/registry.ts";

const { values } = parseArgs({ options: {
  robo: { type: "string" }, slug: { type: "string" }, config: { type: "string" }, db: { type: "string", default: "./data/robot.db" },
  "phone-number-id": { type: "string" }, timezone: { type: "string" },
} });

if (!values.robo || !values.slug || !values.config) {
  console.error("Uso: node scripts/criar-empresa.ts --robo <id> --slug <nome-curto> --config <arquivo.json> [--phone-number-id <id>] [--db <caminho>]");
  console.error("Robôs disponíveis:", Object.keys(registry).join(", "));
  process.exit(1);
}
const robot = registry[values.robo];
if (!robot) { console.error(`Robô "${values.robo}" não existe. Disponíveis: ${Object.keys(registry).join(", ")}`); process.exit(1); }

const db = new Db(values.db!);
db.migrate(sharedMigrations);
db.migrate(robot.migrations);
const env = { repo: new Repo(db), db, clock: () => new Date() } as unknown as BotEnv;
try {
  const { tenant, adminToken } = criarEmpresa(env, robot, {
    slug: values.slug, config: JSON.parse(readFileSync(values.config, "utf8")),
    phoneNumberId: values["phone-number-id"], timezone: values.timezone,
  });
  console.log(`\nEmpresa "${tenant.nome}" criada (slug: ${tenant.slug}).`);
  console.log(`Chave de acesso ao painel (guarde agora, ela não será mostrada de novo):\n\n  ${adminToken}\n`);
} catch (e) {
  console.error("Erro:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  db.close();
}
