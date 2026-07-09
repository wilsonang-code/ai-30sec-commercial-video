export function KpiCards({
  total,
  completed,
  acceptanceRate,
  scenesNeedingReview,
}: {
  total: number;
  completed: number;
  acceptanceRate: number | null;
  scenesNeedingReview: number;
}) {
  const cards = [
    { label: "Total jobs", value: total.toString() },
    { label: "Completed", value: completed.toString() },
    {
      label: "Acceptance rate",
      value: acceptanceRate == null ? "—" : `${Math.round(acceptanceRate * 100)}%`,
    },
    { label: "Scenes needing review", value: scenesNeedingReview.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-neutral-200 bg-white p-4"
        >
          <p className="text-xs font-medium uppercase text-neutral-400">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
