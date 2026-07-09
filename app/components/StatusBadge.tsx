const STYLES: Record<string, string> = {
  queued: "bg-neutral-100 text-neutral-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  draft: "bg-neutral-100 text-neutral-700",
  ready: "bg-blue-100 text-blue-700",
  submitted: "bg-purple-100 text-purple-700",
  unreviewed: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  edited: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-neutral-100 text-neutral-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}
