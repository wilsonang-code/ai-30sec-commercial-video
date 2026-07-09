import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KpiCards } from "@/app/components/KpiCards";
import { RealtimeJobsTable, type DashboardRow } from "@/app/components/RealtimeJobsTable";

type AttentionScene = {
  id: string;
  sequence: number;
  visual_prompt: string;
  visual_prompt_confidence: number | null;
  story_id: string;
  stories: { title: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: jobs, error },
    { count: totalJobs },
    { count: completedJobs },
    { data: reviews },
    { count: scenesNeedingReview },
    { data: attentionScenes },
  ] = await Promise.all([
    supabase
      .from("video_jobs")
      .select(
        "id, status, provider, output_url, created_at, stories ( id, title, briefs ( id, brand_name, product ) )",
      )
      .order("created_at", { ascending: false })
      .returns<DashboardRow[]>(),
    supabase.from("video_jobs").select("*", { count: "exact", head: true }),
    supabase
      .from("video_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("reviews").select("decision"),
    supabase
      .from("scenes")
      .select("*", { count: "exact", head: true })
      .eq("visual_prompt_review_status", "unreviewed"),
    supabase
      .from("scenes")
      .select("id, sequence, visual_prompt, visual_prompt_confidence, story_id, stories ( title )")
      .eq("visual_prompt_review_status", "unreviewed")
      .order("visual_prompt_confidence", { ascending: true })
      .limit(5)
      .returns<AttentionScene[]>(),
  ]);

  const acceptedCount = reviews?.filter((r) => r.decision === "accepted").length ?? 0;
  const acceptanceRate = reviews && reviews.length > 0 ? acceptedCount / reviews.length : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All video jobs across every brief.
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          New Brief
        </Link>
      </div>

      <div className="mt-6">
        <KpiCards
          total={totalJobs ?? 0}
          completed={completedJobs ?? 0}
          acceptanceRate={acceptanceRate}
          scenesNeedingReview={scenesNeedingReview ?? 0}
        />
      </div>

      {error && (
        <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load video jobs — try refreshing the page.
        </div>
      )}

      {!error && <RealtimeJobsTable initialJobs={jobs ?? []} />}

      {attentionScenes && attentionScenes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Reviewer attention queue</h2>
          <p className="text-sm text-neutral-500">
            Lowest-confidence scenes awaiting review.
          </p>
          <ul className="mt-3 space-y-2">
            {attentionScenes.map((scene) => (
              <li key={scene.id}>
                <Link
                  href={`/stories/${scene.story_id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-400"
                >
                  <span className="text-sm">
                    <span className="font-medium">
                      {scene.stories?.title ?? "Untitled story"}
                    </span>{" "}
                    <span className="text-neutral-400">
                      · Scene {scene.sequence}
                    </span>
                  </span>
                  <span className="text-xs text-amber-700">
                    {scene.visual_prompt_confidence != null
                      ? `${Math.round(scene.visual_prompt_confidence * 100)}%`
                      : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
