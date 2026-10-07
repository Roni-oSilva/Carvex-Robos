import { sendProactive } from "../../../shared/engine/proactive.ts";
import { loadSettings } from "../../../shared/engine/settings.ts";
import type { BotEnv, Robot } from "../../../shared/engine/types.ts";
import { localDateTimeLabel } from "../../../shared/utils/time.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { AgendaStore, type Appointment } from "./store.ts";
import type { AgendaSettings } from "./settings.ts";

/**
 * Envia os lembretes vencidos. Chamado a cada minuto pelo agendador.
 * Regras: respeita opt-out; dentro de 24h da última mensagem do cliente vai texto com botões;
 * fora da janela só vai se houver template aprovado configurado (senão tenta de novo em 30 min).
 */
export async function sendDueReminders(env: BotEnv, robot: Robot<AgendaSettings>, now: Date): Promise<number> {
  const store = new AgendaStore(env.db);
  const cache = new Map<number, { tenant: Tenant; settings: AgendaSettings }>();
  let sent = 0;

  for (const r of store.dueReminders(now.toISOString())) {
    let t = cache.get(r.tenant_id);
    if (!t) {
      const tenant = env.repo.tenantById(r.tenant_id);
      if (!tenant) continue;
      t = { tenant, settings: loadSettings(env, robot, tenant) };
      cache.set(r.tenant_id, t);
    }
    const { tenant, settings } = t;
    const contact = env.repo.contact(tenant.id, r.contact_id);
    if (!contact) { store.markReminder(r.reminder_id, "sem_contato", now.toISOString(), null); continue; }

    const a: Appointment = r;
    const quando = localDateTimeLabel(new Date(a.starts_at), tenant.timezone);
    const nome = contact.nome?.split(" ")[0] ?? "";
    const confirmado = a.status === "confirmado";
    const text = confirmado
      ? `Oi${nome ? `, ${nome}` : ""}! ⏰ Lembrete: seu horário de *${a.service_name}* é ${quando}. Te esperamos${settings.empresa.endereco ? ` em ${settings.empresa.endereco}` : ""}!`
      : `Oi${nome ? `, ${nome}` : ""}! 👋 Lembrete: *${a.service_name}* com ${a.professional_name} em ${quando}.\nVocê confirma presença?`;

    const res = await sendProactive(env, tenant, contact, {
      text,
      buttons: confirmado ? undefined : [{ id: "rc", title: "Confirmo ✅" }, { id: "rr", title: "Remarcar" }, { id: "rx", title: "Cancelar" }],
      template: settings.lembretes.template_nome
        ? { name: settings.lembretes.template_nome, language: settings.lembretes.template_idioma, params: [nome || "cliente", a.service_name, quando, settings.empresa.nome] }
        : undefined,
    }, now);

    if (res === "sent" || res === "sent_template") {
      store.markReminder(r.reminder_id, res, now.toISOString(), null);
      env.repo.event(tenant.id, "lembrete_enviado", { id: a.id, horas: r.hours_before }, now);
      if (!confirmado) {
        const conv = env.repo.conversationFor(tenant.id, contact.id, now);
        const d = JSON.parse(conv.data) as Record<string, unknown>;
        d.pending_confirm = a.id;
        env.repo.saveConversation({ id: conv.id, state: conv.state, data: JSON.stringify(d), mode: conv.mode, handoff_reason: conv.handoff_reason }, now);
      }
      sent++;
    } else if (res === "skipped_optout") {
      store.markReminder(r.reminder_id, "optout", now.toISOString(), null);
    } else {
      const retry = new Date(now.getTime() + (res === "failed" ? 10 : 30) * 60_000).toISOString();
      store.markReminder(r.reminder_id, res === "failed" ? "falhou" : "sem_template", null, retry);
    }
  }
  return sent;
}
