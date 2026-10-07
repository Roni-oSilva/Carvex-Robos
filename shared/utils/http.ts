import type { IncomingMessage, ServerResponse } from "node:http";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Lê o corpo cru com limite de tamanho (a assinatura do webhook exige o corpo exato). */
export function readBody(req: IncomingMessage, maxBytes = 1_000_000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > maxBytes) {
        reject(new HttpError(413, "Corpo da requisição grande demais."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function parseForm(body: Buffer): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(body.toString("utf8"))) out[k] = v;
  return out;
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
};

export interface Reply {
  status: number;
  body?: string;
  type?: string;
  headers?: Record<string, string | string[]>;
}

export const html = (body: string, status = 200, headers: Reply["headers"] = {}): Reply => ({ status, body, type: "text/html; charset=utf-8", headers });
export const json = (data: unknown, status = 200): Reply => ({ status, body: JSON.stringify(data), type: "application/json; charset=utf-8" });
export const text = (body: string, status = 200): Reply => ({ status, body, type: "text/plain; charset=utf-8" });
export const redirect = (to: string, headers: Reply["headers"] = {}): Reply => ({ status: 303, headers: { Location: to, ...headers } });

export function send(res: ServerResponse, r: Reply): void {
  res.writeHead(r.status, { ...SECURITY_HEADERS, ...(r.type ? { "Content-Type": r.type } : {}), ...(r.headers ?? {}) });
  res.end(r.body ?? "");
}

export function clientIp(req: IncomingMessage, trustProxy: boolean): string {
  if (trustProxy) {
    const xf = req.headers["x-forwarded-for"];
    const first = (Array.isArray(xf) ? xf[0] : xf)?.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.socket.remoteAddress ?? "desconhecido";
}
