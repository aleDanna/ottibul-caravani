import { FaqForm } from "@/components/admin/FaqForm";

export default function NewFaqPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Nueva FAQ</h1>
      <FaqForm mode="create" />
    </div>
  );
}
