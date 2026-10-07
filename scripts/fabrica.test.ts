// Verificações da fábrica: documentação sincronizada, checklist "PRONTO" e ausência de segredos.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gerarCatalogo } from "./gerar-catalogo.ts";
import { gerarTudo, raiz, robos } from "./gerar-docs.ts";
import { registry } from "../robots/registry.ts";

const lê = (rel: string) => readFileSync(join(raiz, rel), "utf8");

test("documentação em disco = documentação gerada (rode `node scripts/gerar-docs.ts` se falhar)", () => {
  for (const [rel, esperado] of gerarTudo()) assert.equal(lê(rel), esperado, rel);
});

test("ROBOTS.md e CATALOG.md estão atualizados (rode `node scripts/gerar-catalogo.ts`)", () => {
  const { robotsMd, catalogMd } = gerarCatalogo();
  assert.equal(lê("ROBOTS.md"), robotsMd);
  assert.equal(lê("CATALOG.md"), catalogMd);
});

test("todo robô documentado está registrado e vice-versa", () => {
  assert.deepEqual(Object.keys(registry).sort(), robos.map((r) => r.id).sort());
});

const OBRIGATORIOS = [
  "README.md", "MANUAL.md", "INSTALACAO.md", "CONFIGURACAO.md", "CHANGELOG.md", ".env.example",
  "docs/TECHNICAL.md", "docs/CLIENT-MANUAL.md", "docs/FLUXOS.md", "docs/LGPD.md", "docs/SEGURANCA.md", "docs/REQUISITOS.md",
  "sales/SALES-PAGE.md", "sales/PITCH.md", "sales/FEATURES.md", "sales/OBJECTIONS.md", "sales/FAQ.md", "sales/DEMO-SCRIPT.md", "sales/PRECIFICACAO.md",
  "demo/CONVERSAS.md", "demo/simulate.ts", "demo/servidor-demo.ts", "config/empresa.exemplo.json", "src/index.ts",
];

for (const r of robos.filter((x) => x.status === "PRONTO" || x.status === "COMERCIAL")) {
  test(`checklist PRONTO — ${r.nome}`, () => {
    for (const f of OBRIGATORIOS) assert.ok(existsSync(join(raiz, "robots", r.id, f)), `${r.id}/${f} ausente`);
    const testes = readdirSync(join(raiz, "robots", r.id, "tests")).filter((f) => f.endsWith(".test.ts"));
    assert.ok(testes.length >= 1, "sem testes");
    // configuração de exemplo precisa ser aceita pelo próprio validador do robô
    const cfg = JSON.parse(lê(`robots/${r.id}/config/empresa.exemplo.json`)) as unknown;
    const v = registry[r.id].validateSettings(cfg as never);
    assert.ok(v.ok, v.ok ? "" : v.error);
    // preço sugerido, público, diferenciais e pendências declaradas
    assert.ok(r.precos.mensalidade > 0 && r.precos.implantacao > 0 && r.precos.venda_unica > 0);
    assert.ok(r.publico && r.diferenciais.length >= 3 && r.fluxos.length > 500);
    // .env.example não contém valores secretos preenchidos
    const env = lê(`robots/${r.id}/.env.example`);
    for (const chave of ["ADMIN_TOKEN", "SESSION_SECRET", "WHATSAPP_TOKEN", "WHATSAPP_APP_SECRET", "AI_API_KEY"]) assert.match(env, new RegExp(`^${chave}=$`, "m"), chave);
  });
}

test("nenhum segredo no repositório e nenhum .env versionado", () => {
  const padroes = [/sk-ant-[A-Za-z0-9_-]{20,}/, /EAA[A-Za-z0-9]{40,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, /ghp_[A-Za-z0-9]{30,}/];
  const achados: string[] = [];
  const percorre = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      if (["node_modules", ".git", "dist", "data"].includes(nome)) continue;
      const p = join(dir, nome);
      const st = statSync(p);
      if (st.isDirectory()) { percorre(p); continue; }
      const rel = relative(raiz, p);
      if (/^\.env(\..+)?$/.test(nome) && nome !== ".env.example") achados.push(`${rel} (arquivo .env)`);
      if (st.size > 2_000_000 || !/\.(ts|md|json|yml|yaml|sql|txt|example)$/.test(nome)) continue;
      const txt = readFileSync(p, "utf8");
      for (const re of padroes) if (re.test(txt)) achados.push(`${rel} casa ${re}`);
    }
  };
  percorre(raiz);
  assert.deepEqual(achados, []);
});

// ---- Empacotamento: o que você entrega ao cliente realmente sobe sozinho
import { spawn, execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

async function esperaSaude(url: string, ms = 8000): Promise<Response> {
  const fim = Date.now() + ms;
  let erro: unknown;
  while (Date.now() < fim) {
    try { return await fetch(url); } catch (e) { erro = e; await new Promise((r) => setTimeout(r, 150)); }
  }
  throw new Error(`não subiu: ${String(erro)}`);
}

robos.forEach((r, i) => {
  test(`pacote de ${r.nome}: empacota, sobe com DRY_RUN, responde /health e recusa webhook sem assinatura`, async () => {
    execFileSync("node", ["--no-warnings", "scripts/empacotar-robo.ts", r.id], { cwd: raiz, stdio: "ignore" });
    const dist = join(raiz, "dist", r.id);
    const tmp = mkdtempSync(join(tmpdir(), "pacote-"));
    copyFileSync(join(dist, "robots", r.id, "config", "empresa.exemplo.json"), join(dist, "robots", r.id, "config", "empresa.json"));
    const porta = 38100 + i;
    const proc = spawn("node", ["--no-warnings", `robots/${r.id}/src/index.ts`], {
      cwd: dist, stdio: "ignore",
      env: { PATH: process.env.PATH ?? "", DRY_RUN: "true", ADMIN_TOKEN: "chave-de-teste-do-pacote-123", PORT: String(porta), DATABASE_PATH: join(tmp, "t.db") },
    });
    try {
      const h = await esperaSaude(`http://127.0.0.1:${porta}/health`);
      assert.equal(h.status, 200);
      assert.equal(((await h.json()) as { robot: string }).robot, r.id);
      assert.equal((await fetch(`http://127.0.0.1:${porta}/admin/login`)).status, 200);
      assert.equal((await fetch(`http://127.0.0.1:${porta}/webhook`, { method: "POST", body: "{}" })).status, 401);
      assert.equal((await fetch(`http://127.0.0.1:${porta}/admin`, { redirect: "manual" })).status, 303);
    } finally {
      proc.kill("SIGKILL");
      rmSync(tmp, { recursive: true, force: true });
      rmSync(join(raiz, "dist"), { recursive: true, force: true });
    }
  });
});
