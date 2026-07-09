"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { VideoJobStatus } from "@/lib/types";

export type DashboardRow = {
  id: string;
  status: VideoJobStatus;
  provider: string;
  output_url: string | null;
  created_at: string;
  stories: {
    id: string;
    title: string;
    briefs: { id: string; brand_name: string; product: string } | null;
  } | null;
};

export function RealtimeJobsTable({
  initialJobs,
}: {
  initialJobs: DashboardRow[];
}) {
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-video-jobs")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_jobs" },
        (payload) => {
          const updated = payload.new as {
            id: string;
            status: VideoJobStatus;
            output_url: string | null;
          };
          setJobs((prev) =>
            prev.map((job) =>
              job.id === updated.id
                ? { ...job, status: updated.status, output_url: updated.output_url }
                : job,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Postgres change events require `video_jobs` to be added to the
  // supabase_realtime publication (supabase/migrations/0002). Poll as a
  // fallback so status still updates live if that hasn't been applied —
  // and drive the same advance endpoint the job detail page uses, so
  // jobs progress even if no one has that page open.
  useEffect(() => {
    const hasPending = jobs.some(
      (job) => job.status === "queued" || job.status === "processing",
    );
    if (!hasPending) return;

    const interval = setInterval(async () => {
      const pendingIds = jobs
        .filter((job) => job.status === "queued" || job.status === "processing")
        .map((job) => job.id);
      if (pendingIds.length === 0) return;

      const results = await Promise.all(
        pendingIds.map(async (id) => {
          const res = await fetch(`/api/video-jobs/${id}/advance`, {
            method: "POST",
          });
          if (!res.ok) return null;
          return { id, ...(await res.json()) };
        }),
      );

      setJobs((prev) =>
        prev.map((job) => {
          const match = results.find((r) => r && r.id === job.id);
          return match
            ? { ...job, status: match.status, output_url: match.output_url }
            : job;
        }),
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [jobs]);

  if (jobs.length === 0) {
    return (
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
    );
  }

  return (
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
                  <Link href={`/video-jobs/${job.id}`} className="hover:underline">
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
  );
}
