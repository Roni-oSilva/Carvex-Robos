import { randomBytes } from "node:crypto";
import type { Tenant } from "../database/repo.ts";
import type { BotEnv, Robot } from "./types.ts";

export interface NovaEmpresa {
  slug: string;
  /** Configuração da empresa (o mesmo JSON de config/empresa.json). */
  config: unknown;
  phoneNumberId?: string | null;
  timezone?: string;
  /** Se omitido, uma chave aleatória forte é gerada e devolvida UMA vez. */
  adminToken?: string;
}

/**
 * Cadastra uma nova empresa (tenant) neste robô. Valida a configuração com o esquema do robô,
 * impede slug/phone_number_id repetidos e devolve a chave do painel (que só existe em texto puro aqui).
 */
export function criarEmpresa<S>(env: BotEnv, robot: Robot<S>, e: NovaEmpresa): { tenant: Tenant; adminToken: string } {
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(e.slug)) throw new Error("slug inválido: use letras minúsculas, números e hífen (2 a 41 caracteres).");
  if (env.repo.tenantBySlug(e.slug)) throw new Error(`Já existe uma empresa com o slug "${e.slug}".`);
  if (e.phoneNumberId && env.repo.tenantByPhoneNumberId(e.phoneNumberId)) throw new Error(`O phone_number_id ${e.phoneNumberId} já está em uso por outra empresa.`);
  const v = robot.validateSettings(e.config);
  if (!v.ok) throw new Error(`Configuração inválida: ${v.error}`);
  if (e.adminToken !== undefined && e.adminToken.length < 16) throw new Error("A chave do painel deve ter pelo menos 16 caracteres.");
  const adminToken = e.adminToken ?? randomBytes(24).toString("base64url");
  const tenant = env.repo.createTenant({
    slug: e.slug, nome: robot.knowledge(v.value).empresa.nome, phone_number_id: e.phoneNumberId ?? null,
    admin_token: adminToken, timezone: e.timezone ?? "America/Sao_Paulo", settings: v.value as object,
  }, env.clock());
  return { tenant, adminToken };
}
