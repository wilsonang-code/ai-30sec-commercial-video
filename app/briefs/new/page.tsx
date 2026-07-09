import { BriefForm } from "./BriefForm";

export default function NewBriefPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">New Brief</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Raw client input — brand, product, goal, and tone. This becomes the
        input for AI story generation.
      </p>
      <div className="mt-8">
        <BriefForm />
      </div>
    </main>
  );
}
