"use client";

import { useActionState } from "react";
import { generateStory, type GenerateStoryState } from "@/lib/actions/stories";

const initialState: GenerateStoryState = { error: null };

export function GenerateStoryButton({ briefId }: { briefId: string }) {
  const [state, formAction, pending] = useActionState(
    generateStory.bind(null, briefId),
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error && (
        <p className="mb-3 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Generating…" : "Generate Story"}
      </button>
    </form>
  );
}
