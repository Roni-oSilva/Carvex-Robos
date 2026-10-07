import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ADMIN_PREFIXES = ["/dashboard", "/radar", "/products", "/library", "/analytics", "/settings"];

// /ebooks e /paths têm páginas públicas em /<seção>/[slug]; só a listagem,
// a criação e a edição pertencem ao painel.
function isAdminPath(path: string) {
  if (ADMIN_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return true;
  return /^\/(ebooks|paths)\/?$/.test(path) || /^\/(ebooks|paths)\/(new|[^/]+\/edit)\/?$/.test(path);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAdminArea = isAdminPath(path);

  if (isAdminArea && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return response;
}
