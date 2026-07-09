"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { submitVideoJob as submitToProvider } from "@/lib/video/provider";
import type { Scene } from "@/lib/types";

export type SubmitVideoJobState = { error: string | null };

export async function submitVideoJob(
  storyId: string,
  _prev: SubmitVideoJobState,
): Promise<SubmitVideoJobState> {
  const supabase = await createClient();

  const { data: scenes, error: scenesError } = await supabase
    .from("scenes")
    .select("*")
    .eq("story_id", storyId)
    .order("sequence")
    .returns<Scene[]>();

  if (scenesError || !scenes || scenes.length === 0) {
    return { error: "No scenes to submit — generate a story first." };
  }

  let submission;
  try {
    submission = await submitToProvider(scenes);
  } catch {
    return { error: "Video submission failed — try again." };
  }

  const { data: job, error: jobError } = await supabase
    .from("video_jobs")
    .insert({
      story_id: storyId,
      status: "queued",
      provider: submission.provider,
      external_job_id: submission.externalJobId,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return { error: "Video submission failed — try again." };
  }

  await supabase.from("stories").update({ status: "submitted" }).eq("id", storyId);

  await logAudit({
    action: "video_job_submitted",
    object_type: "video_job",
    object_id: job.id,
    payload_snapshot: { story_id: storyId, provider: submission.provider },
    risk_level: "medium",
  });

  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/");
  redirect(`/video-jobs/${job.id}`);
}
