// Painel de demonstração com dados fictícios (em memória). Uso: node demo/servidor-demo.ts
import { readFileSync, mkdirSync } from "node:fs";
import { startDemo } from "../../../shared/testing/demo-server.ts";
import { orcaRobot } from "../src/robot.ts";
import { validateSettings } from "../src/settings.ts";
import { OrcaStore, type QuoteStatus } from "../src/store.ts";

const cfg = validateSettings(JSON.parse(readFileSync(new URL("../config/empresa.exemplo.json", import.meta.url), "utf8")));
if (!cfg.ok) throw new Error(cfg.error);

await startDemo(orcaRobot, cfg.value, (env, tenant, now) => {
  mkdirSync(env.config.mediaDir, { recursive: true });
  const st = new OrcaStore(env.db);
  const nomes = ["Ana Paula", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Nunes", "Fábio Reis", "Gabi Souza"];
  const sv = [["pintura", "Pintura"], ["eletrica", "Elétrica"], ["hidraulica", "Hidráulica"], ["gesso", "Gesso e forro"], ["ar-cond", "Ar-condicionado"]] as const;
  const status: QuoteStatus[] = ["novo", "novo", "em_analise", "enviado", "enviado", "aceito", "recusado"];
  nomes.forEach((nome, i) => {
    const c = env.repo.upsertContact(tenant.id, `55119${String(76000000 + i * 90001).slice(0, 8)}`, nome, now, "demo");
    const criado = new Date(now.getTime() - (30 - i * 4) * 3_600_000);
    const q = st.criar({
      tenantId: tenant.id, contactId: c.id, servicoId: sv[i % 5][0], servicoNome: sv[i % 5][1], descricao: "Serviço de exemplo para demonstração do painel.",
      bairro: "Centro", endereco: `Rua das Flores, ${100 + i * 7}`, periodo: (["manha", "tarde", "qualquer"] as const)[i % 3], nome, fotos: [],
    }, criado);
    if (status[i] === "enviado" || status[i] === "aceito" || status[i] === "recusado") {
      st.enviarProposta(tenant.id, q.id, { valorCents: 80000 + i * 35000, prazoTexto: "3 dias úteis", obs: null, validadeDias: 7, followupHoras: 24 }, new Date(criado.getTime() + 5 * 3_600_000));
    }
    if (status[i] !== "enviado" && status[i] !== "novo") st.setStatus(tenant.id, q.id, status[i], new Date(criado.getTime() + 9 * 3_600_000));
    if (status[i] === "recusado") env.db.run("UPDATE quotes SET recusa_motivo = ? WHERE id = ?", "Achei o prazo longo", q.id);
  });
});
