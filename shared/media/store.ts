import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Mídia recebida de clientes (fotos). Só imagens, tamanho limitado, nome aleatório, tipo conferido pelos bytes. */
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const NOME_OK = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

/** Confere os primeiros bytes (assinatura do arquivo) — o "Content-Type" informado por terceiros não basta. */
export function detectaImagem(b: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

export type ResultadoSalvar = { ok: true; arquivo: string; mime: string; bytes: number } | { ok: false; motivo: string };

export function salvarImagem(dir: string, data: Buffer, mimeInformado?: string): ResultadoSalvar {
  if (data.length === 0) return { ok: false, motivo: "arquivo vazio" };
  if (data.length > MAX_MEDIA_BYTES) return { ok: false, motivo: "arquivo maior que 5 MB" };
  const real = detectaImagem(data);
  if (!real) return { ok: false, motivo: "não é uma imagem JPEG, PNG ou WebP" };
  if (mimeInformado && EXT[mimeInformado] && mimeInformado !== real) return { ok: false, motivo: "tipo informado não confere com o arquivo" };
  mkdirSync(dir, { recursive: true });
  const arquivo = `${randomBytes(16).toString("hex")}.${EXT[real]}`;
  writeFileSync(join(dir, arquivo), data, { mode: 0o600 });
  return { ok: true, arquivo, mime: real, bytes: data.length };
}

/** Lê um arquivo salvo. Recusa qualquer nome que não seja o formato gerado por nós (impede ../ e afins). */
export function lerImagem(dir: string, arquivo: string): { data: Buffer; mime: string } | null {
  if (!NOME_OK.test(arquivo)) return null;
  const p = join(dir, arquivo);
  if (!existsSync(p)) return null;
  return { data: readFileSync(p), mime: MIME[arquivo.split(".")[1]] };
}

export function removerImagem(dir: string, arquivo: string): void {
  if (NOME_OK.test(arquivo)) rmSync(join(dir, arquivo), { force: true });
}
