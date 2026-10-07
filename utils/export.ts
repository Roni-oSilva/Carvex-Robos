import type { Book, BookChapter } from "@/types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** HTML autônomo (imprimível em PDF pelo navegador) com capa, sumário e capítulos. */
export function buildBookHtml(book: Book, chapters: BookChapter[]): string {
  const toc = chapters.map((c, i) => `<li><a href="#c${i}">${esc(c.title)}</a></li>`).join("");
  const body = chapters
    .map((c, i) => `<section id="c${i}"><h2>${esc(c.title)}</h2>${c.content ?? ""}</section>`)
    .join("\n");
  return `<!doctype html>
<html lang="${esc(book.language || "pt-BR")}"><head><meta charset="utf-8">
<title>${esc(book.title)}</title>
<style>
body{font-family:Georgia,serif;max-width:42rem;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#111}
h1{font-size:2.4rem;margin-bottom:.2rem}h2{margin-top:2.5rem;page-break-before:always}
.cover{min-height:60vh;display:flex;flex-direction:column;justify-content:center}
.meta{color:#555}blockquote{border-left:4px solid #ccc;margin-left:0;padding-left:1rem;color:#555}
</style></head><body>
<div class="cover"><h1>${esc(book.title)}</h1>${book.subtitle ? `<p class="meta">${esc(book.subtitle)}</p>` : ""}${book.author ? `<p class="meta">${esc(book.author)}</p>` : ""}<p class="meta">Versão ${esc(book.version)}</p></div>
<h2>Sumário</h2><ol>${toc}</ol>
${body}
</body></html>`;
}
