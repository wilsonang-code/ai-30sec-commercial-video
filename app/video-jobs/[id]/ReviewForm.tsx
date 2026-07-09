"use client";

import { useActionState } from "react";
import { submitReview, type SubmitReviewState } from "@/lib/actions/reviews";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { Review } from "@/lib/types";

const initialState: SubmitReviewState = { error: null, success: false };

function ReviewActionForm({
  videoJobId,
  decision,
}: {
  videoJobId: string;
  decision: "accepted" | "rejected";
}) {
  const [state, formAction, pending] = useActionState(
    submitReview.bind(null, videoJobId, decision),
    initialState,
  );

  if (state.success) {
    return (
      <p className="text-sm text-green-700">
        Review submitted — marked as {decision}.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <textarea
        name="feedback"
        placeholder="Feedback (optional)"
        rows={2}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
          decision === "accepted"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {pending
          ? "Submitting…"
          : decision === "accepted"
            ? "Accept"
            : "Reject"}
      </button>
    </form>
  );
}

export function ReviewForm({
  videoJobId,
  existingReviews,
}: {
  videoJobId: string;
  existingReviews: Review[];
}) {
  if (existingReviews.length > 0) {
    return (
      <div className="space-y-3">
        {existingReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={review.decision} />
              <span className="text-xs text-neutral-400">
                {new Date(review.created_at).toLocaleString()}
              </span>
            </div>
            {review.feedback && (
              <p className="mt-2 text-sm text-neutral-600">
                {review.feedback}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <ReviewActionForm videoJobId={videoJobId} decision="accepted" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <ReviewActionForm videoJobId={videoJobId} decision="rejected" />
      </div>
    </div>
  );
}
