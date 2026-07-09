import type { Scene, VideoJobStatus } from "@/lib/types";

const DEMO_OUTPUT_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

export async function submitVideoJob(
  scenes: Scene[],
): Promise<{ provider: string; externalJobId: string }> {
  if (process.env.RUNWAY_API_KEY) {
    const res = await fetch("https://api.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        prompts: scenes.map((s) => s.visual_prompt),
      }),
    });
    if (!res.ok) throw new Error(`Runway submit failed: ${res.status}`);
    const json = await res.json();
    return { provider: "runway", externalJobId: json.id };
  }

  return { provider: "runway", externalJobId: `sim_${crypto.randomUUID()}` };
}

export async function checkVideoJobStatus(job: {
  id: string;
  status: VideoJobStatus;
  external_job_id: string | null;
  created_at: string;
}): Promise<{ status: VideoJobStatus; output_url?: string; error_message?: string }> {
  if (process.env.RUNWAY_API_KEY && !job.external_job_id?.startsWith("sim_")) {
    const res = await fetch(
      `https://api.runwayml.com/v1/tasks/${job.external_job_id}`,
      { headers: { Authorization: `Bearer ${process.env.RUNWAY_API_KEY}` } },
    );
    if (!res.ok) return { status: "failed", error_message: `Runway status check failed: ${res.status}` };
    const json = await res.json();
    if (json.status === "SUCCEEDED") return { status: "completed", output_url: json.output?.[0] };
    if (json.status === "FAILED") return { status: "failed", error_message: json.failure ?? "Runway job failed" };
    return { status: "processing" };
  }

  const elapsedMs = Date.now() - new Date(job.created_at).getTime();
  if (job.status === "queued" && elapsedMs >= 5_000) return { status: "processing" };
  if (job.status === "processing" && elapsedMs >= 15_000)
    return { status: "completed", output_url: DEMO_OUTPUT_URL };
  return { status: job.status };
}
