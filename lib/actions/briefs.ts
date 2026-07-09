"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export type CreateBriefState = { error: string | null };

export async function createBrief(
  _prev: CreateBriefState,
  formData: FormData,
): Promise<CreateBriefState> {
  const brand_name = String(formData.get("brand_name") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();
  const raw_notes = String(formData.get("raw_notes") ?? "").trim();

  if (!brand_name || !product || !goal || !tone) {
    return { error: "Brand, product, goal, and tone are all required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .insert({ brand_name, product, goal, tone, raw_notes: raw_notes || null })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create brief." };
  }

  await logAudit({
    action: "brief_created",
    object_type: "brief",
    object_id: data.id,
    payload_snapshot: { brand_name, product, goal, tone },
  });

  revalidatePath("/");
  redirect(`/briefs/${data.id}`);
}
