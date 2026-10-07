import { maskPhone } from "./text.ts";

const SECRET_KEY = /(token|secret|authorization|api[_-]?key|password|senha|cookie)/i;
const PHONE_KEY = /^(phone|telefone|wa_id|from|to|celular)$/i;

/** Remove segredos e mascara telefones antes de gravar log. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[profundo]";
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY.test(k)) out[k] = "[oculto]";
      else if (PHONE_KEY.test(k) && typeof v === "string") out[k] = maskPhone(v);
      else out[k] = redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

export interface Logger {
  info(msg: string, extra?: Record<string, unknown>): void;
  warn(msg: string, extra?: Record<string, unknown>): void;
  error(msg: string, extra?: Record<string, unknown>): void;
}

export function createLogger(sink: (line: string) => void = (l) => process.stdout.write(l + "\n")): Logger {
  const w = (level: string) => (msg: string, extra?: Record<string, unknown>) =>
    sink(JSON.stringify({ t: new Date().toISOString(), level, msg, ...(extra ? (redact(extra) as object) : {}) }));
  return { info: w("info"), warn: w("warn"), error: w("error") };
}

export const silentLogger: Logger = { info() {}, warn() {}, error() {} };
