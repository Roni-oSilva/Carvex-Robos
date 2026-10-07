// Painel de demonstração com dados fictícios (em memória). Uso: node demo/servidor-demo.ts
import { readFileSync } from "node:fs";
import { startDemo } from "../../../shared/testing/demo-server.ts";
import { addDays, localDate } from "../../../shared/utils/time.ts";
import { cobraRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { CobraStore } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);

await startDemo(cobraRobot, cfg.value, (env, tenant, now) => {
  const st = new CobraStore(env.db);
  const hoje = localDate(now, tenant.timezone);
  const clientes = ["Maria Souza", "João Pereira", "Ana Lima", "Carlos Alves", "Fernanda Rocha", "Paulo Dias", "Juliana Costa", "Ricardo Melo"];
  clientes.forEach((nome, i) => {
    const c = env.repo.upsertContact(tenant.id, `55119${String(81000000 + i * 123457).slice(0, 8)}`, nome, now, "relacao_contratual");
    const venc = addDays(hoje, [-20, -8, -3, 0, 2, 6, -1, -35][i]);
    const id = st.create({ tenantId: tenant.id, contactId: c.id, reference: `MENS-${1000 + i}`, description: i % 3 === 0 ? "Plano trimestral" : "Mensalidade", amountCents: [15000, 18000, 9900, 15000, 15000, 21000, 15000, 30000][i], dueDate: venc }, now)!;
    if (i === 3) st.setStatus(tenant.id, id, "em_conferencia", now);
    if (i === 5) st.setStatus(tenant.id, id, "paga", now);
    if (i === 1) st.propose(tenant.id, id, 3, 6000, 18000, now);
  });
  for (const t of ["cobranca_enviada", "cobranca_enviada", "cobranca_enviada", "optout"]) env.repo.event(tenant.id, t, {}, now);
});
