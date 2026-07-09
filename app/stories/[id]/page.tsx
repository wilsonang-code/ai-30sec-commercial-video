import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { Scene, Story, VideoJob, Brief } from "@/lib/types";
import { SceneEditor } from "./SceneEditor";
import { GenerateVideoButton } from "./GenerateVideoButton";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("*, briefs ( * )")
    .eq("id", id)
    .single<Story & { briefs: Brief }>();

  if (storyError || !story) {
    notFound();
  }

  const [{ data: scenes, error: scenesError }, { data: jobs }] =
    await Promise.all([
      supabase
        .from("scenes")
        .select("*")
        .eq("story_id", id)
        .order("sequence")
        .returns<Scene[]>(),
      supabase
        .from("video_jobs")
        .select("*")
        .eq("story_id", id)
        .order("created_at", { ascending: false })
        .returns<VideoJob[]>(),
    ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/briefs/${story.brief_id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← {story.briefs?.brand_name ?? "Brief"}
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{story.title}</h1>
          {story.summary && (
            <p className="mt-1 max-w-xl text-sm text-neutral-500">
              {story.summary}
            </p>
          )}
        </div>
        <StatusBadge status={story.status} />
      </div>

      {jobs && jobs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/video-jobs/${job.id}`}
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs hover:border-neutral-400"
            >
              Video job <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Scenes</h2>

        {scenesError && (
          <p className="mt-2 text-sm text-red-600">
            Failed to load scenes — try refreshing.
          </p>
        )}

        {!scenesError && scenes && scenes.length === 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No scenes generated yet.
          </div>
        )}

        {!scenesError && scenes && scenes.length > 0 && (
          <div className="mt-3 space-y-3">
            {scenes.map((scene) => (
              <SceneEditor key={scene.id} scene={scene} />
            ))}
          </div>
        )}
      </section>

      {scenes && scenes.length > 0 && (
        <section className="mt-8">
          <GenerateVideoButton storyId={story.id} />
        </section>
      )}
    </main>
  );
}
