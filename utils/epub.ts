import JSZip from "jszip";
import type { Book, BookChapter } from "@/types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** HTML do Tiptap/IA → XHTML mínimo (void elements fechados, entidades numéricas). */
function toXhtml(html: string): string {
  return html
    .replace(/&nbsp;/g, "&#160;")
    .replace(/<(br|hr)\s*>/gi, "<$1/>")
    .replace(/<img([^>]*?)(?<!\/)>/gi, "<img$1/>");
}

export async function buildEpub(book: Book, chapters: BookChapter[]): Promise<Uint8Array> {
  const lang = book.language || "pt-BR";
  const zip = new JSZip();

  // mimetype precisa ser o primeiro arquivo e sem compressão.
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
  );

  const page = (title: string, body: string) =>
    `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${esc(lang)}" xml:lang="${esc(lang)}"><head><meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" href="style.css"/></head><body>${body}</body></html>`;

  zip.file("OEBPS/style.css", "body{font-family:serif;line-height:1.6}h1,h2{page-break-after:avoid}blockquote{margin-left:1em;font-style:italic}");
  zip.file(
    "OEBPS/title.xhtml",
    page(book.title, `<h1>${esc(book.title)}</h1>${book.subtitle ? `<p>${esc(book.subtitle)}</p>` : ""}${book.author ? `<p>${esc(book.author)}</p>` : ""}`),
  );
  chapters.forEach((c, i) => {
    zip.file(`OEBPS/c${i}.xhtml`, page(c.title, `<h2>${esc(c.title)}</h2>${toXhtml(c.content ?? "")}`));
  });

  const navItems = chapters.map((c, i) => `<li><a href="c${i}.xhtml">${esc(c.title)}</a></li>`).join("");
  zip.file(
    "OEBPS/nav.xhtml",
    page("Sumário", `<nav epub:type="toc" id="toc"><h1>Sumário</h1><ol>${navItems}</ol></nav>`),
  );

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>`,
    ...chapters.map((_, i) => `<item id="c${i}" href="c${i}.xhtml" media-type="application/xhtml+xml"/>`),
  ].join("");
  const spine = [`<itemref idref="title"/>`, ...chapters.map((_, i) => `<itemref idref="c${i}"/>`)].join("");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">urn:uuid:${esc(book.id)}</dc:identifier><dc:title>${esc(book.title)}</dc:title><dc:language>${esc(lang)}</dc:language>${book.author ? `<dc:creator>${esc(book.author)}</dc:creator>` : ""}<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta></metadata><manifest>${manifest}</manifest><spine>${spine}</spine></package>`,
  );

  return zip.generateAsync({ type: "uint8array", mimeType: "application/epub+zip" });
}
