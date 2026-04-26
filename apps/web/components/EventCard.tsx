import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Newspaper, RadioTower, Scale, ShieldCheck } from "lucide-react";

import { formatCount, formatDateTime, formatPercent } from "@/lib/format";
import type { EventBrief } from "@/lib/types";

interface EventCardProps {
  event: EventBrief;
}

export function EventCard({ event }: EventCardProps) {
  const latestChanges = event.whatChanged.slice(0, 2);
  const transparencyFlags = Array.from(
    new Set(
      event.sources
        .flatMap((source) => [source.ownership, source.funding])
        .filter((value): value is string => Boolean(value))
    )
  ).slice(0, 3);

  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-panel sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
            {event.kicker ? <span>{event.kicker}</span> : null}
            {event.status ? <span className="text-saffron">{event.status}</span> : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {event.title}
          </h2>
        </div>
        <RadioTower className="mt-1 h-6 w-6 flex-none text-pine" aria-hidden="true" />
      </div>

      <p className="mt-4 text-base leading-7 text-ink/78">{event.summary}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <ScoreTile label="Converge" value={formatPercent(event.convergenceScore)} />
        <ScoreTile label="Disagree" value={formatPercent(event.disagreementScore)} />
        <ScoreTile label="Evidence" value={formatPercent(event.evidenceQualityScore)} />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-2 text-sm text-ink/72 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-pine" aria-hidden="true" />
          <dt className="sr-only">Updated</dt>
          <dd>{formatDateTime(event.updatedAt ?? event.happenedAt)}</dd>
        </div>
        {event.location ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-pine" aria-hidden="true" />
            <dt className="sr-only">Location</dt>
            <dd>{event.location}</dd>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-pine" aria-hidden="true" />
          <dt className="sr-only">Sources</dt>
          <dd>{formatCount(event.sources.length, "source")}</dd>
        </div>
      </dl>

      {event.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {event.tags.slice(0, 5).map((tag) => (
            <span
              className="rounded-md border border-tidal/20 bg-tidal/5 px-2.5 py-1 text-xs font-semibold text-tidal"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {transparencyFlags.length > 0 ? (
        <div className="mt-4 rounded-lg border border-saffron/20 bg-saffron/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Ownership / funding flags
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/70">{transparencyFlags.join("; ")}</p>
        </div>
      ) : null}

      {latestChanges.length > 0 ? (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/48">
            What changed
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/76">
            {latestChanges.map((change) => (
              <li key={change} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-saffron" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href={`/events/${event.slug}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 sm:w-auto"
      >
        Open event
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function ScoreTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-ink/10 bg-canvas p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/52">
        <Scale className="h-3.5 w-3.5 text-pine" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
