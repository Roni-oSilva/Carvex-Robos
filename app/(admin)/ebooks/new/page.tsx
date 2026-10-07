import { EbookForm } from "@/components/dashboard/ebook-form";

export const metadata = { title: "Novo e-book" };

export default function NewEbookPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Novo e-book</h1>
      <EbookForm />
    </div>
  );
}
