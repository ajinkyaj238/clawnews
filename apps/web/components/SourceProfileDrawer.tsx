"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeDollarSign,
  Building2,
  ChevronRight,
  ExternalLink,
  Info,
  Newspaper,
  X
} from "lucide-react";

import { confidenceLabel, formatDateTime, formatPercent } from "@/lib/format";
import type { SourceProfile } from "@/lib/types";

interface SourceProfileDrawerProps {
  compact?: boolean;
  sources: SourceProfile[];
}

export function SourceProfileDrawer({ compact = false, sources }: SourceProfileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(sources[0]?.id ?? "");

  useEffect(() => {
    setSelectedId((current) => {
      if (sources.some((source) => source.id === current)) {
        return current;
      }

      return sources[0]?.id ?? "";
    });
  }, [sources]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const visibleSources = compact ? sources.slice(0, 3) : sources;
  const selected = useMemo(
    () => sources.find((source) => source.id === selectedId) ?? sources[0],
    [selectedId, sources]
  );

  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-4 text-sm text-ink/62">
        Source profiles will appear here after the event pipeline adds source data.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {visibleSources.map((source) => (
          <button
            className="group flex h-full min-h-32 flex-col rounded-lg border border-ink/10 bg-white p-4 text-left shadow-soft-ring transition hover:-translate-y-0.5 hover:border-pine/40 focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
            key={source.id}
            onClick={() => {
              setSelectedId(source.id);
              setOpen(true);
            }}
            type="button"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{source.name}</span>
                {source.outletType ? (
                  <span className="mt-1 block text-xs text-ink/58">{source.outletType}</span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 flex-none text-ink/38 transition group-hover:text-pine"
                aria-hidden="true"
              />
            </span>

            {source.articleTitle ? (
              <span className="mt-3 line-clamp-2 text-sm leading-5 text-ink/72">
                {source.articleTitle}
              </span>
            ) : null}

            <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-pine">
              Source profile
            </span>
          </button>
        ))}
      </div>

      {open && selected ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            aria-label="Close source profile"
            className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside
            aria-labelledby="source-profile-title"
            aria-modal="true"
            className="safe-bottom fixed inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-lg bg-white p-5 shadow-soft-panel md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[30rem] md:rounded-l-lg md:rounded-tr-none"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pine">
                  Source profile
                </p>
                <h3 id="source-profile-title" className="mt-2 text-2xl font-semibold text-ink">
                  {selected.name}
                </h3>
                {selected.outletType ? (
                  <p className="mt-1 text-sm text-ink/60">{selected.outletType}</p>
                ) : null}
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
                  {confidenceLabel(selected.confidence)} / {formatPercent(selected.confidence)}
                </p>
              </div>
              <button
                aria-label="Close source profile"
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-pine/50 hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {selected.articleTitle ? (
              <div className="mt-5 rounded-lg border border-ink/10 bg-canvas p-4">
                <div className="flex gap-3">
                  <Newspaper className="mt-0.5 h-5 w-5 flex-none text-pine" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{selected.articleTitle}</p>
                    <p className="mt-1 text-xs text-ink/56">
                      {formatDateTime(selected.publishedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              <ProfileRow
                icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
                label="Owner"
                value={selected.ownership}
              />
              <ProfileRow
                icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
                label="Parent / ultimate owner"
                value={[selected.parentCompany, selected.ultimateOwner].filter(Boolean).join("; ")}
              />
              <ProfileRow
                icon={<BadgeDollarSign className="h-4 w-4" aria-hidden="true" />}
                label="Funding"
                value={
                  selected.funding ??
                  selected.knownFunding?.join(", ") ??
                  selected.businessModel
                }
              />
              <ProfileRow
                icon={<Info className="h-4 w-4" aria-hidden="true" />}
                label="Likely framing"
                value={selected.likelyFraming ?? selected.editorialProfile}
              />
              <ProfileRow
                icon={<Info className="h-4 w-4" aria-hidden="true" />}
                label="Context"
                value={[...selected.incentives, ...selected.notes].join("; ")}
              />
              <ProfileRow
                icon={<Info className="h-4 w-4" aria-hidden="true" />}
                label="Last verified"
                value={selected.lastVerifiedAt ? formatDateTime(selected.lastVerifiedAt) : undefined}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {selected.url ? (
                <a
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                  href={selected.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open article
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
              {selected.homepage ? (
                <a
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:border-pine/50 hover:text-pine focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
                  href={selected.homepage}
                  rel="noreferrer"
                  target="_blank"
                >
                  Source site
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function ProfileRow({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-pine">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink/72">
        {value && value.trim() ? value : "No profile detail supplied yet."}
      </p>
    </div>
  );
}
