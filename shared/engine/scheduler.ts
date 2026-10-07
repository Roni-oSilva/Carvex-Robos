import type { BotEnv, Robot } from "./types.ts";

/**
 * Executor das tarefas periódicas do robô (lembretes, réguas…).
 * Garante que NUNCA há duas rodadas ao mesmo tempo: se a anterior ainda não terminou, a nova é pulada
 * (evita envio duplicado quando o WhatsApp está lento). Também apaga mensagens antigas 1x por dia (LGPD).
 */
export function createTickRunner<S>(env: BotEnv, robot: Robot<S>): () => Promise<"ok" | "ocupado" | "erro"> {
  let rodando = false;
  let ultimaLimpeza = 0;
  return async () => {
    if (rodando) { env.log.warn("tick_pulado_rodada_anterior_em_andamento", {}); return "ocupado"; }
    rodando = true;
    try {
      const now = env.clock();
      try { await robot.tick?.(env, now); } catch (e) { env.log.error("tick_falhou", { erro: e instanceof Error ? e.message : String(e) }); return "erro"; }
      if (now.getTime() - ultimaLimpeza > 86_400_000) {
        ultimaLimpeza = now.getTime();
        const n = env.repo.purgeMessagesOlderThan(env.config.retentionDays, now);
        if (n > 0) env.log.info("mensagens_antigas_removidas", { total: n });
      }
      return "ok";
    } finally {
      rodando = false;
    }
  };
}
