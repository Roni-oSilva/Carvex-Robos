import { escapeHtml } from "../utils/text.ts";

/** HTML já seguro. Só é criado por `h` (que escapa interpolações) ou `raw` (uso consciente). */
export class SafeHtml {
  s: string;
  constructor(s: string) { this.s = s; }
  toString(): string { return this.s; }
}

export const raw = (s: string): SafeHtml => new SafeHtml(s);

function part(v: unknown): string {
  if (v instanceof SafeHtml) return v.s;
  if (Array.isArray(v)) return v.map(part).join("");
  if (v === null || v === undefined || v === false) return "";
  return escapeHtml(v);
}

/** Template que ESCAPA toda interpolação por padrão (proteção contra XSS). */
export function h(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  let out = "";
  strings.forEach((s, i) => { out += s + (i < values.length ? part(values[i]) : ""); });
  return new SafeHtml(out);
}

const CSS = `
:root{--bg:#f6f7f9;--card:#fff;--ink:#1c2430;--mut:#667085;--brand:#128c5a;--line:#e4e7ec;--bad:#c0392b;--warn:#b7791f}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{background:var(--brand);color:#fff;padding:12px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
header a{color:#fff;text-decoration:none;opacity:.9}header a:hover{opacity:1;text-decoration:underline}header .t{font-weight:700;margin-right:12px}
main{max-width:1100px;margin:20px auto;padding:0 16px}
h1{font-size:22px;margin:0 0 14px}h2{font-size:17px;margin:22px 0 8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin-bottom:14px;overflow-x:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:26px}.kpi span{color:var(--mut);font-size:13px}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top;font-size:14px}th{color:var(--mut);font-weight:600}
input,select,textarea,button{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff}textarea{width:100%;min-height:320px;font-family:ui-monospace,Menlo,monospace;font-size:13px}
button,.btn{background:var(--brand);color:#fff;border:0;cursor:pointer;text-decoration:none;display:inline-block;padding:8px 14px;border-radius:8px}
button.sec{background:#fff;color:var(--ink);border:1px solid var(--line)}button.bad{background:var(--bad)}
.tag{display:inline-block;padding:2px 8px;border-radius:99px;font-size:12px;background:#eef2f6}.tag.ok{background:#d9f2e5;color:#0b6b43}.tag.warn{background:#fdf0d5;color:var(--warn)}.tag.bad{background:#fbdcd8;color:var(--bad)}
.msg{padding:6px 10px;border-radius:10px;margin:4px 0;max-width:80%;white-space:pre-wrap}.in{background:#eef2f6}.out{background:#d9f2e5;margin-left:auto}
.muted{color:var(--mut)}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.err{color:var(--bad)}.okmsg{color:#0b6b43}
`;

export interface LayoutOpts { title: string; tenantName: string; robotName: string; nav: { href: string; label: string }[]; body: SafeHtml; refresh?: number }

export function layout(o: LayoutOpts): string {
  return h`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${o.title} · ${o.tenantName}</title>${o.refresh ? raw(`<meta http-equiv="refresh" content="${Number(o.refresh)}">`) : ""}
<style>${raw(CSS)}</style></head><body>
<header><span class="t">${o.robotName} — ${o.tenantName}</span>
${o.nav.map((n) => h`<a href="${n.href}">${n.label}</a>`)}
<span style="flex:1"></span><a href="/admin/logout">Sair</a></header>
<main>${o.body}</main></body></html>`.s;
}

export function loginPage(robotName: string, error?: string): string {
  return h`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Entrar · ${robotName}</title><style>${raw(CSS)}</style></head><body>
<main style="max-width:380px;margin-top:12vh"><div class="card"><h1>${robotName}</h1>
<p class="muted">Painel de administração. Informe a chave de acesso da sua empresa.</p>
${error ? h`<p class="err" role="alert">${error}</p>` : ""}
<form method="post" action="/admin/login"><p><input type="password" name="token" placeholder="Chave de acesso" autocomplete="current-password" required style="width:100%"></p>
<button type="submit">Entrar</button></form></div></main></body></html>`.s;
}

export function table(headers: string[], rows: SafeHtml[][], empty = "Nada por aqui ainda."): SafeHtml {
  if (rows.length === 0) return h`<p class="muted">${empty}</p>`;
  return h`<table><thead><tr>${headers.map((x) => h`<th>${x}</th>`)}</tr></thead><tbody>${rows.map((r) => h`<tr>${r.map((c) => h`<td>${c}</td>`)}</tr>`)}</tbody></table>`;
}

export const tag = (label: string, kind: "ok" | "warn" | "bad" | "" = ""): SafeHtml => h`<span class="tag ${kind}">${label}</span>`;
export const kpi = (value: string | number, label: string): SafeHtml => h`<div class="kpi"><b>${value}</b><span>${label}</span></div>`;
