import { CalendarDays, Layers3, ListChecks } from "lucide-react";

import { DataNotice } from "@/components/DataNotice";
import { EventCard } from "@/components/EventCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SourceProfileDrawer } from "@/components/SourceProfileDrawer";
import { formatCount, formatDate } from "@/lib/format";
import { getDailyBriefEvents } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export default async function DailyBriefPage() {
  const events = await getDailyBriefEvents();
  const leadEvent = events[0];
  const secondaryEvents = events.slice(1);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-ink">Clawnews</p>
            <p className="text-xs text-ink/56">{formatDate(leadEvent.updatedAt ?? leadEvent.happenedAt)}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pine shadow-soft-ring">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Daily Brief
          </div>
        </div>
      </header>

      <main className="safe-bottom mx-auto grid max-w-5xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <div className="space-y-6">
          <section>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
              <span>{formatCount(events.length, "event")}</span>
              <span className="text-ink/28">/</span>
              <span>{formatCount(leadEvent.sources.length, "source")}</span>
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Daily Brief
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">
              What happened, what shifted, who is making claims, and which source profiles are
              attached to the event.
            </p>
          </section>

          <DataNotice artifactPath={leadEvent.artifactPath} origin={leadEvent.origin} />

          <EventCard event={leadEvent} />

          {secondaryEvents.length > 0 ? (
            <section className="space-y-4">
              <SectionHeader eyebrow="More today" title="Additional events" />
              <div className="grid gap-4">
                {secondaryEvents.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="space-y-4">
            <SectionHeader
              eyebrow="Source context"
              summary="Ownership, funding, incentives, and article links for the lead event."
              title="Profiles"
            />
            <SourceProfileDrawer compact sources={leadEvent.sources} />
          </section>

          <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Claim snapshot
            </div>
            <ul className="mt-4 space-y-3">
              {leadEvent.claims.slice(0, 3).map((claim) => (
                <li key={claim.id} className="border-t border-ink/10 pt-3 first:border-t-0 first:pt-0">
                  {claim.label ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-saffron">
                      {claim.label}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm leading-6 text-ink/76">{claim.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-ink/10 bg-ink p-4 text-white shadow-soft-panel">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
              <Layers3 className="h-4 w-4" aria-hidden="true" />
              Brief state
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-white/52">Claims</dt>
                <dd className="mt-1 text-2xl font-semibold">{leadEvent.claims.length}</dd>
              </div>
              <div>
                <dt className="text-white/52">Open points</dt>
                <dd className="mt-1 text-2xl font-semibold">{leadEvent.disagreements.length}</dd>
              </div>
              <div>
                <dt className="text-white/52">Stakeholders</dt>
                <dd className="mt-1 text-2xl font-semibold">{leadEvent.stakeholders.length}</dd>
              </div>
              <div>
                <dt className="text-white/52">Updates</dt>
                <dd className="mt-1 text-2xl font-semibold">{leadEvent.whatChanged.length}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </main>
    </>
  );
}
