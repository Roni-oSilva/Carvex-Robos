// Painel de demonstração com dados fictícios (em memória). Uso: node demo/servidor-demo.ts
import { readFileSync } from "node:fs";
import { startDemo } from "../../../shared/testing/demo-server.ts";
import { agendaRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { AgendaStore } from "../src/store.ts";
import { addDays, localDate, zonedToUtc } from "../../../shared/utils/time.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);
const settings = cfg.value;

await startDemo(agendaRobot, settings, (env, tenant, now) => {
  const store = new AgendaStore(env.db);
  const tz = tenant.timezone;
  const nomes = ["Carlos Souza", "Pedro Lima", "Rafael Alves", "Lucas Pereira", "Marcelo Dias", "André Costa", "Felipe Rocha", "Bruno Martins"];
  let n = 0;
  for (let dia = -6; dia <= 3; dia++) {
    const ymd = addDays(localDate(now, tz), dia);
    const [y, m, d] = ymd.split("-").map(Number);
    for (const [hora, prof] of [[9, "joao"], [10, "marcos"], [11, "joao"], [14, "marcos"], [15, "joao"]] as const) {
      if ((dia + hora) % 3 === 0) continue;
      const nome = nomes[n++ % nomes.length];
      const c = env.repo.upsertContact(tenant.id, `55119${String(70000000 + n * 1111).slice(0, 8)}`, nome, now, "demo");
      const svc = settings.servicos[n % 3];
      const start = zonedToUtc(y, m, d, hora, 0, tz);
      const a = store.book({ tenantId: tenant.id, contactId: c.id, service: svc, professionalId: prof, professionalName: prof === "joao" ? "João" : "Marcos", start, source: "whatsapp" }, settings, new Date(start.getTime() - 5 * 86_400_000));
      if (!a) continue;
      if (start < now) store.setStatus(tenant.id, a.id, n % 7 === 0 ? "faltou" : "concluido", now);
      else if (n % 2 === 0) store.confirm(tenant.id, a.id, now);
      env.repo.event(tenant.id, "agendou", { id: a.id }, new Date(now.getTime() - n * 3_600_000));
    }
  }
  const c = env.repo.upsertContact(tenant.id, "5511988880000", "Cliente Exemplo", now, "demo");
  env.repo.touchInbound(c.id, now);
  const conv = env.repo.conversationFor(tenant.id, c.id, now);
  env.repo.saveConversation({ id: conv.id, state: "inicio", data: "{}", mode: "human", handoff_reason: "pergunta sem resposta na base" }, now);
  env.repo.logMessage({ tenantId: tenant.id, contactId: c.id, direction: "in", type: "text", body: "Vocês fazem hidratação de barba?" }, now);
  env.repo.logMessage({ tenantId: tenant.id, contactId: c.id, direction: "out", type: "text", body: "Não tenho essa informação no momento. Vou encaminhar você para um atendente." }, now);
});
