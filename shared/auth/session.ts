import { createHmac, timingSafeEqual } from "node:crypto";

export interface Session { tenantId: number; exp: number }

const b64 = (s: string) => Buffer.from(s).toString("base64url");

/** Cookie de sessão assinado (HMAC-SHA256). Não guarda segredo, só o id da empresa e a validade. */
export function createSessionCookie(session: Session, secret: string): string {
  const payload = b64(JSON.stringify(session));
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSessionCookie(value: string | undefined, secret: string, nowMs: number): Session | null {
  if (!value) return null;
  const i = value.indexOf(".");
  if (i < 1) return null;
  const payload = value.slice(0, i), sig = value.slice(i + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    return typeof s.tenantId === "number" && typeof s.exp === "number" && s.exp > nowMs ? s : null;
  } catch {
    return null;
  }
}
