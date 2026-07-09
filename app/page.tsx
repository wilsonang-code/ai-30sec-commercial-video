import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/app/components/StatusBadge";

type DashboardRow = {
  id: string;
  status: string;
  provider: string;
  output_url: string | null;
  created_at: string;
  stories: {
    id: string;
    title: string;
    briefs: { id: string; brand_name: string; product: string } | null;
  } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("video_jobs")
    .select(
      "id, status, provider, output_url, created_at, stories ( id, title, briefs ( id, brand_name, product ) )",
    )
    .order("created_at", { ascending: false })
    .returns<DashboardRow[]>();

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

      {error && (
        <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load video jobs — try refreshing the page.
        </div>
      )}

      {!error && jobs && jobs.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-600">
            No videos yet — create your first Brief.
          </p>
          <Link
            href="/briefs/new"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Create Brief
          </Link>
        </div>
      )}

      {!error && jobs && jobs.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Brand / Product</th>
                <th className="px-4 py-3 font-medium">Story</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    {job.stories?.briefs ? (
                      <Link
                        href={`/briefs/${job.stories.briefs.id}`}
                        className="font-medium hover:underline"
                      >
                        {job.stories.briefs.brand_name}
                        <span className="ml-1 font-normal text-neutral-400">
                          · {job.stories.briefs.product}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {job.stories ? (
                      <Link
                        href={`/video-jobs/${job.id}`}
                        className="hover:underline"
                      >
                        {job.stories.title}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-600">
                    {job.provider}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
