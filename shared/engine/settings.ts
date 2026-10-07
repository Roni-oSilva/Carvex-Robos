import type { Tenant } from "../database/repo.ts";
import type { Robot, BotEnv } from "./types.ts";

/** Lê as configurações da empresa do banco, validando com o esquema do robô. */
export function loadSettings<S>(env: BotEnv, robot: Robot<S>, tenant: Tenant): S {
  let raw: unknown;
  try { raw = JSON.parse(tenant.settings); } catch { raw = null; }
  const v = robot.validateSettings(raw);
  if (v.ok) return v.value;
  env.log.error("configuracao_invalida_usando_padrao", { tenant: tenant.slug, erro: v.error });
  return robot.defaultSettings();
}

/** Pega uma mensagem customizável em settings.mensagens[chave], senão usa o padrão. */
export function customMsg(settings: unknown, key: string, fallback: string): string {
  const m = (settings as { mensagens?: Record<string, unknown> } | null)?.mensagens?.[key];
  return typeof m === "string" && m.trim() ? m : fallback;
}
