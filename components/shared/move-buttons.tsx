"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveRow, type Orderable } from "@/actions/order.actions";

export function MoveButtons({ kind, id }: { kind: Orderable; id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const move = (dir: "up" | "down") =>
    start(async () => {
      await moveRow(kind, id, dir);
      router.refresh();
    });
  const cls = "rounded border border-slate-300 bg-white px-1.5 text-xs hover:bg-slate-100 disabled:opacity-50";
  return (
    <span className="inline-flex gap-1">
      <button type="button" className={cls} disabled={pending} onClick={() => move("up")} aria-label="Mover para cima">↑</button>
      <button type="button" className={cls} disabled={pending} onClick={() => move("down")} aria-label="Mover para baixo">↓</button>
    </span>
  );
}
