// Serve a página de vendas localmente: npm run site  → http://localhost:4000
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { raiz } from "./gerar-docs.ts";

const tipos: Record<string, string> = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp" };
const base = join(raiz, "site");
createServer(async (req, res) => {
  const caminho = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const arq = join(base, caminho === "/" ? "index.html" : caminho);
  if (!arq.startsWith(base)) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { "Content-Type": tipos[extname(arq)] ?? "application/octet-stream" }).end(await readFile(arq)); }
  catch { res.writeHead(404).end("Não encontrado"); }
}).listen(4000, () => console.log("Página de vendas em http://localhost:4000"));
