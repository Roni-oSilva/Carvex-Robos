import { PathForm } from "@/components/dashboard/path-form";

export const metadata = { title: "Nova trilha" };

export default function NewPathPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nova trilha</h1>
      <PathForm />
    </div>
  );
}
