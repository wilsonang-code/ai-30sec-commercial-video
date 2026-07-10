import type { Scene, VideoJobStatus } from "@/lib/types";

const DEMO_OUTPUT_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const REPLICATE_MODEL = "minimax/video-01";

function combinedPrompt(scenes: Scene[]): string {
  return scenes
    .sort((a, b) => a.sequence - b.sequence)
    .map((s) => s.visual_prompt)
    .join(" Then, ");
}

export async function submitVideoJob(
  scenes: Scene[],
): Promise<{ provider: string; externalJobId: string }> {
  if (process.env.REPLICATE_API_TOKEN) {
    const res = await fetch(
      `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          input: { prompt: combinedPrompt(scenes) },
        }),
      },
    );
    if (!res.ok) throw new Error(`Replicate submit failed: ${res.status}`);
    const json = await res.json();
    return { provider: "minimax", externalJobId: json.id };
  }

  return { provider: "minimax", externalJobId: `sim_${crypto.randomUUID()}` };
}

export async function checkVideoJobStatus(job: {
  id: string;
  status: VideoJobStatus;
  external_job_id: string | null;
  created_at: string;
}): Promise<{ status: VideoJobStatus; output_url?: string; error_message?: string }> {
  if (process.env.REPLICATE_API_TOKEN && !job.external_job_id?.startsWith("sim_")) {
    const res = await fetch(
      `https://api.replicate.com/v1/predictions/${job.external_job_id}`,
      { headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` } },
    );
    if (!res.ok)
      return { status: "failed", error_message: `Replicate status check failed: ${res.status}` };
    const json = await res.json();
    if (json.status === "succeeded") {
      const output = Array.isArray(json.output) ? json.output[0] : json.output;
      return { status: "completed", output_url: output };
    }
    if (json.status === "failed" || json.status === "canceled")
      return { status: "failed", error_message: json.error ?? "Replicate job failed" };
    return { status: "processing" };
  }

  const elapsedMs = Date.now() - new Date(job.created_at).getTime();
  if (job.status === "queued" && elapsedMs >= 5_000) return { status: "processing" };
  if (job.status === "processing" && elapsedMs >= 15_000)
    return { status: "completed", output_url: DEMO_OUTPUT_URL };
  return { status: job.status };
}
