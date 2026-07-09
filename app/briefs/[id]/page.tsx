import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { Brief, Story } from "@/lib/types";

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", id)
    .single<Brief>();

  if (briefError || !brief) {
    notFound();
  }

  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select("*")
    .eq("brief_id", id)
    .order("created_at", { ascending: false })
    .returns<Story[]>();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        {brief.brand_name}
      </h1>
      <p className="text-neutral-500">{brief.product}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-neutral-400">
            Goal
          </dt>
          <dd className="mt-1 text-sm">{brief.goal}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-neutral-400">
            Tone
          </dt>
          <dd className="mt-1 text-sm">{brief.tone}</dd>
        </div>
        {brief.raw_notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-neutral-400">
              Raw notes
            </dt>
            <dd className="mt-1 text-sm text-neutral-600">
              {brief.raw_notes}
            </dd>
          </div>
        )}
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Story</h2>

        {storiesError && (
          <p className="mt-2 text-sm text-red-600">
            Failed to load stories — try refreshing.
          </p>
        )}

        {!storiesError && stories && stories.length === 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-6 text-center">
            <p className="text-sm text-neutral-500">
              No story generated yet for this brief.
            </p>
          </div>
        )}

        {!storiesError && stories && stories.length > 0 && (
          <ul className="mt-3 space-y-2">
            {stories.map((story) => (
              <li key={story.id}>
                <Link
                  href={`/stories/${story.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-400"
                >
                  <span className="text-sm font-medium">{story.title}</span>
                  <StatusBadge status={story.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
