"use client";

import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { VideoJobStatus } from "@/lib/types";

export function JobStatusPoller({
  jobId,
  initialStatus,
  initialOutputUrl,
  initialErrorMessage,
}: {
  jobId: string;
  initialStatus: VideoJobStatus;
  initialOutputUrl: string | null;
  initialErrorMessage: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [outputUrl, setOutputUrl] = useState(initialOutputUrl);
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);
  const inFlight = useRef(false);

  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const interval = setInterval(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch(`/api/video-jobs/${jobId}/advance`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.output_url) setOutputUrl(data.output_url);
          if (data.error_message) setErrorMessage(data.error_message);
        }
      } finally {
        inFlight.current = false;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, status]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        {(status === "queued" || status === "processing") && (
          <span className="text-xs text-neutral-400">
            polling for updates…
          </span>
        )}
      </div>

      {status === "failed" && errorMessage && (
        <p className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {status === "completed" && outputUrl && (
        <video
          controls
          className="mt-4 w-full rounded-lg border border-neutral-200"
          src={outputUrl}
        />
      )}

      {(status === "queued" || status === "processing") && (
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400">
          Rendering — video will appear here when ready.
        </div>
      )}
    </div>
  );
}
