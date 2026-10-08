import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectaImagem, lerImagem, MAX_MEDIA_BYTES, removerImagem, salvarImagem } from "./store.ts";

const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(40, 1)]);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40, 2)]);
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(30)]);

test("reconhece imagem pelos bytes, não pelo nome ou tipo informado", () => {
  assert.equal(detectaImagem(jpg), "image/jpeg");
  assert.equal(detectaImagem(png), "image/png");
  assert.equal(detectaImagem(webp), "image/webp");
  assert.equal(detectaImagem(Buffer.from("<script>alert(1)</script>".padEnd(40))), null);
  assert.equal(detectaImagem(Buffer.from("%PDF-1.7".padEnd(40))), null);
});

test("salva com nome aleatório, lê de volta e remove", () => {
  const d = mkdtempSync(join(tmpdir(), "midia-"));
  const r = salvarImagem(d, jpg, "image/jpeg");
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.match(r.arquivo, /^[a-f0-9]{32}\.jpg$/);
  assert.equal(lerImagem(d, r.arquivo)!.mime, "image/jpeg");
  removerImagem(d, r.arquivo);
  assert.equal(existsSync(join(d, r.arquivo)), false);
  assert.equal(lerImagem(d, r.arquivo), null);
});

test("recusa arquivo grande, vazio, não-imagem e tipo que não confere", () => {
  const d = mkdtempSync(join(tmpdir(), "midia-"));
  assert.deepEqual(salvarImagem(d, Buffer.alloc(0)), { ok: false, motivo: "arquivo vazio" });
  assert.match((salvarImagem(d, Buffer.alloc(MAX_MEDIA_BYTES + 1, 1)) as { motivo: string }).motivo, /5 MB/);
  assert.match((salvarImagem(d, Buffer.from("<html>".padEnd(40))) as { motivo: string }).motivo, /não é uma imagem/);
  assert.match((salvarImagem(d, png, "image/jpeg") as { motivo: string }).motivo, /não confere/);
});

test("nomes com ../ ou fora do padrão nunca são lidos nem removidos", () => {
  const d = mkdtempSync(join(tmpdir(), "midia-"));
  for (const ruim of ["../etc/passwd", "..%2f..%2fx.jpg", "a.jpg", "/etc/hosts", "0123456789abcdef0123456789abcdef.exe", "0123456789ABCDEF0123456789abcdef.jpg"]) {
    assert.equal(lerImagem(d, ruim), null, ruim);
    removerImagem(d, ruim); // não pode lançar nem apagar nada
  }
});
