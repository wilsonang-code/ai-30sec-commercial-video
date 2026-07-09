export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="h-7 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
    </main>
  );
}
