// Regenera demo/CONVERSAS.md de todos os robôs (executa cada simulate.ts). Uso: npm run demo
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { raiz, robos } from "./gerar-docs.ts";

for (const r of robos) {
  execFileSync("node", ["--no-warnings", "demo/simulate.ts"], { cwd: join(raiz, "robots", r.id), stdio: "inherit" });
  console.log(`✔ ${r.nome}`);
}
