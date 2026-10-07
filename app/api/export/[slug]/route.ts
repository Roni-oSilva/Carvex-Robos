import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBookHtml } from "@/utils/export";
import { buildEpub } from "@/utils/epub";
import type { Book, BookChapter } from "@/types";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { data: book } = await supabase.from("books").select("*").eq("slug", params.slug).maybeSingle();
  if (!book) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data: chapters } = await supabase.from("book_chapters").select("*").eq("book_id", book.id).order("order_index");

  const list = (chapters ?? []) as BookChapter[];
  if (new URL(req.url).searchParams.get("format") === "epub") {
    const bytes = await buildEpub(book as Book, list);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${book.slug}.epub"`,
      },
    });
  }

  return new NextResponse(buildBookHtml(book as Book, list), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${book.slug}.html"`,
    },
  });
}
