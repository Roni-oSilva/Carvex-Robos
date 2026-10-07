import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  GENERATING: "bg-amber-100 text-amber-800",
  REVIEW: "bg-blue-100 text-blue-800",
  READY: "bg-emerald-100 text-emerald-800",
  PUBLISHED: "bg-green-600 text-white",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", colors[status] ?? "bg-slate-200")}>
      {status}
    </span>
  );
}
