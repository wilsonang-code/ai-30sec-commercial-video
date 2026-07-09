import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          AI 30-Sec Commercial
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-600 hover:text-neutral-900">
            Dashboard
          </Link>
          <Link
            href="/briefs/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
          >
            New Brief
          </Link>
        </nav>
      </div>
    </header>
  );
}
