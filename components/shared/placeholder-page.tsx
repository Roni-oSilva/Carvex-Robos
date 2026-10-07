export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-xl text-slate-600">{description}</p>
      <p className="mt-6 rounded-md border border-dashed bg-white p-6 text-sm text-slate-500">Módulo em construção.</p>
    </div>
  );
}
