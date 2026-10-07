import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { h, layout, loginPage, table, tag, type SafeHtml } from "../dashboard/html.ts";
import { createSessionCookie, readSessionCookie } from "../auth/session.ts";
import { summarizeConversation } from "../ai/knowledge.ts";
import type { Tenant } from "../database/repo.ts";
import { HttpError, clientIp, html, json, parseCookies, parseForm, readBody, redirect, send, text, type Reply } from "../utils/http.ts";
import { RateLimiter } from "../utils/rate-limit.ts";
import { localDateTimeLabel } from "../utils/time.ts";
import { parseWebhook, verifyChallenge, verifySignature } from "../whatsapp/webhook.ts";
import { inServiceWindow } from "../whatsapp/window.ts";
import { deliver, processInbound } from "./engine.ts";
import { loadSettings } from "./settings.ts";
import type { AdminContext, AdminRequest, AdminRoute, BotEnv, Robot } from "./types.ts";

interface CompiledRoute<S> { method: string; re: RegExp; keys: string[]; route: AdminRoute<S> }

function compile<S>(route: AdminRoute<S>): CompiledRoute<S> {
  const keys: string[] = [];
  const src = route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:([a-zA-Z]+)/g, (_m, k: string) => { keys.push(k); return "([^/]+)"; });
  return { method: route.method, re: new RegExp(`^${src}/?$`), keys, route };
}

export interface App {
  server: Server;
  /** Aguarda o processamento em segundo plano (útil em testes). */
  idle(): Promise<void>;
}

export function createApp<S>(env: BotEnv, robot: Robot<S>): App {
  let chain: Promise<void> = Promise.resolve();
  const enqueue = (fn: () => Promise<void>) => {
    chain = chain.then(fn).catch((e) => env.log.error("fila_falhou", { erro: e instanceof Error ? e.message : String(e) }));
  };
  const webhookLimiter = new RateLimiter(600, 60_000);
  const loginLimiter = new RateLimiter(8, 60_000);

  const sharedRoutes: AdminRoute<S>[] = [];
  const routes: CompiledRoute<S>[] = [];

  // ------------------------------------------------------------------ rotas compartilhadas do painel
  sharedRoutes.push({
    method: "GET", path: "/conversas",
    handler(ctx) {
      const rows = env.repo.conversations(ctx.tenant.id).map((c) => [
        h`<a href="/admin/conversas/${c.contact_id}">${c.nome ?? "(sem nome)"}</a>`,
        h`${c.wa_id.slice(0, 4)}…${c.wa_id.slice(-4)}`,
        c.mode === "human" ? tag("aguardando atendente", "warn") : tag("robô", "ok"),
        h`${c.handoff_reason ?? ""}`,
        h`${localDateTimeLabel(new Date(c.updated_at), ctx.tenant.timezone)}`,
      ]);
      return ctx.page("Conversas", h`<h1>Conversas</h1><div class="card">${table(["Cliente", "Número", "Quem atende", "Motivo", "Última atividade"], rows, "Nenhuma conversa ainda.")}</div><p class="muted">Esta página atualiza sozinha a cada 30 segundos.</p>`);
    },
  });

  sharedRoutes.push({
    method: "GET", path: "/conversas/:id",
    async handler(ctx, req) {
      const contact = env.repo.contact(ctx.tenant.id, Number(req.params.id));
      if (!contact) return html("Não encontrado", 404);
      const conv = env.repo.conversationFor(ctx.tenant.id, contact.id, ctx.now);
      const msgs = env.repo.messages(ctx.tenant.id, contact.id, 60);
      const resumo = conv.mode === "human" ? await summarizeConversation(msgs, env.ai) : "";
      const open = inServiceWindow(contact.last_inbound_at, ctx.now);
      const erro = req.query.get("erro");
      return ctx.page(`Conversa — ${contact.nome ?? contact.wa_id}`, h`
<h1>${contact.nome ?? "Cliente"} <span class="muted" style="font-size:14px">${contact.wa_id.slice(0, 4)}…${contact.wa_id.slice(-4)}</span></h1>
${erro ? h`<p class="err" role="alert">${erro}</p>` : ""}
<div class="card row">${conv.mode === "human" ? tag("aguardando atendente", "warn") : tag("robô atendendo", "ok")}
${contact.opt_out ? tag("não quer lembretes", "bad") : ""}
<form method="post" action="/admin/conversas/${contact.id}/modo"><input type="hidden" name="modo" value="${conv.mode === "human" ? "bot" : "human"}">
<button class="sec" type="submit">${conv.mode === "human" ? "Devolver ao robô" : "Assumir atendimento"}</button></form></div>
${resumo ? h`<div class="card"><b>Resumo:</b> ${resumo}</div>` : ""}
<div class="card">${msgs.map((m) => h`<div class="msg ${m.direction}">${m.body}<div class="muted" style="font-size:11px">${localDateTimeLabel(new Date(m.created_at), ctx.tenant.timezone)}${m.status === "failed" ? " · FALHOU" : ""}</div></div>`)}</div>
<div class="card">${open
  ? h`<form method="post" action="/admin/conversas/${contact.id}/responder"><p><textarea name="texto" maxlength="1000" required style="min-height:90px" placeholder="Escreva a resposta ao cliente"></textarea></p><button type="submit">Enviar</button></form>`
  : h`<p class="muted">A janela de 24h do WhatsApp está fechada: só é possível enviar mensagens de modelo (template) aprovado. Aguarde o cliente escrever.</p>`}</div>`);
    },
  });

  sharedRoutes.push({
    method: "POST", path: "/conversas/:id/modo",
    handler(ctx, req) {
      const contact = env.repo.contact(ctx.tenant.id, Number(req.params.id));
      if (!contact) return html("Não encontrado", 404);
      const conv = env.repo.conversationFor(ctx.tenant.id, contact.id, ctx.now);
      const modo = req.form.modo === "bot" ? "bot" : "human";
      env.repo.saveConversation({ id: conv.id, state: modo === "bot" ? "inicio" : conv.state, data: conv.data, mode: modo, handoff_reason: modo === "bot" ? null : "assumido no painel" }, ctx.now);
      return redirect(`/admin/conversas/${contact.id}`);
    },
  });

  sharedRoutes.push({
    method: "POST", path: "/conversas/:id/responder",
    async handler(ctx, req) {
      const contact = env.repo.contact(ctx.tenant.id, Number(req.params.id));
      if (!contact) return html("Não encontrado", 404);
      const body = (req.form.texto ?? "").trim().slice(0, 1000);
      if (!body) return redirect(`/admin/conversas/${contact.id}?erro=${encodeURIComponent("Mensagem vazia.")}`);
      if (!inServiceWindow(contact.last_inbound_at, ctx.now)) return redirect(`/admin/conversas/${contact.id}?erro=${encodeURIComponent("Janela de 24h fechada.")}`);
      await deliver(env, ctx.tenant, contact.id, contact.wa_id, [{ kind: "text", body }], ctx.now);
      return redirect(`/admin/conversas/${contact.id}`);
    },
  });

  sharedRoutes.push({
    method: "GET", path: "/clientes",
    handler(ctx, req) {
      const msg = req.query.get("msg");
      const rows = env.repo.contacts(ctx.tenant.id).map((c) => [
        h`${c.nome ?? "(sem nome)"}`,
        h`${c.wa_id}`,
        c.opt_out ? tag("sem lembretes", "bad") : tag("ok", "ok"),
        h`${localDateTimeLabel(new Date(c.created_at), ctx.tenant.timezone)}`,
        h`<form method="post" action="/admin/clientes/${c.id}/excluir" class="row"><label><input type="checkbox" name="confirmo" value="1" required> confirmo</label><button class="bad" type="submit">Excluir dados</button></form>`,
      ]);
      return ctx.page("Clientes", h`<h1>Clientes</h1>${msg ? h`<p class="okmsg">${msg}</p>` : ""}
<div class="card">${table(["Nome", "WhatsApp", "Lembretes", "Desde", "LGPD"], rows, "Nenhum cliente ainda.")}</div>
<p class="muted">“Excluir dados” apaga o cliente e tudo ligado a ele (conversas, mensagens e registros do robô), atendendo a pedido do titular (LGPD). Não pode ser desfeito.</p>`);
    },
  });

  sharedRoutes.push({
    method: "POST", path: "/clientes/:id/excluir",
    handler(ctx, req) {
      const id = Number(req.params.id);
      if (req.form.confirmo !== "1") return redirect("/admin/clientes");
      const motivo = robot.beforeDeleteContact?.(env, ctx.tenant.id, id);
      if (motivo) return redirect(`/admin/clientes?msg=${encodeURIComponent("Não foi possível excluir: " + motivo)}`);
      env.repo.deleteContact(ctx.tenant.id, id);
      env.repo.event(ctx.tenant.id, "lgpd_exclusao", {}, ctx.now);
      return redirect(`/admin/clientes?msg=${encodeURIComponent("Dados do cliente excluídos.")}`);
    },
  });

  sharedRoutes.push({
    method: "GET", path: "/config",
    handler(ctx, req) {
      const erro = req.query.get("erro"), ok = req.query.get("ok");
      const pretty = JSON.stringify(ctx.settings, null, 2);
      return ctx.page("Configurações", h`<h1>Configurações da empresa</h1>
${erro ? h`<p class="err" role="alert">${erro}</p>` : ""}${ok ? h`<p class="okmsg">Configurações salvas.</p>` : ""}
<div class="card"><p class="muted">Aqui ficam os dados da empresa, serviços, preços e mensagens. Edite com cuidado: o sistema valida antes de salvar. Veja o arquivo CONFIGURACAO.md para o significado de cada campo.</p>
<form method="post" action="/admin/config"><textarea name="json" spellcheck="false">${pretty}</textarea><p><button type="submit">Salvar configurações</button></p></form></div>`);
    },
  });

  sharedRoutes.push({
    method: "POST", path: "/config",
    handler(ctx, req) {
      let parsed: unknown;
      try { parsed = JSON.parse(req.form.json ?? ""); } catch { return redirect(`/admin/config?erro=${encodeURIComponent("JSON inválido: confira vírgulas e aspas.")}`); }
      const v = robot.validateSettings(parsed);
      if (!v.ok) return redirect(`/admin/config?erro=${encodeURIComponent(v.error)}`);
      env.repo.updateTenantSettings(ctx.tenant.id, v.value as object);
      return redirect("/admin/config?ok=1");
    },
  });

  for (const r of [...sharedRoutes, ...robot.admin.routes]) routes.push(compile(r));

  const nav = [{ href: "/admin", label: "Início" }, ...robot.admin.nav, { href: "/admin/conversas", label: "Conversas" }, { href: "/admin/clientes", label: "Clientes" }, { href: "/admin/config", label: "Configurações" }];

  // ------------------------------------------------------------------ helpers
  const sessionFor = (req: IncomingMessage): Tenant | undefined => {
    const s = readSessionCookie(parseCookies(req.headers.cookie).sid, env.config.sessionSecret, env.clock().getTime());
    return s ? env.repo.tenantById(s.tenantId) : undefined;
  };

  const sameOrigin = (req: IncomingMessage): boolean => {
    const origin = req.headers.origin;
    if (origin) { try { return new URL(origin).host === req.headers.host; } catch { return false; } }
    const site = req.headers["sec-fetch-site"];
    return !site || site === "same-origin" || site === "none";
  };

  const cookieFlags = `Path=/admin; HttpOnly; SameSite=Strict; Max-Age=28800${env.config.cookieSecure ? "; Secure" : ""}`;

  async function admin(req: IncomingMessage, url: URL): Promise<Reply> {
    const path = url.pathname.replace(/^\/admin/, "") || "/";
    const ip = clientIp(req, env.config.trustProxy);

    if (path === "/login") {
      if (req.method === "POST") {
        if (!sameOrigin(req)) return text("Origem inválida", 403);
        if (!loginLimiter.allow(ip, env.clock().getTime())) return html(loginPage(robot.nome, "Muitas tentativas. Aguarde um minuto."), 429);
        const form = parseForm(await readBody(req, 10_000));
        const tenant = form.token ? env.repo.tenantByAdminToken(form.token.trim()) : undefined;
        if (!tenant) return html(loginPage(robot.nome, "Chave inválida."), 401);
        const cookie = createSessionCookie({ tenantId: tenant.id, exp: env.clock().getTime() + 8 * 3_600_000 }, env.config.sessionSecret);
        return redirect("/admin", { "Set-Cookie": `sid=${encodeURIComponent(cookie)}; ${cookieFlags}` });
      }
      return html(loginPage(robot.nome));
    }
    if (path === "/logout") return redirect("/admin/login", { "Set-Cookie": `sid=; ${cookieFlags.replace(/Max-Age=\d+/, "Max-Age=0")}` });

    const tenant = sessionFor(req);
    if (!tenant) return redirect("/admin/login");
    if (req.method === "POST" && !sameOrigin(req)) return text("Origem inválida", 403);

    const now = env.clock();
    const settings = loadSettings(env, robot, tenant);
    const mk = (refresh?: number) => (title: string, body: SafeHtml): Reply =>
      html(layout({ title, tenantName: tenant.nome, robotName: robot.nome, nav, body, refresh }));
    const ctx: AdminContext<S> = { env, tenant, settings, now, page: mk(path.startsWith("/conversas") ? 30 : undefined) };

    if (path === "/") return ctx.page("Início", robot.admin.home(ctx));

    for (const c of routes) {
      if (c.method !== req.method) continue;
      const m = c.re.exec(path);
      if (!m) continue;
      const params: Record<string, string> = {};
      c.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      const form = req.method === "POST" ? parseForm(await readBody(req, 200_000)) : {};
      const areq: AdminRequest = { query: url.searchParams, form, params };
      return c.route.handler(ctx, areq);
    }
    return html("Página não encontrada", 404);
  }

  async function route(req: IncomingMessage): Promise<Reply> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const ip = clientIp(req, env.config.trustProxy);

    if (url.pathname === "/health") return json({ status: "ok", robot: robot.id, version: robot.version });
    if (url.pathname === "/") return text(`${robot.nome} em funcionamento.`);

    if (url.pathname === "/webhook") {
      if (req.method === "GET") {
        const c = verifyChallenge(url.searchParams, env.config.verifyToken);
        return c === null ? text("Forbidden", 403) : text(c);
      }
      if (req.method === "POST") {
        if (!webhookLimiter.allow(ip, env.clock().getTime())) return text("Too Many Requests", 429);
        const body = await readBody(req, 1_000_000);
        if (!env.config.insecureSkipSignature && !verifySignature(body, req.headers["x-hub-signature-256"] as string | undefined, env.config.appSecret)) {
          env.log.warn("webhook_assinatura_invalida", { ip });
          return text("Unauthorized", 401);
        }
        let payload: unknown;
        try { payload = JSON.parse(body.toString("utf8")); } catch { return text("Bad Request", 400); }
        const parsed = parseWebhook(payload);
        enqueue(async () => {
          for (const s of parsed.statuses) env.repo.setMessageStatus(s.id, s.status);
          for (const m of parsed.messages) await processInbound(env, robot, m);
        });
        return text("EVENT_RECEIVED");
      }
      return text("Method Not Allowed", 405);
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return admin(req, url);
    return text("Não encontrado", 404);
  }

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    route(req)
      .then((r) => send(res, r))
      .catch((e: unknown) => {
        if (e instanceof HttpError) return send(res, text(e.message, e.status));
        env.log.error("erro_http", { erro: e instanceof Error ? e.stack : String(e) });
        send(res, text("Erro interno", 500));
      });
  });

  return { server, idle: () => chain };
}

