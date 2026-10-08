// Gera dist/<robô>/ — a pasta autônoma que você entrega/instala (robô + camada compartilhada + Dockerfile).
// Uso: node scripts/empacotar-robo.ts robot-001-agendazap
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id || !existsSync(join(raiz, "robots", id))) {
  console.error("Uso: node scripts/empacotar-robo.ts <id-do-robô>   (ex.: robot-001-agendazap)");
  process.exit(1);
}

const out = join(raiz, "dist", id);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const ignorar = (src: string): boolean => !/(^|\/)(node_modules|data|\.env|\.env\..+|CONVERSAS\.md\.bak)$/.test(src) || src.endsWith(".env.example");
cpSync(join(raiz, "robots", id), join(out, "robots", id), { recursive: true, filter: ignorar });
cpSync(join(raiz, "shared"), join(out, "shared"), { recursive: true, filter: ignorar });

const versao = JSON.parse(execFileSync("node", ["-e", `console.log(JSON.stringify(require("fs").existsSync("${join(raiz, "robots", id, "robot.json")}") ? JSON.parse(require("fs").readFileSync("${join(raiz, "robots", id, "robot.json")}","utf8")) : {}))`]).toString()) as { versao?: string };

writeFileSync(join(out, "package.json"), JSON.stringify({
  name: id, version: versao.versao ?? "1.0.0", private: true, type: "module", engines: { node: ">=22.18" },
  scripts: { start: `node robots/${id}/src/index.ts`, test: `node --test "shared/**/*.test.ts" "robots/${id}/tests/*.test.ts"` },
}, null, 2) + "\n");

writeFileSync(join(out, "Dockerfile"), `FROM node:22-alpine
WORKDIR /app
COPY . .
RUN mkdir -p /data && chown node:node /data
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/robot.db MEDIA_DIR=/data/media
VOLUME /data
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "robots/${id}/src/index.ts"]
`);
writeFileSync(join(out, ".dockerignore"), "node_modules\ndata\n.env\n");
writeFileSync(join(out, "LEIA-ME-PRIMEIRO.md"), `# ${id}

Este é o pacote pronto para instalar. Comece por **robots/${id}/INSTALACAO.md** e, depois,
**robots/${id}/MANUAL.md**.

Resumo (computador ou servidor com Node.js 22.18 ou mais novo):

1. Copie \`robots/${id}/.env.example\` para \`.env\` (na raiz desta pasta) e preencha.
2. Copie \`robots/${id}/config/empresa.exemplo.json\` para \`robots/${id}/config/empresa.json\` e ajuste os dados da empresa.
3. Rode \`npm start\`.
4. Abra \`http://localhost:3000/admin\` e entre com a chave que você definiu em ADMIN_TOKEN.

Para testar sem WhatsApp: \`DRY_RUN=true\` no .env (nada é enviado).
`);

try {
  execFileSync("tar", ["-czf", `${out}.tar.gz`, "-C", join(raiz, "dist"), id], { stdio: "ignore" });
  console.log(`Pacote pronto: dist/${id}/ e dist/${id}.tar.gz`);
} catch {
  console.log(`Pacote pronto: dist/${id}/ (compacte a pasta para entregar)`);
}
