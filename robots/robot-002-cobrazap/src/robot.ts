import type { Robot } from "../../../shared/engine/types.ts";
import { adminRoutes, home } from "./admin.ts";
import { handleCobranca } from "./flow.ts";
import { migrations } from "./migrations.ts";
import { rodarRegua } from "./regua.ts";
import { defaultSettings, knowledge, validateSettings, type CobraSettings } from "./settings.ts";

export const cobraRobot: Robot<CobraSettings> = {
  id: "robot-002-cobrazap",
  nome: "CobraZap",
  version: "1.0.0",
  migrations,
  defaultSettings,
  validateSettings,
  knowledge,
  handle: handleCobranca,
  async tick(env, now) {
    await rodarRegua(env, cobraRobot, now);
  },
  admin: {
    nav: [{ href: "/admin/cobrancas", label: "Cobranças" }, { href: "/admin/conferencia", label: "Conferência" }, { href: "/admin/acordos", label: "Acordos" }],
    home,
    routes: adminRoutes,
  },
  beforeDeleteContact(env, tenantId, contactId) {
    const n = env.db.get<{ n: number }>("SELECT COUNT(*) n FROM charges WHERE tenant_id = ? AND contact_id = ? AND status IN ('aberta','em_conferencia')", tenantId, contactId)!.n;
    return n > 0 ? "há cobranças em aberto. Dê baixa ou cancele antes de excluir." : null;
  },
};
