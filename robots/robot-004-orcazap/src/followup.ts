import type { BotEnv, Robot } from "../../../shared/engine/types.ts";
import { loadSettings } from "../../../shared/engine/settings.ts";
import { avisoExpirou, lembreteProposta } from "./notify.ts";
import type { OrcaSettings } from "./settings.ts";
import { OrcaStore, type Quote } from "./store.ts";

/** Em atendimento humano o robô não escreve sozinho (mesma regra do motor de conversa). */
function comHumano(env: BotEnv, contactId: number, now: Date): boolean {
  const conv = env.db.get<{ mode: string; updated_at: string }>("SELECT mode, updated_at FROM conversations WHERE contact_id = ?", contactId);
  return conv?.mode === "human" && now.getTime() - new Date(conv.updated_at).getTime() < env.config.handoffResumeHours * 3_600_000;
}

/**
 * Acompanhamento das propostas enviadas:
 *  - 1 único lembrete quando passa `followup_horas` sem resposta;
 *  - ao vencer a validade, marca como expirado e avisa 1 vez.
 * Devolve quantas mensagens foram enviadas.
 */
export async function rodarAcompanhamento(env: BotEnv, robot: Robot<OrcaSettings>, now: Date): Promise<number> {
  const store = new OrcaStore(env.db);
  let enviados = 0;
  for (const tenant of env.repo.tenants()) {
    const s = loadSettings(env, robot, tenant);
    const nowIso = now.toISOString();
    const vencidos = env.db.all<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND status = 'enviado' AND validade_ate <= ? LIMIT 500", tenant.id, nowIso);
    for (const q of vencidos) {
      store.setStatus(tenant.id, q.id, "expirado", now);
      env.repo.event(tenant.id, "orcamento_expirado", { id: q.id }, now);
      if (!comHumano(env, q.contact_id, now) && (await avisoExpirou(env, tenant, s, q, now)) !== "ignorado") enviados++;
    }
    const lembrar = env.db.all<Quote>("SELECT * FROM quotes WHERE tenant_id = ? AND status = 'enviado' AND followup_enviado = 0 AND followup_em <= ? AND validade_ate > ? LIMIT 500", tenant.id, nowIso, nowIso);
    for (const q of lembrar) {
      if (comHumano(env, q.contact_id, now)) continue;
      // Marca antes de enviar: se a rodada cair no meio, o cliente não recebe o lembrete duas vezes.
      env.db.run("UPDATE quotes SET followup_enviado = 1, updated_at = ? WHERE id = ?", nowIso, q.id);
      const r = await lembreteProposta(env, tenant, s, q, now);
      if (r === "sent" || r === "sent_template") { enviados++; env.repo.event(tenant.id, "orcamento_lembrete", { id: q.id }, now); }
    }
  }
  return enviados;
}
