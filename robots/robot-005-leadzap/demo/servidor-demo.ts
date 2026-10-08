// Painel de demonstração com dados fictícios (em memória). Uso: node demo/servidor-demo.ts
import { readFileSync } from "node:fs";
import { startDemo } from "../../../shared/testing/demo-server.ts";
import { leadRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { LeadStore, type LeadStatus, type Prazo, type Temperatura } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);

await startDemo(leadRobot, cfg.value, (env, tenant, now) => {
  const st = new LeadStore(env.db);
  const nomes = ["Ana Paula", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Nunes", "Fábio Reis", "Gabi Souza", "Hugo Alves"];
  const temp: Temperatura[] = ["quente", "quente", "morno", "morno", "frio", "frio", "quente", "morno"];
  const prazo: Prazo[] = ["urgente", "urgente", "curto", "curto", "pesquisando", "pesquisando", "urgente", "curto"];
  const status: LeadStatus[] = ["novo", "visita", "novo", "em_contato", "sem_resposta", "novo", "ganho", "perdido"];
  const bairros = ["Centro", "Jardim América", "Vila Nova", "Bela Vista"];
  nomes.forEach((nome, i) => {
    const c = env.repo.upsertContact(tenant.id, `55119${String(76000000 + i * 90001).slice(0, 8)}`, nome, now, "demo");
    const criado = new Date(now.getTime() - (40 - i * 5) * 3_600_000);
    const alugar = i % 2 === 0;
    const l = st.criar({
      tenantId: tenant.id, contactId: c.id, finalidade: alugar ? "alugar" : "comprar", tipoId: "apartamento", tipoNome: "Apartamento", bairro: bairros[i % 4],
      faixaNome: alugar ? "R$ 1.500 a 3.000" : "R$ 300 a 600 mil", faixaMinCents: alugar ? 150000 : 30000000, faixaMaxCents: alugar ? 300000 : 60000000, quartos: 2,
      prazo: prazo[i], nome, temperatura: temp[i], pontos: temp[i] === "quente" ? 7 : temp[i] === "morno" ? 3 : 0, corretorId: ["marcos", "patricia", "geral"][i % 3], interesse: null,
    }, criado);
    if (status[i] !== "novo") st.setStatus(tenant.id, l.id, status[i], new Date(criado.getTime() + 6 * 3_600_000), status[i] === "perdido" ? "comprou com outra imobiliária" : undefined);
    if (status[i] === "visita") st.criarVisita({ tenantId: tenant.id, leadId: l.id, contactId: c.id, imovelId: "ap-centro-2q", imovelTitulo: "Apartamento 2 quartos no Centro", startsAt: new Date(now.getTime() + 20 * 3_600_000) }, criado);
  });
});
