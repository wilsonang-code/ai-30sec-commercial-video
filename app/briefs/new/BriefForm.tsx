"use client";

import { useActionState } from "react";
import { createBrief, type CreateBriefState } from "@/lib/actions/briefs";

const initialState: CreateBriefState = { error: null };

export function BriefForm() {
  const [state, formAction, pending] = useActionState(
    createBrief,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="brand_name" className="block text-sm font-medium">
          Brand name
        </label>
        <input
          id="brand_name"
          name="brand_name"
          required
          placeholder="FreshBrew"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="product" className="block text-sm font-medium">
          Product
        </label>
        <input
          id="product"
          name="product"
          required
          placeholder="Canned Cold Brew Coffee"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="goal" className="block text-sm font-medium">
          Goal
        </label>
        <input
          id="goal"
          name="goal"
          required
          placeholder="Launch awareness for Gen Z audience"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="tone" className="block text-sm font-medium">
          Tone
        </label>
        <input
          id="tone"
          name="tone"
          required
          placeholder="Energetic, bold, playful"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="raw_notes" className="block text-sm font-medium">
          Raw notes <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="raw_notes"
          name="raw_notes"
          rows={4}
          placeholder="Launch in June, skate park vibes, morning routine angle"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save Brief"}
      </button>
    </form>
  );
}
