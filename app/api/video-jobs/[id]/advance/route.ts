import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkVideoJobStatus } from "@/lib/video/provider";
import { logAudit } from "@/lib/audit";
import type { VideoJob } from "@/lib/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("id", id)
    .single<VideoJob>();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status === "completed" || job.status === "failed") {
    return NextResponse.json({ status: job.status, output_url: job.output_url });
  }

  const result = await checkVideoJobStatus(job);

  if (result.status !== job.status) {
    await supabase
      .from("video_jobs")
      .update({
        status: result.status,
        output_url: result.output_url ?? job.output_url,
        error_message: result.error_message ?? null,
      })
      .eq("id", id);

    if (result.status === "completed" || result.status === "failed") {
      await logAudit({
        action: `video_job_${result.status}`,
        object_type: "video_job",
        object_id: id,
        risk_level: "low",
        outcome: result.status === "completed" ? "success" : "failure",
      });
    }
  }

  return NextResponse.json({
    status: result.status,
    output_url: result.output_url ?? job.output_url,
    error_message: result.error_message ?? null,
  });
}
