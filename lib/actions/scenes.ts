"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export type UpdateSceneState = { error: string | null; success: boolean };

export async function updateScene(
  sceneId: string,
  storyId: string,
  _prev: UpdateSceneState,
  formData: FormData,
): Promise<UpdateSceneState> {
  const visual_prompt = String(formData.get("visual_prompt") ?? "").trim();
  const voiceover_text = String(formData.get("voiceover_text") ?? "").trim();

  if (!visual_prompt) {
    return { error: "Visual prompt can't be empty.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("scenes")
    .update({
      visual_prompt,
      voiceover_text: voiceover_text || null,
      visual_prompt_review_status: "edited",
    })
    .eq("id", sceneId);

  if (error) {
    return { error: "Failed to save scene — try again.", success: false };
  }

  await logAudit({
    action: "scene_edited",
    object_type: "scene",
    object_id: sceneId,
    payload_snapshot: { visual_prompt, voiceover_text },
  });

  revalidatePath(`/stories/${storyId}`);
  return { error: null, success: true };
}
