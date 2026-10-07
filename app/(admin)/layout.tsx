import { Sidebar } from "@/components/dashboard/sidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex justify-end border-b bg-white px-6 py-3 text-sm text-slate-600">
          {admin.full_name ?? admin.email}
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
