"use client";

import { useActionState, useState } from "react";
import { submitVideoJob, type SubmitVideoJobState } from "@/lib/actions/video-jobs";

const initialState: SubmitVideoJobState = { error: null };

export function GenerateVideoButton({ storyId }: { storyId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitVideoJob.bind(null, storyId),
    initialState,
  );

  if (!confirming) {
    return (
      <div>
        {state.error && (
          <p className="mb-2 text-sm text-red-600">{state.error}</p>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Generate Video
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-lg border border-amber-300 bg-amber-50 p-4"
    >
      <p className="text-sm text-amber-800">
        Submit these scenes for video generation? This starts an async render
        job.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
