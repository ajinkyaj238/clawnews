"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  EventBrief,
  SourceProfile,
  SourceComparisonItem
} from "@/lib/types";

type ViewMode = "home" | "event";

interface AnalyticalClawNewsAppProps {
  events: EventBrief[];
  initialEventId?: string;
  initialView?: ViewMode;
}

const analyticalTheme = {
  accentBg: "rgba(3,105,161,0.08)",
  bg: "#edf2f8",
  bodyFont: '"Inter", system-ui, sans-serif',
  border: "rgba(15,30,60,0.09)",
  borderMid: "rgba(15,30,60,0.16)",
  headerBg: "rgba(237,242,248,0.94)",
  headingFont: '"Inter", system-ui, sans-serif',
  ink: "#0f1e3c",
  inkMid: "rgba(15,30,60,0.70)",
  inkMuted: "rgba(15,30,60,0.44)",
  pine: "#0369a1",
  poppy: "#be123c",
  radius: "6px",
  radiusSm: "4px",
  saffron: "#c2410c",
  scoreBarColor: "#0369a1",
  shadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.07)",
  shadowStrong:
    "0 2px 4px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.11)",
  surface: "#ffffff",
  surfaceAlt: "#e2eaf4",
  tidal: "#2563eb"
};

type Theme = typeof analyticalTheme;

export function AnalyticalClawNewsApp({
  events,
  initialEventId,
  initialView = "home"
}: AnalyticalClawNewsAppProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const leadEvent = events[0];
  const selectedEvent = useMemo(() => {
    if (!initialEventId) {
      return leadEvent;
    }

    return (
      events.find(
        (event) => event.id === initialEventId || event.slug === initialEventId
      ) ?? leadEvent
    );
  }, [events, initialEventId, leadEvent]);

  if (!leadEvent || !selectedEvent) {
    return (
      <div
        style={{
          alignItems: "center",
          background: analyticalTheme.bg,
          color: analyticalTheme.ink,
          display: "flex",
          fontFamily: analyticalTheme.bodyFont,
          minHeight: "100vh",
          padding: 24
        }}
      >
        No brief data available yet.
      </div>
    );
  }

  const openEvent = () => {
    setDrawerOpen(false);
    setView("event");
  };

  const backHome = () => {
    setDrawerOpen(false);
    setView("home");
  };

  return (
    <div
      style={{
        background: analyticalTheme.bg,
        color: analyticalTheme.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: analyticalTheme.bodyFont,
        minHeight: "100vh",
        position: "relative"
      }}
    >
      <AnalyticalHeader
        event={selectedEvent}
        onBack={backHome}
        theme={analyticalTheme}
        view={view}
      />

      <div style={{ flex: 1 }}>
        {view === "home" ? (
          <HomeView
            events={events}
            isMobile={isMobile}
            onOpenEvent={openEvent}
            theme={analyticalTheme}
          />
        ) : (
          <EventDetailView
            event={selectedEvent}
            isMobile={isMobile}
            onOpenSources={() => setDrawerOpen(true)}
            theme={analyticalTheme}
          />
        )}
      </div>

      <SourceDrawer
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        sources={selectedEvent.sources}
        theme={analyticalTheme}
      />
    </div>
  );
}

function AnalyticalHeader({
  event,
  onBack,
  theme,
  view
}: {
  event: EventBrief;
  onBack: () => void;
  theme: Theme;
  view: ViewMode;
}) {
  return (
    <header
      style={{
        background: theme.headerBg,
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${theme.border}`,
        position: "sticky",
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          height: 52,
          justifyContent: "space-between",
          margin: "0 auto",
          maxWidth: 960,
          padding: "0 28px"
        }}
      >
        {view === "home" ? (
          <div>
            <div
              style={{
                color: theme.ink,
                fontFamily: theme.headingFont,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "-0.02em"
              }}
            >
              Clawnews
            </div>
            <div style={{ color: theme.inkMuted, fontSize: 10, marginTop: 1 }}>
              {formatDate(event.updatedAt)}
            </div>
          </div>
        ) : (
          <button
            onClick={onBack}
            style={{
              alignItems: "center",
              background: "none",
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radiusSm,
              color: theme.ink,
              cursor: "pointer",
              display: "flex",
              fontSize: 12,
              fontWeight: 600,
              gap: 8,
              padding: "6px 12px"
            }}
            type="button"
          >
            ← Back
          </button>
        )}

        <span
          style={{
            alignItems: "center",
            background: theme.accentBg,
            border: `1px solid ${theme.pine}28`,
            borderRadius: 20,
            color: theme.pine,
            display: "inline-flex",
            fontSize: 10,
            fontWeight: 700,
            gap: 6,
            letterSpacing: "0.1em",
            padding: "5px 14px",
            textTransform: "uppercase"
          }}
        >
          {view === "home" ? "Daily Brief" : event.status ?? "Event"}
        </span>
      </div>
    </header>
  );
}

function HomeView({
  events,
  isMobile,
  onOpenEvent,
  theme
}: {
  events: EventBrief[];
  isMobile: boolean;
  onOpenEvent: () => void;
  theme: Theme;
}) {
  const lead = events[0];
  const secondary = events.slice(1);
  const totalSources = events.reduce((total, event) => total + event.sources.length, 0);

  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: 960,
        padding: isMobile ? "20px 16px 56px" : "28px 28px 64px"
      }}
    >
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <div
          style={{
            alignItems: "center",
            color: theme.pine,
            display: "flex",
            fontSize: 10,
            fontWeight: 700,
            gap: 8,
            letterSpacing: "0.14em",
            marginBottom: 10,
            textTransform: "uppercase"
          }}
        >
          <span>{events.length} event{events.length === 1 ? "" : "s"}</span>
          <span style={{ color: theme.inkMuted }}>/</span>
          <span>{totalSources} sources</span>
        </div>
        <h1
          style={{
            color: theme.ink,
            fontFamily: theme.headingFont,
            fontSize: isMobile ? 28 : 38,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            margin: "0 0 10px"
          }}
        >
          Daily Brief
        </h1>
        <p
          style={{
            color: theme.inkMid,
            fontSize: 14,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 520
          }}
        >
          What happened, who is making claims, and what sources are
          incentivized to emphasize.
        </p>
      </div>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <EventCard
            event={lead}
            isLead
            onClick={onOpenEvent}
            theme={theme}
          />
          {secondary.map((event) => (
            <EventCard
              event={event}
              key={event.id}
              onClick={onOpenEvent}
              theme={theme}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            alignItems: "start",
            display: "grid",
            gap: 20,
            gridTemplateColumns: "1fr 280px"
          }}
        >
          <EventCard
            event={lead}
            isLead
            onClick={onOpenEvent}
            theme={theme}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                borderBottom: `1px solid ${theme.border}`,
                color: theme.inkMuted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                paddingBottom: 8,
                textTransform: "uppercase"
              }}
            >
              More today
            </div>
            {secondary.length > 0 ? (
              secondary.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  onClick={onOpenEvent}
                  theme={theme}
                />
              ))
            ) : (
              <div
                style={{
                  border: `1px dashed ${theme.borderMid}`,
                  borderRadius: theme.radius,
                  color: theme.inkMuted,
                  fontSize: 12,
                  lineHeight: 1.6,
                  padding: 16
                }}
              >
                Additional generated events will appear here as ingestion grows.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function EventCard({
  event,
  isLead = false,
  onClick,
  theme
}: {
  event: EventBrief;
  isLead?: boolean;
  onClick: () => void;
  theme: Theme;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.surface,
        border: `1px solid ${hovered ? `${theme.pine}50` : theme.border}`,
        borderRadius: theme.radius,
        boxShadow: hovered ? theme.shadowStrong : theme.shadow,
        display: "flex",
        flexDirection: "column",
        gap: isLead ? 18 : 12,
        padding: isLead ? "28px 28px" : "18px 20px",
        transition: "box-shadow 0.2s, border-color 0.2s"
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          gap: 16,
          justifyContent: "space-between"
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 10
            }}
          >
            {event.kicker ? <Eyebrow theme={theme}>{event.kicker}</Eyebrow> : null}
            {event.status ? (
              <Eyebrow color={theme.saffron} theme={theme}>
                {event.status}
              </Eyebrow>
            ) : null}
          </div>
          <h2
            style={{
              color: theme.ink,
              fontFamily: isLead ? theme.headingFont : theme.bodyFont,
              fontSize: isLead ? 20 : 14,
              fontWeight: isLead ? 700 : 600,
              lineHeight: 1.35,
              margin: 0
            }}
          >
            {event.title}
          </h2>
        </div>
        <div
          aria-hidden="true"
          style={{
            alignItems: "center",
            background: theme.accentBg,
            border: `1px solid ${theme.pine}25`,
            borderRadius: theme.radiusSm,
            color: theme.pine,
            display: "flex",
            flexShrink: 0,
            fontSize: 14,
            height: 32,
            justifyContent: "center",
            width: 32
          }}
        >
          ◉
        </div>
      </div>

      <p
        style={{
          color: theme.inkMid,
          fontSize: isLead ? 14 : 12,
          lineHeight: 1.75,
          margin: 0
        }}
      >
        {event.summary}
      </p>

      {isLead ? (
        <div style={{ display: "flex", gap: 8 }}>
          <ScoreTile label="Convergence" theme={theme} value={event.convergenceScore} />
          <ScoreTile label="Disagreement" theme={theme} value={event.disagreementScore} />
          <ScoreTile label="Evidence" theme={theme} value={event.evidenceQualityScore} />
        </div>
      ) : null}

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            color: theme.inkMuted,
            display: "flex",
            flexWrap: "wrap",
            fontSize: 11,
            gap: 14
          }}
        >
          <span>{timeAgo(event.updatedAt ?? event.happenedAt)}</span>
          {event.location ? <span>{event.location}</span> : null}
          <span>{event.sources.length} source{event.sources.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {isLead && event.tags.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {event.tags.slice(0, 4).map((tag) => (
            <Tag key={tag} theme={theme}>
              {tag}
            </Tag>
          ))}
        </div>
      ) : null}

      {isLead && event.whatChanged.length > 0 ? (
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
          <Eyebrow color={theme.inkMuted} theme={theme}>
            What changed
          </Eyebrow>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              margin: "10px 0 0",
              padding: 0
            }}
          >
            {event.whatChanged.slice(0, 2).map((change) => (
              <li
                key={change}
                style={{
                  color: theme.inkMid,
                  display: "flex",
                  fontSize: 12,
                  gap: 10,
                  lineHeight: 1.65
                }}
              >
                <span
                  style={{
                    background: theme.saffron,
                    borderRadius: "50%",
                    flexShrink: 0,
                    height: 5,
                    marginTop: 8,
                    width: 5
                  }}
                />
                {change}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={onClick}
        style={{
          alignItems: "center",
          alignSelf: "flex-start",
          background: theme.ink,
          border: "none",
          borderRadius: theme.radiusSm,
          color: "#fff",
          cursor: "pointer",
          display: "inline-flex",
          fontSize: 12,
          fontWeight: 600,
          gap: 8,
          padding: isLead ? "10px 20px" : "7px 14px"
        }}
        type="button"
      >
        Open event <span>→</span>
      </button>
    </article>
  );
}

function EventDetailView({
  event,
  isMobile,
  onOpenSources,
  theme
}: {
  event: EventBrief;
  isMobile: boolean;
  onOpenSources: () => void;
  theme: Theme;
}) {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: 960,
        padding: isMobile ? "20px 16px 64px" : "28px 28px 80px"
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12
          }}
        >
          {event.kicker ? <Eyebrow theme={theme}>{event.kicker}</Eyebrow> : null}
          {event.location ? (
            <>
              <span style={{ color: theme.inkMuted, fontSize: 10 }}>/</span>
              <Eyebrow color={theme.inkMuted} theme={theme}>
                {event.location}
              </Eyebrow>
            </>
          ) : null}
        </div>
        <h1
          style={{
            color: theme.ink,
            fontFamily: theme.headingFont,
            fontSize: isMobile ? 24 : 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 14px"
          }}
        >
          {event.title}
        </h1>
        <p
          style={{
            color: theme.inkMid,
            fontSize: 15,
            lineHeight: 1.75,
            margin: "0 0 16px",
            maxWidth: 640
          }}
        >
          {event.summary}
        </p>
        <div
          style={{
            color: theme.inkMuted,
            display: "flex",
            flexWrap: "wrap",
            fontSize: 11,
            gap: 14
          }}
        >
          <span>Updated {formatDate(event.updatedAt)}</span>
          {event.location ? <span>{event.location}</span> : null}
          <span>{event.sources.length} sources</span>
        </div>
      </div>

      <div
        style={{
          alignItems: "start",
          display: isMobile ? "flex" : "grid",
          flexDirection: "column",
          gap: 24,
          gridTemplateColumns: "1.35fr 0.65fr"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Section eyebrow="Signal quality" theme={theme} title="Brief scores">
            <div style={{ display: "flex", gap: 8 }}>
              <ScoreTile label="Convergence" theme={theme} value={event.convergenceScore} />
              <ScoreTile label="Disagreement" theme={theme} value={event.disagreementScore} />
              <ScoreTile label="Evidence" theme={theme} value={event.evidenceQualityScore} />
            </div>
          </Section>

          <ListSection
            accent={theme.pine}
            eyebrow="Latest movement"
            items={event.whatChanged}
            theme={theme}
            title="What changed"
          />

          <ListSection
            accent={theme.pine}
            eyebrow="Agreement"
            items={event.agreedFacts}
            theme={theme}
            title="Where sources agree"
          />

          <Section eyebrow="Claims" theme={theme} title="Who says what">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {event.claims.map((claim) => (
                <Card accent={theme.tidal} key={claim.id} theme={theme}>
                  {claim.label ? (
                    <div style={{ marginBottom: 6 }}>
                      <Eyebrow color={theme.saffron} theme={theme}>
                        {claim.label}
                      </Eyebrow>
                    </div>
                  ) : null}
                  <p
                    style={{
                      color: theme.inkMid,
                      fontSize: 13,
                      lineHeight: 1.65,
                      margin: 0
                    }}
                  >
                    {claim.text}
                  </p>
                  <p
                    style={{
                      color: theme.inkMuted,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      margin: "8px 0 0"
                    }}
                  >
                    {sourceNames(event, claim.sourceIds)}
                  </p>
                </Card>
              ))}
            </div>
          </Section>

          <Section eyebrow="Open points" theme={theme} title="Where sources disagree">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {event.disagreements.map((item) => (
                <Card accent={theme.poppy} key={item.id} theme={theme}>
                  <h4
                    style={{
                      color: theme.ink,
                      fontSize: 13,
                      fontWeight: 600,
                      margin: "0 0 10px"
                    }}
                  >
                    {item.point}
                  </h4>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      listStyle: "none",
                      margin: 0,
                      padding: 0
                    }}
                  >
                    {item.positions.map((position) => (
                      <li
                        key={position}
                        style={{
                          color: theme.inkMid,
                          display: "flex",
                          fontSize: 12,
                          gap: 8,
                          lineHeight: 1.65
                        }}
                      >
                        <span
                          style={{
                            background: theme.poppy,
                            borderRadius: "50%",
                            flexShrink: 0,
                            height: 4,
                            marginTop: 9,
                            width: 4
                          }}
                        />
                        {position}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </Section>

          <Section eyebrow="Source comparison" theme={theme} title="Perspective spread">
            <ComparisonList
              comparisons={event.sourceComparisons}
              sources={event.sources}
              theme={theme}
            />
          </Section>

          <Section eyebrow="Sequence" theme={theme} title="Timeline">
            <div style={{ paddingLeft: 22, position: "relative" }}>
              <div
                style={{
                  background: theme.border,
                  bottom: 8,
                  left: 7,
                  position: "absolute",
                  top: 8,
                  width: 1
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {event.timeline.map((item, index) => (
                  <div key={item.id} style={{ position: "relative" }}>
                    <div
                      style={{
                        background:
                          index === event.timeline.length - 1
                            ? theme.pine
                            : theme.surfaceAlt,
                        border: `2px solid ${
                          index === event.timeline.length - 1
                            ? theme.pine
                            : theme.borderMid
                        }`,
                        borderRadius: "50%",
                        height: 8,
                        left: -19,
                        position: "absolute",
                        top: 4,
                        width: 8
                      }}
                    />
                    <Eyebrow color={theme.pine} theme={theme}>
                      {item.label ?? "Update"}
                    </Eyebrow>
                    <p
                      style={{
                        color: theme.inkMid,
                        fontSize: 13,
                        lineHeight: 1.65,
                        margin: "5px 0 2px"
                      }}
                    >
                      {item.text}
                    </p>
                    <p style={{ color: theme.inkMuted, fontSize: 10, margin: 0 }}>
                      {formatDate(item.time)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <DetailAside
          event={event}
          isMobile={isMobile}
          onOpenSources={onOpenSources}
          theme={theme}
        />
      </div>
    </main>
  );
}

function DetailAside({
  event,
  isMobile,
  onOpenSources,
  theme
}: {
  event: EventBrief;
  isMobile: boolean;
  onOpenSources: () => void;
  theme: Theme;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginTop: isMobile ? 28 : 0
      }}
    >
      {event.impact ? (
        <div
          style={{
            background: theme.ink,
            borderRadius: theme.radius,
            padding: "20px 22px"
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              marginBottom: 10,
              textTransform: "uppercase"
            }}
          >
            Why it matters
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.84)",
              fontSize: 13,
              lineHeight: 1.7,
              margin: 0
            }}
          >
            {event.impact}
          </p>
        </div>
      ) : null}

      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: theme.radius,
          boxShadow: theme.shadow,
          padding: "18px 22px"
        }}
      >
        <Eyebrow theme={theme}>Brief state</Eyebrow>
        <dl
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr 1fr",
            margin: "14px 0 0"
          }}
        >
          {[
            ["Claims", event.claims.length],
            ["Open points", event.disagreements.length],
            ["Stakeholders", event.stakeholders.length],
            ["Updates", event.whatChanged.length]
          ].map(([label, value]) => (
            <div key={label}>
              <dt style={{ color: theme.inkMuted, fontSize: 10, fontWeight: 500 }}>
                {label}
              </dt>
              <dd
                style={{
                  color: theme.ink,
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1,
                  margin: "3px 0 0"
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <button
        onClick={onOpenSources}
        style={{
          alignItems: "center",
          background: theme.accentBg,
          border: `1px solid ${theme.pine}30`,
          borderRadius: theme.radius,
          color: theme.pine,
          cursor: "pointer",
          display: "flex",
          fontSize: 13,
          fontWeight: 600,
          justifyContent: "space-between",
          padding: "13px 18px",
          textAlign: "left",
          width: "100%"
        }}
        type="button"
      >
        <span>View source profiles ({event.sources.length})</span>
        <span>→</span>
      </button>

      {event.audit.length > 0 ? (
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.saffron}28`,
            borderRadius: theme.radius,
            boxShadow: theme.shadow,
            padding: "16px 20px"
          }}
        >
          <Eyebrow color={theme.saffron} theme={theme}>
            Review notes
          </Eyebrow>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 12
            }}
          >
            {event.audit.map((finding, index) => (
              <div
                key={finding.id}
                style={{
                  borderTop: index > 0 ? `1px solid ${theme.border}` : "none",
                  paddingTop: index > 0 ? 10 : 0
                }}
              >
                <Eyebrow color={theme.saffron} theme={theme}>
                  {finding.severity ?? "audit"}
                </Eyebrow>
                <p
                  style={{
                    color: theme.inkMid,
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "5px 0 0"
                  }}
                >
                  {finding.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {event.tags.length > 0 ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Eyebrow color={theme.inkMuted} theme={theme}>
              Tags
            </Eyebrow>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {event.tags.map((tag) => (
              <Tag key={tag} theme={theme}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SourceDrawer({
  onClose,
  open,
  sources,
  theme
}: {
  onClose: () => void;
  open: boolean;
  sources: SourceProfile[];
  theme: Theme;
}) {
  const [expanded, setExpanded] = useState<string | null>(sources[0]?.id ?? null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  return (
    <>
      {open ? (
        <button
          aria-label="Close source profiles"
          onClick={onClose}
          style={{
            background: "rgba(0,0,0,0.28)",
            border: 0,
            cursor: "default",
            inset: 0,
            position: "fixed",
            zIndex: 40
          }}
          type="button"
        />
      ) : null}
      <aside
        aria-modal="true"
        role="dialog"
        style={{
          background: theme.surface,
          borderLeft: `1px solid ${theme.border}`,
          bottom: 0,
          boxShadow: open ? theme.shadowStrong : "none",
          display: "flex",
          flexDirection: "column",
          maxWidth: "92vw",
          overflow: "hidden",
          position: "fixed",
          right: 0,
          top: 0,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s ease",
          width: 340,
          zIndex: 45
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            flexShrink: 0,
            justifyContent: "space-between",
            padding: "18px 22px"
          }}
        >
          <div>
            <Eyebrow theme={theme}>Source context</Eyebrow>
            <div
              style={{
                color: theme.ink,
                fontSize: 15,
                fontWeight: 600,
                marginTop: 4
              }}
            >
              Profiles
            </div>
          </div>
          <button
            aria-label="Close source profiles"
            onClick={onClose}
            style={{
              alignItems: "center",
              background: "none",
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radiusSm,
              color: theme.inkMuted,
              cursor: "pointer",
              display: "flex",
              fontSize: 13,
              height: 30,
              justifyContent: "center",
              width: 30
            }}
            type="button"
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 10,
            overflowY: "auto",
            padding: "14px 22px"
          }}
        >
          {sources.map((source) => (
            <div
              key={source.id}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                overflow: "hidden"
              }}
            >
              <button
                onClick={() =>
                  setExpanded(expanded === source.id ? null : source.id)
                }
                style={{
                  alignItems: "center",
                  background: expanded === source.id ? theme.accentBg : "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  gap: 8,
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  transition: "background 0.15s",
                  width: "100%"
                }}
                type="button"
              >
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      color: theme.ink,
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    {source.name}
                  </div>
                  <div
                    style={{
                      color: theme.inkMuted,
                      fontSize: 10,
                      marginTop: 2
                    }}
                  >
                    {[source.outletType, source.country].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span style={{ color: theme.inkMuted, fontSize: 11 }}>
                  {expanded === source.id ? "▲" : "▼"}
                </span>
              </button>
              {expanded === source.id ? (
                <div
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "4px 14px 14px"
                  }}
                >
                  <SourceFact label="Owner" theme={theme} value={source.ownership} />
                  <SourceFact
                    label="Parent / ultimate owner"
                    theme={theme}
                    value={[source.parentCompany, source.ultimateOwner]
                      .filter(Boolean)
                      .join("; ")}
                  />
                  <SourceFact
                    label="Funding"
                    theme={theme}
                    value={
                      source.funding ??
                      source.knownFunding?.join(", ") ??
                      source.businessModel
                    }
                  />
                  <SourceFact
                    label="Likely framing"
                    theme={theme}
                    value={source.likelyFraming ?? source.editorialProfile}
                  />
                  {source.incentives.length > 0 ? (
                    <div style={{ paddingTop: 10 }}>
                      <div
                        style={{
                          color: theme.inkMuted,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          marginBottom: 6,
                          textTransform: "uppercase"
                        }}
                      >
                        Incentives
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {source.incentives.map((incentive) => (
                          <Tag color={theme.saffron} key={incentive} theme={theme}>
                            {incentive}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {source.url ? (
                    <a
                      href={source.url}
                      rel="noreferrer"
                      style={{
                        color: theme.pine,
                        display: "block",
                        fontSize: 12,
                        fontWeight: 500,
                        paddingTop: 10
                      }}
                      target="_blank"
                    >
                      {source.articleTitle ?? "Open source"} ↗
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function ComparisonList({
  comparisons,
  sources,
  theme
}: {
  comparisons: SourceComparisonItem[];
  sources: SourceProfile[];
  theme: Theme;
}) {
  if (comparisons.length === 0) {
    return (
      <Card theme={theme}>
        <p style={{ color: theme.inkMid, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
          Source comparisons will appear after the event pipeline generates
          claim-level agreement and disagreement.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {comparisons.map((comparison) => (
        <Card accent={theme.saffron} key={comparison.id} theme={theme}>
          <Eyebrow color={theme.saffron} theme={theme}>
            {comparison.agreement ?? "comparison"}
          </Eyebrow>
          <h4
            style={{
              color: theme.ink,
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.45,
              margin: "6px 0"
            }}
          >
            {comparison.summary}
          </h4>
          {comparison.framing ? (
            <p
              style={{
                color: theme.inkMid,
                fontSize: 12,
                lineHeight: 1.6,
                margin: "0 0 8px"
              }}
            >
              {comparison.framing}
            </p>
          ) : null}
          <p style={{ color: theme.inkMuted, fontSize: 10, margin: 0 }}>
            {sourceNamesFromIds(sources, comparison.sourceIds)}
          </p>
        </Card>
      ))}
    </div>
  );
}

function ListSection({
  accent,
  eyebrow,
  items,
  theme,
  title
}: {
  accent: string;
  eyebrow: string;
  items: string[];
  theme: Theme;
  title: string;
}) {
  return (
    <Section eyebrow={eyebrow} theme={theme} title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length > 0 ? (
          items.map((item) => (
            <Card accent={accent} key={item} theme={theme}>
              <div style={{ alignItems: "flex-start", display: "flex", gap: 12 }}>
                <span
                  style={{
                    background: accent,
                    borderRadius: "50%",
                    flexShrink: 0,
                    height: 6,
                    marginTop: 7,
                    width: 6
                  }}
                />
                <p
                  style={{
                    color: theme.inkMid,
                    fontSize: 13,
                    lineHeight: 1.65,
                    margin: 0
                  }}
                >
                  {item}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <Card theme={theme}>
            <p style={{ color: theme.inkMuted, fontSize: 13, margin: 0 }}>
              No generated entries yet.
            </p>
          </Card>
        )}
      </div>
    </Section>
  );
}

function Section({
  children,
  eyebrow,
  theme,
  title
}: {
  children: React.ReactNode;
  eyebrow: string;
  theme: Theme;
  title: string;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Eyebrow color={theme.inkMuted} theme={theme}>
          {eyebrow}
        </Eyebrow>
        <h3
          style={{
            color: theme.ink,
            fontFamily: theme.headingFont,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            margin: 0
          }}
        >
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Card({
  accent,
  children,
  theme
}: {
  accent?: string;
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${accent ? `${accent}28` : theme.border}`,
        borderLeftColor: accent,
        borderLeftWidth: accent ? 3 : 1,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
        padding: "16px 20px"
      }}
    >
      {children}
    </div>
  );
}

function SourceFact({
  label,
  theme,
  value
}: {
  label: string;
  theme: Theme;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div style={{ paddingTop: 10 }}>
      <div
        style={{
          color: theme.inkMuted,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          marginBottom: 3,
          textTransform: "uppercase"
        }}
      >
        {label}
      </div>
      <div style={{ color: theme.inkMid, fontSize: 12, lineHeight: 1.55 }}>
        {value}
      </div>
    </div>
  );
}

function ScoreTile({
  label,
  theme,
  value
}: {
  label: string;
  theme: Theme;
  value?: number;
}) {
  const pct = value === undefined ? undefined : Math.round(value * 100);

  return (
    <div
      style={{
        background: theme.surfaceAlt,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radiusSm,
        flex: 1,
        minWidth: 0,
        padding: "10px 10px"
      }}
    >
      <div
        style={{
          color: theme.inkMuted,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          textTransform: "uppercase",
          whiteSpace: "nowrap"
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: theme.ink,
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: 6
        }}
      >
        {pct === undefined ? "—" : `${pct}%`}
      </div>
      <div
        style={{
          background: theme.border,
          borderRadius: 2,
          height: 3
        }}
      >
        {pct !== undefined ? (
          <div
            style={{
              background: theme.scoreBarColor,
              borderRadius: 2,
              height: "100%",
              width: `${pct}%`
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function Eyebrow({
  children,
  color,
  theme
}: {
  children: React.ReactNode;
  color?: string;
  theme: Theme;
}) {
  return (
    <div
      style={{
        color: color ?? theme.pine,
        fontFamily: theme.bodyFont,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase"
      }}
    >
      {children}
    </div>
  );
}

function Tag({
  children,
  color,
  theme
}: {
  children: React.ReactNode;
  color?: string;
  theme: Theme;
}) {
  const tagColor = color ?? theme.pine;

  return (
    <span
      style={{
        background: `${tagColor}12`,
        border: `1px solid ${tagColor}35`,
        borderRadius: 20,
        color: tagColor,
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.05em",
        padding: "3px 9px",
        textTransform: "uppercase"
      }}
    >
      {children}
    </span>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function sourceNames(event: EventBrief, sourceIds: string[]) {
  return sourceNamesFromIds(event.sources, sourceIds);
}

function sourceNamesFromIds(sources: SourceProfile[], sourceIds: string[]) {
  const names = sourceIds
    .map((sourceId) => sources.find((source) => source.id === sourceId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(" · ") : "Sources not linked yet";
}

function timeAgo(value?: string) {
  if (!value) {
    return "Time not supplied";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);

  if (hours < 1) {
    return "Just now";
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Date not supplied";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
