"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { ReviewDecision } from "@/lib/types";

export type SubmitReviewState = { error: string | null; success: boolean };

export async function submitReview(
  videoJobId: string,
  decision: ReviewDecision,
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const feedback = String(formData.get("feedback") ?? "").trim();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      video_job_id: videoJobId,
      decision,
      feedback: feedback || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Failed to save review — try again.", success: false };
  }

  await logAudit({
    action: "review_logged",
    object_type: "review",
    object_id: data.id,
    payload_snapshot: { video_job_id: videoJobId, decision, feedback },
    risk_level: "high",
  });

  revalidatePath(`/video-jobs/${videoJobId}`);
  revalidatePath("/");
  return { error: null, success: true };
}
