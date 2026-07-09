"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { generateStoryDraft } from "@/lib/ai/story-generator";
import type { Brief } from "@/lib/types";

export type GenerateStoryState = { error: string | null };

export async function generateStory(
  briefId: string,
  _prev: GenerateStoryState,
): Promise<GenerateStoryState> {
  const supabase = await createClient();

  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .single<Brief>();

  if (briefError || !brief) {
    return { error: "Brief not found." };
  }

  let draft;
  try {
    draft = await generateStoryDraft(brief);
  } catch {
    return { error: "Story generation failed — try again." };
  }

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .insert({
      brief_id: brief.id,
      title: draft.title,
      summary: draft.summary,
      summary_source: draft.source,
      summary_confidence: draft.summary_confidence,
      summary_review_status: "unreviewed",
      status: "ready",
    })
    .select("id")
    .single();

  if (storyError || !story) {
    return { error: "Story generation failed — try again." };
  }

  const { error: scenesError } = await supabase.from("scenes").insert(
    draft.scenes.map((scene) => ({
      story_id: story.id,
      sequence: scene.sequence,
      visual_prompt: scene.visual_prompt,
      visual_prompt_source: draft.source,
      visual_prompt_confidence: scene.confidence,
      visual_prompt_review_status: "unreviewed",
      voiceover_text: scene.voiceover,
      duration_sec: scene.duration_sec,
    })),
  );

  if (scenesError) {
    // Compensate — don't leave an orphaned story with no scenes.
    await supabase.from("stories").delete().eq("id", story.id);
    return { error: "Story generation failed — try again." };
  }

  await logAudit({
    action: "story_generated",
    object_type: "story",
    object_id: story.id,
    payload_snapshot: { brief_id: brief.id, source: draft.source },
    risk_level: "low",
  });

  revalidatePath(`/briefs/${briefId}`);
  redirect(`/stories/${story.id}`);
}
