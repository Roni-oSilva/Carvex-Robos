// Renderiza o vídeo vertical (9:16) dos robôs a partir de scripts/video/cena.html → videos/carvex-robos.mp4 (+ capa).
// Requer: Playwright com Chromium e ffmpeg instalados na máquina (não são dependências do projeto).
// Uso: node scripts/gerar-video.ts            (gera o vídeo)
//      node scripts/gerar-video.ts --previa   (gera só uma grade de quadros para conferir o visual)
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { raiz } from "./gerar-docs.ts";

const require = createRequire(import.meta.url);
// Playwright não é dependência do projeto: carregado em tempo de execução, sem tipos.
function carregaPlaywright(): any {
  const pastas = [raiz, process.cwd(), ...(process.env.NODE_PATH ?? "").split(":").filter(Boolean), "/opt/node22/lib/node_modules"];
  for (const p of pastas) { try { return require(require.resolve("playwright", { paths: [p] })); } catch { /* tenta a próxima */ } }
  throw new Error("Playwright não encontrado. Instale (npm i -g playwright) ou ajuste NODE_PATH.");
}

const FPS = 30;
const saida = join(raiz, "videos");
const previa = process.argv.includes("--previa");
const { chromium } = carregaPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(raiz, "scripts/video/cena.html")).href);
await page.evaluate("document.fonts.ready");
const total: number = await page.evaluate("window.TOTAL");
const quadro = async (t: number) => { await page.evaluate(`window.render(${t})`); };

mkdirSync(saida, { recursive: true });
if (previa) {
  const tmp = join(raiz, "previa-video");
  mkdirSync(tmp, { recursive: true });
  const marcas = [0.9, 2.2, 4.6, 7.6, 10.4, 12.6, 16.4, 20.6, 24.2, 28.6, 31.8, 35.6, total - 1.2];
  for (const [i, t] of marcas.entries()) { await quadro(t); await page.screenshot({ path: join(tmp, `q${String(i).padStart(2, "0")}.png`) }); }
  console.log(`prévia em ${tmp} (${marcas.length} quadros). Duração total: ${total.toFixed(1)} s`);
  await browser.close();
} else {
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "25", "-preset", "slow", "-movflags", "+faststart", "-an", join(saida, "carvex-robos.mp4")], { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round(total * FPS);
  for (let i = 0; i < n; i++) {
    await quadro(i / FPS);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  await quadro(10.2);
  await page.screenshot({ path: join(saida, "carvex-robos-capa.jpg"), type: "jpeg", quality: 85 });
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  console.log(`Vídeo gerado: ${n} quadros, ${total.toFixed(1)} s → videos/carvex-robos.mp4`);
}
