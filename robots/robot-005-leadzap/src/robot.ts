import type { Robot } from "../../../shared/engine/types.ts";
import { adminRoutes, home } from "./admin.ts";
import { rodarAcompanhamento } from "./followup.ts";
import { handleLead } from "./flow.ts";
import { migrations } from "./migrations.ts";
import { defaultSettings, knowledge, validateSettings, type LeadSettings } from "./settings.ts";

export const leadRobot: Robot<LeadSettings> = {
  id: "robot-005-leadzap",
  nome: "LeadZap",
  version: "1.0.0",
  migrations,
  defaultSettings,
  validateSettings,
  knowledge,
  handle: handleLead,
  async tick(env, now) {
    await rodarAcompanhamento(env, leadRobot, now);
  },
  admin: {
    nav: [{ href: "/admin/leads", label: "Leads" }, { href: "/admin/visitas", label: "Visitas" }, { href: "/admin/imoveis", label: "Imóveis" }],
    home,
    routes: adminRoutes,
  },
  beforeDeleteContact(env, tenantId, contactId) {
    const n = env.db.get<{ n: number }>("SELECT COUNT(*) n FROM visits WHERE tenant_id = ? AND contact_id = ? AND status IN ('agendada','confirmada')", tenantId, contactId)!.n;
    return n > 0 ? "há visita marcada. Cancele a visita antes de excluir." : null;
  },
};
