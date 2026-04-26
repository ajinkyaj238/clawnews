import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Scale,
  ScrollText,
  UsersRound
} from "lucide-react";

import { DataNotice } from "@/components/DataNotice";
import { SectionHeader } from "@/components/SectionHeader";
import { SourceProfileDrawer } from "@/components/SourceProfileDrawer";
import { confidenceLabel, formatCount, formatDateTime, formatPercent } from "@/lib/format";
import { getEventById } from "@/lib/event-data";
import type { EventBrief } from "@/lib/types";

interface EventDetailPageProps {
  params: {
    eventId: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);

  if (!event) {
    return {
      title: "Event not found"
    };
  }

  return {
    description: event.summary,
    title: event.title
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventById(params.eventId);

  if (!event) {
    return notFound();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink shadow-soft-ring transition hover:border-pine/40 hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
            href="/"
            aria-label="Back to Daily Brief"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="min-w-0 truncate text-sm font-semibold text-ink">Event Detail</p>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pine shadow-soft-ring">
            {event.status ?? "Brief"}
          </span>
        </div>
      </header>

      <main className="safe-bottom mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
              {event.kicker ? <span>{event.kicker}</span> : null}
              {event.location ? (
                <>
                  <span className="text-ink/28">/</span>
                  <span>{event.location}</span>
                </>
              ) : null}
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink/74">{event.summary}</p>

            <dl className="mt-5 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white p-3">
                <CalendarClock className="h-4 w-4 text-pine" aria-hidden="true" />
                <dt className="sr-only">Updated</dt>
                <dd>{formatDateTime(event.updatedAt ?? event.happenedAt)}</dd>
              </div>
              {event.location ? (
                <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white p-3">
                  <MapPin className="h-4 w-4 text-pine" aria-hidden="true" />
                  <dt className="sr-only">Location</dt>
                  <dd>{event.location}</dd>
                </div>
              ) : null}
              <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white p-3">
                <ScrollText className="h-4 w-4 text-pine" aria-hidden="true" />
                <dt className="sr-only">Source count</dt>
                <dd>{formatCount(event.sources.length, "source")}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <DataNotice artifactPath={event.artifactPath} origin={event.origin} />
            {event.impact ? (
              <div className="rounded-lg border border-ink/10 bg-ink p-4 text-white shadow-soft-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/64">
                  Why it matters
                </p>
                <p className="mt-3 text-sm leading-6 text-white/86">{event.impact}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="What happened"
            summary="A generated event brief, backed by visible source links and confidence scores."
            title="Brief"
          />
          <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring">
            <p className="text-sm leading-6 text-ink/76">{event.summary}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <ScorePill label="Convergence" value={event.convergenceScore} />
              <ScorePill label="Disagreement" value={event.disagreementScore} />
              <ScorePill label="Evidence" value={event.evidenceQualityScore} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Latest movement"
            summary="Changes captured in the current generated event brief."
            title="What changed"
          />
          <div className="grid gap-3">
            {event.whatChanged.length > 0 ? (
              event.whatChanged.map((change) => (
                <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={change}>
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-pine" aria-hidden="true" />
                    <p className="text-sm leading-6 text-ink/76">{change}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No change entries supplied yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Agreement"
            summary="Points where multiple sources substantially converge, with no claim of perfect neutrality."
            title="Where sources agree"
          />
          <div className="grid gap-3">
            {event.agreedFacts.length > 0 ? (
              event.agreedFacts.map((fact) => (
                <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={fact}>
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-pine" aria-hidden="true" />
                    <p className="text-sm leading-6 text-ink/76">{fact}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Agreement points have not been generated yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Claims"
            summary="Main assertions captured from the clustered source set."
            title="Who says what"
          />
          <div className="grid gap-3">
            {event.claims.length > 0 ? (
              event.claims.map((claim) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={claim.id}>
                  <div className="flex items-start gap-3">
                    <ScrollText className="mt-0.5 h-5 w-5 flex-none text-pine" aria-hidden="true" />
                    <div>
                      {claim.label ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
                          {claim.label}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm leading-6 text-ink/78">{claim.text}</p>
                      <p className="mt-3 text-xs font-semibold text-ink/48">
                        {sourceLine(event, claim.sourceIds)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState label="No claim entries supplied yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Source comparison"
            summary="How source claims line up or diverge across the clustered article set."
            title="Perspective spread"
          />
          <div className="grid gap-3">
            {event.sourceComparisons.length > 0 ? (
              event.sourceComparisons.map((comparison) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={comparison.id}>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-pine">
                    {comparison.agreement ? <span>{comparison.agreement}</span> : null}
                    <span className="text-saffron">{confidenceLabel(comparison.confidence)}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-ink">{comparison.summary}</h3>
                  {comparison.framing ? (
                    <p className="mt-2 text-sm leading-6 text-ink/64">{comparison.framing}</p>
                  ) : null}
                  {comparison.evidence.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/72">
                      {comparison.evidence.slice(0, 4).map((evidence) => (
                        <li className="flex gap-2" key={evidence}>
                          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-tidal" />
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))
            ) : (
              <EmptyState label="Source comparisons have not been generated yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Disagreement"
            summary="Points where sources or stakeholders describe the event differently."
            title="Open points"
          />
          <div className="grid gap-3">
            {event.disagreements.length > 0 ? (
              event.disagreements.map((item) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={item.id}>
                  <div className="flex gap-3">
                    <CircleAlert className="mt-0.5 h-5 w-5 flex-none text-poppy" aria-hidden="true" />
                    <div>
                      <h3 className="text-base font-semibold text-ink">{item.point}</h3>
                      {item.positions.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/72">
                          {item.positions.map((position) => (
                            <li className="flex gap-2" key={position}>
                              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-poppy" />
                              <span>{position}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState label="No disagreement entries supplied yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Stakeholders"
            summary="Actors named in the event brief and their visible interests."
            title="Interests"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {event.stakeholders.length > 0 ? (
              event.stakeholders.map((stakeholder) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={stakeholder.id}>
                  <div className="flex items-start gap-3">
                    <UsersRound className="mt-0.5 h-5 w-5 flex-none text-pine" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-ink">{stakeholder.name}</h3>
                      {stakeholder.role ? (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-pine">
                          {stakeholder.role}
                        </p>
                      ) : null}
                      {stakeholder.position ? (
                        <p className="mt-3 text-sm leading-6 text-ink/76">{stakeholder.position}</p>
                      ) : null}
                      {stakeholder.interest ? (
                        <p className="mt-2 text-sm leading-6 text-ink/62">{stakeholder.interest}</p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState label="No stakeholder entries supplied yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Source context"
            summary="Open each source profile for ownership, funding, incentive notes, and article links."
            title="Profiles"
          />
          <SourceProfileDrawer sources={event.sources} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Timeline"
            summary="Event changes and updates in sequence when the artifact includes them."
            title="Sequence"
          />
          <div className="grid gap-3">
            {event.timeline.length > 0 ? (
              event.timeline.map((item) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={item.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pine">
                    {item.label ?? formatDateTime(item.time)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink/76">{item.text}</p>
                  {item.label && item.time ? (
                    <p className="mt-3 text-xs text-ink/48">{formatDateTime(item.time)}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <EmptyState label="No timeline entries supplied yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Raw links"
            summary="Source material remains available beneath the generated brief."
            title="Articles"
          />
          <div className="grid gap-3">
            {event.sources.filter((source) => source.url).length > 0 ? (
              event.sources
                .filter((source) => source.url)
                .map((source) => (
                  <a
                    className="rounded-lg border border-ink/10 bg-white p-4 text-sm font-semibold text-ink shadow-soft-ring transition hover:border-pine/40 hover:text-pine"
                    href={source.url}
                    key={`${source.id}-${source.url}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.articleTitle ?? source.name}
                    <span className="mt-1 block text-xs font-normal text-ink/54">{source.name}</span>
                  </a>
                ))
            ) : (
              <EmptyState label="Raw article links have not been attached yet." />
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Audit"
            summary="Confidence warnings and review items produced by the brief pipeline."
            title="Review notes"
          />
          <div className="grid gap-3">
            {event.audit.length > 0 ? (
              event.audit.map((finding) => (
                <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft-ring" key={finding.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
                    {finding.severity ?? "audit"} / {confidenceLabel(finding.confidence)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink/76">{finding.summary}</p>
                </article>
              ))
            ) : (
              <EmptyState label="No audit findings supplied yet." />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function ScorePill({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-canvas p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/52">
        <Scale className="h-3.5 w-3.5 text-pine" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-ink">{formatPercent(value)}</p>
    </div>
  );
}

function sourceLine(event: EventBrief, sourceIds: string[]) {
  if (sourceIds.length === 0) {
    return "Sources not linked yet";
  }

  const names = sourceIds
    .map((sourceId) => event.sources.find((source) => source.id === sourceId)?.name ?? sourceId)
    .join(", ");

  return `Linked to ${names}`;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-4 text-sm text-ink/62">
      {label}
    </div>
  );
}
