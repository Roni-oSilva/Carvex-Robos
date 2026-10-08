import type { Robot } from "../../../shared/engine/types.ts";
import { removerImagem } from "../../../shared/media/store.ts";
import { adminRoutes, home } from "./admin.ts";
import { rodarAcompanhamento } from "./followup.ts";
import { handleOrca } from "./flow.ts";
import { migrations } from "./migrations.ts";
import { defaultSettings, knowledge, validateSettings, type OrcaSettings } from "./settings.ts";
import { OrcaStore, type Photo } from "./store.ts";

export const orcaRobot: Robot<OrcaSettings> = {
  id: "robot-004-orcazap",
  nome: "OrcaZap",
  version: "1.0.0",
  migrations,
  defaultSettings,
  validateSettings,
  knowledge,
  handle: handleOrca,
  async tick(env, now) {
    await rodarAcompanhamento(env, orcaRobot, now);
  },
  admin: {
    nav: [{ href: "/admin/orcamentos", label: "Orçamentos" }, { href: "/admin/historico", label: "Histórico" }],
    home,
    routes: adminRoutes,
  },
  beforeDeleteContact(env, tenantId, contactId) {
    const n = env.db.get<{ n: number }>("SELECT COUNT(*) n FROM quotes WHERE tenant_id = ? AND contact_id = ? AND status IN ('novo','em_analise','enviado','aceito')", tenantId, contactId)!.n;
    return n > 0 ? "há orçamento em andamento ou aceito. Conclua ou cancele antes de excluir." : null;
  },
  onDeleteContact(env, tenantId, contactId) {
    const fotos = env.db.all<Photo>("SELECT * FROM quote_photos WHERE tenant_id = ? AND contact_id = ?", tenantId, contactId);
    for (const f of fotos) removerImagem(env.config.mediaDir, f.arquivo);
  },
  limpar(env, now, retentionDays) {
    const store = new OrcaStore(env.db);
    // Fotos de pedidos que o cliente nunca terminou: 2 dias.
    const orfas = env.db.all<Photo>("SELECT * FROM quote_photos WHERE quote_id IS NULL AND created_at < ?", new Date(now.getTime() - 2 * 86_400_000).toISOString());
    let total = store.apagarFotos(env.config.mediaDir, orfas);
    // Orçamentos encerrados mais antigos que a retenção: apaga fotos (arquivo) e registros.
    const corte = new Date(now.getTime() - retentionDays * 86_400_000).toISOString();
    const velhos = env.db.all<{ id: number }>("SELECT id FROM quotes WHERE status IN ('aceito','recusado','expirado','cancelado') AND updated_at < ?", corte);
    for (const q of velhos) {
      total += store.apagarFotos(env.config.mediaDir, store.fotos(q.id));
      env.db.run("DELETE FROM quotes WHERE id = ?", q.id);
      total++;
    }
    return total;
  },
};
