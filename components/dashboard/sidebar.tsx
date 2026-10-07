"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  ["/dashboard", "Dashboard"],
  ["/radar", "Radar de Oportunidades"],
  ["/ebooks", "E-books"],
  ["/products", "Produtos"],
  ["/paths", "Trilhas"],
  ["/library", "Biblioteca"],
  ["/analytics", "Analytics"],
  ["/settings", "Configurações"],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="w-56 shrink-0 border-r bg-white p-4">
      <p className="mb-4 font-bold">Fábrica de E-books</p>
      <ul className="space-y-1">
        {items.map(([href, label]) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm hover:bg-slate-100",
                pathname === href || pathname.startsWith(href + "/") ? "bg-brand-50 font-medium text-brand-700" : "text-slate-700",
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
