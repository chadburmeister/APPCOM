import { requireSession } from "@/lib/auth";
import { NewCallForm } from "./NewCallForm";

export default async function NewCallPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-bold text-purple-deep">Log a call</h1>
      <p className="mb-6 text-sm text-gray-text">
        Add the call details, then score it yourself or share it with your panel.
      </p>
      <NewCallForm />
    </div>
  );
}
