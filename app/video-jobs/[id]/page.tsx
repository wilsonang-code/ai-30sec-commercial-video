import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { VideoJob, Scene, Story } from "@/lib/types";
import { JobStatusPoller } from "./JobStatusPoller";

export default async function VideoJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("video_jobs")
    .select("*, stories ( *, briefs ( id, brand_name ) )")
    .eq("id", id)
    .single<VideoJob & { stories: Story & { briefs: { id: string; brand_name: string } } }>();

  if (jobError || !job) {
    notFound();
  }

  const { data: scenes } = await supabase
    .from("scenes")
    .select("*")
    .eq("story_id", job.story_id)
    .order("sequence")
    .returns<Scene[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/stories/${job.story_id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← {job.stories?.title ?? "Story"}
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        {job.stories?.briefs?.brand_name} — Video
      </h1>
      <p className="text-sm text-neutral-500">
        {job.provider} · submitted{" "}
        {new Date(job.created_at).toLocaleString()}
      </p>

      <div className="mt-6">
        <JobStatusPoller
          jobId={job.id}
          initialStatus={job.status}
          initialOutputUrl={job.output_url}
          initialErrorMessage={job.error_message}
        />
      </div>

      {scenes && scenes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Scene breakdown</h2>
          <ol className="mt-3 space-y-2">
            {scenes.map((scene) => (
              <li
                key={scene.id}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">
                    Scene {scene.sequence} · {scene.duration_sec}s
                  </span>
                </div>
                <p className="mt-1 text-sm">{scene.visual_prompt}</p>
                {scene.voiceover_text && (
                  <p className="mt-1 text-sm italic text-neutral-500">
                    &ldquo;{scene.voiceover_text}&rdquo;
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div id="review-section" className="mt-8" />
    </main>
  );
}
