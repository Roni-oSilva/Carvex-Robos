import type { Robot } from "../../../shared/engine/types.ts";
import { adminRoutes, home } from "./admin.ts";
import { handleAgenda } from "./flow.ts";
import { migrations } from "./migrations.ts";
import { sendDueReminders } from "./reminders.ts";
import { defaultSettings, knowledge, validateSettings, type AgendaSettings } from "./settings.ts";

export const agendaRobot: Robot<AgendaSettings> = {
  id: "robot-001-agendazap",
  nome: "AgendaZap",
  version: "1.0.0",
  migrations,
  defaultSettings,
  validateSettings,
  knowledge,
  handle: handleAgenda,
  async tick(env, now) {
    await sendDueReminders(env, agendaRobot, now);
  },
  admin: {
    nav: [{ href: "/admin/agenda", label: "Agenda" }, { href: "/admin/espera", label: "Lista de espera" }],
    home,
    routes: adminRoutes,
  },
  beforeDeleteContact(env, tenantId, contactId) {
    const n = env.db.get<{ n: number }>("SELECT COUNT(*) n FROM appointments WHERE tenant_id = ? AND contact_id = ? AND status IN ('agendado','confirmado') AND starts_at > ?", tenantId, contactId, env.clock().toISOString())!.n;
    return n > 0 ? "o cliente tem agendamentos futuros. Cancele-os antes de excluir." : null;
  },
};
