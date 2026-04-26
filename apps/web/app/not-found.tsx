import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="safe-bottom mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pine">Not found</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">That event is not in the brief.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
        The generated artifact may have changed or the event id is not available in the current
        sample.
      </p>
      <Link
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
        href="/"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Daily Brief
      </Link>
    </main>
  );
}
