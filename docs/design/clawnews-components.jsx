// ClawNews UI Components — exported to window for use in main HTML

// ============================================================
// MOCK DATA
// ============================================================

const CN_SOURCES = [
  { id: 's1', name: 'Reuters', outletType: 'Wire service', ownership: 'Thomson Reuters Corp.', funding: 'Subscription + licensing', incentives: ['Speed over depth', 'Global reach'], editorialProfile: 'Neutral wire service', country: 'UK', url: '#', articleTitle: 'Senate Passes AI Bill in Historic Vote', publishedAt: '2026-04-26T07:40:00Z' },
  { id: 's2', name: 'Washington Post', outletType: 'Newspaper', ownership: 'Jeff Bezos (private)', funding: 'Subscription + advertising', incentives: ['Tech-adjacent ownership', 'DC establishment audience'], editorialProfile: 'Center-left', country: 'US', url: '#', articleTitle: 'AI Accountability Act Passes Senate 68–32', publishedAt: '2026-04-26T08:10:00Z' },
  { id: 's3', name: 'Wall Street Journal', outletType: 'Newspaper', ownership: 'News Corp / Murdoch', funding: 'Subscription + advertising', incentives: ['Business-friendly framing', 'Conservative ownership'], editorialProfile: 'Center-right / business', country: 'US', url: '#', articleTitle: 'AI Vote: What It Means for Tech', publishedAt: '2026-04-26T08:45:00Z' },
  { id: 's4', name: 'MIT Technology Review', outletType: 'Trade publication', ownership: 'MIT (non-profit)', funding: 'MIT endowment + subscriptions', incentives: ['Tech optimism bias', 'Academic credibility'], editorialProfile: 'Pro-innovation', country: 'US', url: '#', articleTitle: 'The Technical Reality Behind the AI Bill', publishedAt: '2026-04-26T09:00:00Z' },
];

const CN_EVENT = {
  id: 'evt-1', slug: 'senate-ai-2026',
  title: 'Senate Passes Sweeping AI Regulation Bill 68–32',
  kicker: 'AI Policy', status: 'Developing',
  summary: 'The Senate voted 68–32 to pass the AI Accountability Act, mandating federal review of high-risk AI systems before public deployment. The legislation creates a new Office of AI Safety within the Commerce Department and requires algorithmic audits for hiring and lending tools.',
  location: 'Washington D.C.',
  happenedAt: '2026-04-26T07:40:00Z', updatedAt: '2026-04-26T09:15:00Z',
  convergenceScore: 0.72, disagreementScore: 0.41, evidenceQualityScore: 0.85,
  impact: 'First major federal AI legislation in US history. Creates compliance precedent with international implications for AI governance.',
  tags: ['AI', 'Senate', 'Tech Policy', 'Regulation'],
  whatChanged: [
    'Final vote tally confirmed at 68–32, higher than projected.',
    'White House issued full support statement within 2 hours.',
    'Tech lobby signalled legal challenge to audit provisions.',
  ],
  agreedFacts: [
    'Bill passed 68–32 with bipartisan support.',
    'Legislation requires federal review before deployment of high-risk AI.',
    'New Office of AI Safety will be created within Commerce Dept.',
  ],
  claims: [
    { id: 'c1', label: 'AI Policy', text: 'The bill is designed to protect consumers from automated discrimination in hiring and lending decisions.', sourceIds: ['s1', 's2'], confidence: 0.88 },
    { id: 'c2', label: 'AI Policy', text: 'Audit requirements could cost large firms $10–50M annually; smaller companies may face a proportionally higher burden.', sourceIds: ['s3'], confidence: 0.65 },
    { id: 'c3', label: 'AI Policy', text: 'The House is expected to vote within three weeks. White House has signalled intent to sign into law.', sourceIds: ['s1', 's4'], confidence: 0.79 },
  ],
  disagreements: [
    { id: 'd1', point: 'Economic impact of audit requirements', positions: ['Reuters/WaPo frame audits as necessary consumer-protection cost', 'WSJ frames the same audits as an innovation-killing compliance burden'] },
    { id: 'd2', point: 'Scope of the "high-risk" AI definition', positions: ['MIT Tech Review: definition too narrow, misses frontier models', 'WSJ: definition too broad, sweeps in benign automation tools'] },
  ],
  sourceComparisons: [
    { id: 'sc1', summary: 'Reuters and WaPo strongly agree on procedural facts', agreement: 'Strong agreement', framing: 'Both frame the bill as consumer protection. Shared sourcing from Senate floor.', evidence: ['Same vote count cited', 'Shared White House quotes', 'Identical procedural timeline'], sourceIds: ['s1', 's2'], confidence: 0.92 },
    { id: 'sc2', summary: 'WSJ diverges sharply on business impact framing', agreement: 'Framing divergence', framing: 'WSJ leads with industry opposition; others lead with legislative milestone.', evidence: ['WSJ quotes tech lobby more prominently', 'Different cost estimate sourcing', 'Headline framing diverges'], sourceIds: ['s2', 's3'], confidence: 0.78 },
  ],
  stakeholders: [
    { id: 'sh1', name: 'Senate Commerce Committee', role: 'Legislator', position: 'Authored and advanced the bill through committee.', interest: 'Establishing regulatory authority over AI.' },
    { id: 'sh2', name: 'Tech Industry Coalition', role: 'Lobbyist', position: 'Opposed audit provisions; signalled legal challenge.', interest: 'Minimise compliance costs and preserve deployment speed.', fundingOrBackers: 'Big Tech PACs' },
    { id: 'sh3', name: 'Consumer Advocacy Groups', role: 'Civil society', position: 'Supported bill but want lower audit thresholds.', interest: 'Protect individuals from algorithmic discrimination.' },
  ],
  timeline: [
    { id: 't1', label: 'Bill introduced', time: '2026-02-14T00:00:00Z', text: 'AI Accountability Act introduced by bipartisan group of 12 senators.' },
    { id: 't2', label: 'Committee vote', time: '2026-03-28T00:00:00Z', text: 'Senate Commerce Committee advanced bill 18–4.' },
    { id: 't3', label: 'Senate floor vote', time: '2026-04-26T07:40:00Z', text: 'Full Senate passed 68–32. White House signals intent to sign.' },
  ],
  audit: [
    { id: 'a1', severity: 'note', summary: 'WSJ cost estimates rely on anonymous industry sources. Confidence on the $10–50M figure is moderate.', confidence: 0.62, recommendedReview: true },
    { id: 'a2', severity: 'low', summary: 'House vote timeline (3 weeks) is a projection, not a confirmed schedule.', confidence: 0.70 },
  ],
  sources: CN_SOURCES,
};

const CN_SECONDARY = [
  { id: 'evt-2', title: 'Climate Summit Reaches Historic Emissions Agreement', kicker: 'Climate', status: 'Resolved', summary: '190 countries agreed to cut emissions 45% by 2035, backed by a $500B green transition fund for developing nations.', location: 'Geneva', happenedAt: '2026-04-25T09:00:00Z', updatedAt: '2026-04-25T18:00:00Z', convergenceScore: 0.88, disagreementScore: 0.22, evidenceQualityScore: 0.91, sources: [CN_SOURCES[0], CN_SOURCES[1]], tags: ['Climate', 'UN', 'Emissions'],
    whatChanged: ['Final communiqué signed by all 190 delegations.', '$500B fund structure confirmed with IMF oversight.'],
    agreedFacts: ['190 countries signed the agreement.', 'Emissions target set at 45% reduction by 2035.', '$500B green transition fund established for developing nations.'],
    disagreements: [{ id: 'd1', point: 'Enforceability of commitments', positions: ['Reuters: binding targets with penalty mechanism', 'Several delegations: targets are aspirational, not legally binding'] }],
    claims: [] },
  { id: 'evt-3', title: 'MIT Battery Charges to 80% in Under Four Minutes', kicker: 'Science', status: 'Emerging', summary: 'Solid-state prototype maintains 90% capacity after 5,000 cycles; mass production eyed for 2028.', location: 'Cambridge, MA', happenedAt: '2026-04-25T14:00:00Z', updatedAt: '2026-04-25T16:30:00Z', convergenceScore: 0.94, disagreementScore: 0.08, evidenceQualityScore: 0.96, sources: [CN_SOURCES[3]], tags: ['Battery', 'EV', 'MIT'],
    whatChanged: ['Pre-print published on arXiv.', 'Independent lab replication attempts underway.'],
    agreedFacts: ['Prototype reaches 80% charge in under 4 minutes.', '90%+ capacity retained after 5,000 cycles.', 'Uses lithium-ceramic anode.'],
    disagreements: [{ id: 'd1', point: 'Timeline to mass production', positions: ['MIT team: 2028 is realistic', 'Industry analysts: manufacturing scale-up likely pushes to 2030+'] }],
    claims: [] },
];

// ============================================================
// THEMES
// ============================================================

const CN_THEMES = {
  editorial: {
    key: 'editorial', label: 'Editorial',
    bg: '#f6f8f5', surface: '#ffffff', surfaceAlt: '#eef2ee',
    ink: '#14201d', inkMid: 'rgba(20,32,29,0.72)', inkMuted: 'rgba(20,32,29,0.44)',
    border: 'rgba(20,32,29,0.09)', borderMid: 'rgba(20,32,29,0.16)',
    pine: '#0f766e', saffron: '#a16207', poppy: '#b42318', tidal: '#1d4ed8',
    radius: '10px', radiusSm: '6px',
    headingFont: 'Georgia, "Times New Roman", serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    shadow: '0 1px 3px rgba(16,24,40,0.05), 0 6px 20px rgba(16,24,40,0.07)',
    shadowStrong: '0 4px 6px rgba(16,24,40,0.04), 0 16px 40px rgba(16,24,40,0.12)',
    scoreBarColor: '#0f766e', accentBg: 'rgba(15,118,110,0.07)',
    headerBg: 'rgba(246,248,245,0.92)',
  },
  analytical: {
    key: 'analytical', label: 'Analytical',
    bg: '#edf2f8', surface: '#ffffff', surfaceAlt: '#e2eaf4',
    ink: '#0f1e3c', inkMid: 'rgba(15,30,60,0.70)', inkMuted: 'rgba(15,30,60,0.44)',
    border: 'rgba(15,30,60,0.09)', borderMid: 'rgba(15,30,60,0.16)',
    pine: '#0369a1', saffron: '#c2410c', poppy: '#be123c', tidal: '#2563eb',
    radius: '6px', radiusSm: '4px',
    headingFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    shadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.07)',
    shadowStrong: '0 2px 4px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.11)',
    scoreBarColor: '#0369a1', accentBg: 'rgba(3,105,161,0.08)',
    headerBg: 'rgba(237,242,248,0.94)',
  },
  dark: {
    key: 'dark', label: 'Dark',
    bg: '#0c1a17', surface: '#152620', surfaceAlt: '#1c3028',
    ink: '#dff0e8', inkMid: 'rgba(223,240,232,0.70)', inkMuted: 'rgba(223,240,232,0.40)',
    border: 'rgba(223,240,232,0.09)', borderMid: 'rgba(223,240,232,0.18)',
    pine: '#34d399', saffron: '#fbbf24', poppy: '#f87171', tidal: '#60a5fa',
    radius: '12px', radiusSm: '8px',
    headingFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    shadow: '0 4px 20px rgba(0,0,0,0.28)',
    shadowStrong: '0 8px 40px rgba(0,0,0,0.44)',
    scoreBarColor: '#34d399', accentBg: 'rgba(52,211,153,0.09)',
    headerBg: 'rgba(12,26,23,0.94)',
  },
};

// ============================================================
// UTILS
// ============================================================

function cnTimeAgo(str) {
  if (!str) return '';
  const h = Math.floor((Date.now() - new Date(str).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function cnFmtPct(v) { return v == null ? '—' : `${Math.round(v * 100)}%`; }

function cnFmtDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================
// ATOMS
// ============================================================

function CnEyebrow({ t, children, color }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: color || t.pine, fontFamily: t.bodyFont }}>
      {children}
    </div>
  );
}

function CnTag({ t, children, color }) {
  const c = color || t.pine;
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 20, border: `1px solid ${c}35`, background: `${c}12`, color: c, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}

const CN_SCORE_DESC = {
  'Convergence': 'How much sources agree on stated facts',
  'Disagreement': 'How much sources conflict on claims or framing',
  'Evidence': 'How well-sourced and verifiable the reporting is',
};

function cnScoreRating(label, pct) {
  if (pct == null) return { label: '—', color: null };
  if (label === 'Convergence') {
    if (pct >= 70) return { label: 'High', color: 'pine', note: 'Most sources corroborate the core facts' };
    if (pct >= 40) return { label: 'Moderate', color: 'saffron', note: 'Partial agreement across sources' };
    return { label: 'Low', color: 'poppy', note: 'Sources diverge significantly on the facts' };
  }
  if (label === 'Disagreement') {
    if (pct >= 60) return { label: 'Polarising', color: 'poppy', note: 'Heavy conflict across sources' };
    if (pct >= 30) return { label: 'Contested', color: 'saffron', note: 'Some meaningful disputes in the coverage' };
    return { label: 'Low', color: 'pine', note: 'Sources are largely aligned' };
  }
  if (label === 'Evidence') {
    if (pct >= 75) return { label: 'Strong', color: 'pine', note: 'Diverse sources with primary citations' };
    if (pct >= 45) return { label: 'Moderate', color: 'saffron', note: 'Mix of primary and secondary sourcing' };
    return { label: 'Weak', color: 'poppy', note: 'Thin sourcing or heavy reliance on secondaries' };
  }
  return { label: `${pct}%`, color: null, note: '' };
}

function CnScoreTile({ t, label, value }) {
  const pct = value != null ? Math.round(value * 100) : null;
  const desc = CN_SCORE_DESC[label] || '';
  const rating = cnScoreRating(label, pct);
  const ratingColor = rating.color ? t[rating.color] : t.inkMuted;
  return (
    <div style={{ flex: 1, minWidth: 0, background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: t.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: ratingColor, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{rating.label}</div>
        {pct != null && <div style={{ fontSize: 9, color: t.inkMuted, fontWeight: 500, flexShrink: 0 }}>{pct}%</div>}
      </div>
      <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
        {pct != null && <div style={{ height: '100%', width: `${pct}%`, background: ratingColor, borderRadius: 2, opacity: 0.7 }} />}
      </div>
      <div style={{ fontSize: 8, color: t.inkMuted, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{rating.note || desc}</div>
    </div>
  );
}

function CnCard({ t, children, accent, style = {} }) {
  const base = { background: t.surface, border: `1px solid ${accent ? accent + '28' : t.border}`, borderRadius: t.radius, padding: '16px 20px', boxShadow: t.shadow };
  if (accent) base.borderLeftWidth = 3, base.borderLeftColor = accent;
  return <div style={{ ...base, ...style }}>{children}</div>;
}

// ============================================================
// HEADER
// ============================================================

function CnHeader({ t, view, onBack, isMobile }) {
  return (
    <header style={{ position: isMobile ? 'relative' : 'sticky', top: 0, zIndex: 50, background: t.headerBg, backdropFilter: 'blur(14px)', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {view === 'home' ? (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.ink, letterSpacing: '-0.02em', fontFamily: t.headingFont }}>Clawnews</div>
            <div style={{ fontSize: 10, color: t.inkMuted, marginTop: 1 }}>{cnFmtDate(CN_EVENT.updatedAt)}</div>
          </div>
        ) : (
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, color: t.ink, cursor: 'pointer', padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
            ← Back
          </button>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: t.accentBg, border: `1px solid ${t.pine}28`, color: t.pine, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {view === 'home' ? 'Daily Brief' : CN_EVENT.status}
        </span>
      </div>
    </header>
  );
}

// ============================================================
// HOME — EVENT CARD
// ============================================================

function CnEventCard({ t, event, onClick, isLead }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: t.surface, border: `1px solid ${hovered ? t.pine + '50' : t.border}`, borderRadius: t.radius, boxShadow: hovered ? t.shadowStrong : t.shadow, padding: isLead ? '20px 18px' : '16px 16px', display: 'flex', flexDirection: 'column', gap: isLead ? 14 : 10, transition: 'box-shadow 0.2s, border-color 0.2s', minWidth: 0, overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            {event.kicker && <CnEyebrow t={t}>{event.kicker}</CnEyebrow>}
            {event.status && <CnEyebrow t={t} color={t.pine}>{event.status}</CnEyebrow>}
          </div>
          <h2 style={{ fontFamily: isLead ? t.headingFont : t.bodyFont, fontSize: isLead ? 20 : 14, fontWeight: isLead ? 700 : 600, lineHeight: 1.35, color: t.ink, margin: 0 }}>
            {event.title}
          </h2>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: t.radiusSm, background: t.accentBg, border: `1px solid ${t.pine}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: t.pine, fontSize: 14 }}>◉</div>
      </div>

      <p style={{ fontSize: isLead ? 14 : 12, lineHeight: 1.75, color: t.inkMid, margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>{event.summary}</p>

      {isLead && (
        <div style={{ display: 'flex', gap: 8 }}>
          <CnScoreTile t={t} label="Convergence" value={event.convergenceScore} />
          <CnScoreTile t={t} label="Disagreement" value={event.disagreementScore} />
          <CnScoreTile t={t} label="Evidence" value={event.evidenceQualityScore} />
        </div>
      )}

      {isLead && event.agreedFacts && event.agreedFacts.length > 0 && (
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
          <CnEyebrow t={t} color={t.pine}>Sources agree</CnEyebrow>
          <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {event.agreedFacts.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: t.inkMid, lineHeight: 1.6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.pine, flexShrink: 0, marginTop: 7 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLead && event.disagreements && event.disagreements.length > 0 && (
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
          <CnEyebrow t={t} color={t.saffron}>Contested</CnEyebrow>
          <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {event.disagreements.map((d, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: t.inkMid, lineHeight: 1.6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.saffron, flexShrink: 0, marginTop: 7 }} />
                {d.point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: t.inkMuted }}>
          <span>{cnTimeAgo(event.updatedAt || event.happenedAt)}</span>
          {event.location && <span>{event.location}</span>}
          <span>{event.sources.length} source{event.sources.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {isLead && event.tags && event.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {event.tags.slice(0, 4).map(tag => <CnTag key={tag} t={t}>{tag}</CnTag>)}
        </div>
      )}

      {isLead && event.whatChanged && event.whatChanged.length > 0 && (
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
          <CnEyebrow t={t} color={t.inkMuted}>What changed</CnEyebrow>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {event.whatChanged.slice(0, 2).map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: t.inkMid, lineHeight: 1.65 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.saffron, flexShrink: 0, marginTop: 8 }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: isLead ? '10px 20px' : '7px 14px', borderRadius: t.radiusSm, background: t.ink, color: t.key === 'dark' ? t.bg : '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', transition: 'opacity 0.15s' }}>
        Open event <span>→</span>
      </button>
    </article>
  );
}

// ============================================================
// HOME VIEW
// ============================================================

function CnHomeView({ t, onOpenEvent, isMobile }) {
  const totalSources = CN_EVENT.sources.length + CN_SECONDARY.reduce((a, e) => a + e.sources.length, 0);
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '20px 16px 56px' : '28px 28px 64px', overflowX: 'hidden' }}>
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 10, fontWeight: 700, color: t.pine, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          <span>{3} events</span>
          <span style={{ color: t.inkMuted }}>/</span>
          <span>{totalSources} sources</span>
        </div>
        <h1 style={{ fontFamily: t.headingFont, fontSize: isMobile ? 28 : 38, fontWeight: 700, color: t.ink, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Daily Brief</h1>
        <p style={{ fontSize: 14, color: t.inkMid, lineHeight: 1.7, maxWidth: '100%', margin: 0, overflowWrap: 'break-word' }}>What happened, who's making claims, and what sources are incentivised to say.</p>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CnEventCard t={t} event={CN_EVENT} onClick={onOpenEvent} isLead={true} />
          {CN_SECONDARY.map(ev => <CnEventCard key={ev.id} t={t} event={ev} onClick={onOpenEvent} isLead={true} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <CnEventCard t={t} event={CN_EVENT} onClick={onOpenEvent} isLead={true} />
          {CN_SECONDARY.map(ev => <CnEventCard key={ev.id} t={t} event={ev} onClick={onOpenEvent} isLead={true} />)}
        </div>
      )}
    </main>
  );
}

// ============================================================
// SOURCE DRAWER
// ============================================================

function CnSourceDrawer({ t, open, onClose, sources }) {
  const [expanded, setExpanded] = React.useState(null);
  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 40 }} />}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: open ? 340 : 0, overflow: 'hidden', background: t.surface, borderLeft: `1px solid ${t.border}`, zIndex: 45, transition: 'width 0.28s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <CnEyebrow t={t}>Source context</CnEyebrow>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.ink, marginTop: 4 }}>Profiles</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, color: t.inkMuted, cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sources.map(src => (
            <div key={src.id} style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
              <button onClick={() => setExpanded(expanded === src.id ? null : src.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: expanded === src.id ? t.accentBg : 'none', border: 'none', cursor: 'pointer', gap: 8, transition: 'background 0.15s' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{src.name}</div>
                  <div style={{ fontSize: 10, color: t.inkMuted, marginTop: 2 }}>{src.outletType} · {src.country}</div>
                </div>
                <span style={{ color: t.inkMuted, fontSize: 11 }}>{expanded === src.id ? '▲' : '▼'}</span>
              </button>
              {expanded === src.id && (
                <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${t.border}`, overflow: 'hidden', minWidth: 0 }}>
                  {[['Ownership', src.ownership], ['Funding', src.funding], ['Editorial profile', src.editorialProfile]].map(([label, val]) => val ? (
                    <div key={label} style={{ paddingTop: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.inkMuted, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 12, color: t.inkMid, lineHeight: 1.55, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{val}</div>
                    </div>
                  ) : null)}
                  {src.incentives && src.incentives.length > 0 && (
                    <div style={{ paddingTop: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.inkMuted, marginBottom: 6 }}>Incentives</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, overflow: 'hidden' }}>
                        {src.incentives.map(inc => (
                          <span key={inc} style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 4, border: `1px solid ${t.saffron}35`, background: `${t.saffron}12`, color: t.saffron, fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%' }}>
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {src.articleTitle && <a href="#" style={{ fontSize: 12, color: t.pine, fontWeight: 500, display: 'block', paddingTop: 10, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{src.articleTitle} ↗</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================
// EVENT DETAIL
// ============================================================

function CnSection({ t, eyebrow, title, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <CnEyebrow t={t} color={t.pine}>{eyebrow}</CnEyebrow>
        <h3 style={{ fontFamily: t.headingFont, fontSize: 17, fontWeight: 700, color: t.ink, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </section>
  );
}

function CnEventDetailView({ t, event, onOpenSources, isMobile }) {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '20px 16px 64px' : '28px 28px 80px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          {event.kicker && <CnEyebrow t={t}>{event.kicker}</CnEyebrow>}
          {event.location && <><span style={{ color: t.inkMuted, fontSize: 10 }}>/</span><CnEyebrow t={t} color={t.inkMuted}>{event.location}</CnEyebrow></>}
        </div>
        <h1 style={{ fontFamily: t.headingFont, fontSize: isMobile ? 24 : 34, fontWeight: 700, color: t.ink, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 14px' }}>{event.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: t.inkMid, margin: '0 0 16px', maxWidth: 600 }}>{event.summary}</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: t.inkMuted }}>
          <span>Updated {cnFmtDate(event.updatedAt)}</span>
          {event.location && <span>{event.location}</span>}
          <span>{event.sources.length} sources</span>
        </div>
      </div>

      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1.35fr 0.65fr', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <CnSection t={t} eyebrow="Signal quality" title="Brief scores">
            <p style={{ fontSize: 12, color: t.inkMuted, lineHeight: 1.6, margin: '0 0 12px' }}>
              These signals are independent — high convergence means sources agree on facts, while contested disagreement means they dispute framing or interpretation. Both can be true simultaneously.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <CnScoreTile t={t} label="Convergence" value={event.convergenceScore} />
              <CnScoreTile t={t} label="Disagreement" value={event.disagreementScore} />
              <CnScoreTile t={t} label="Evidence" value={event.evidenceQualityScore} />
            </div>
          </CnSection>

          <CnSection t={t} eyebrow="Latest movement" title="What changed">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.whatChanged.map((c, i) => (
                <CnCard key={i} t={t} accent={t.pine}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: t.pine, flexShrink: 0, marginTop: 1, fontSize: 13 }}>✓</span>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: t.inkMid, margin: 0 }}>{c}</p>
                  </div>
                </CnCard>
              ))}
            </div>
          </CnSection>

          <CnSection t={t} eyebrow="Agreement" title="Where sources agree">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.agreedFacts.map((f, i) => (
                <CnCard key={i} t={t} accent={t.pine}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: t.pine, flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: t.pine, marginTop: 7, display: 'block' }} />
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: t.inkMid, margin: 0 }}>{f}</p>
                  </div>
                </CnCard>
              ))}
            </div>
          </CnSection>

          <CnSection t={t} eyebrow="Claims" title="Who says what">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.claims.map(claim => (
                <CnCard key={claim.id} t={t} accent={t.tidal}>
                  {claim.label && <div style={{ marginBottom: 6 }}><CnEyebrow t={t} color={t.ink}>{claim.label}</CnEyebrow></div>}
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: t.inkMid, margin: 0 }}>{claim.text}</p>
                  <p style={{ fontSize: 10, color: t.inkMuted, margin: '8px 0 0', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {claim.sourceIds.map(id => event.sources.find(s => s.id === id)?.name).filter(Boolean).join(' · ')}
                  </p>
                </CnCard>
              ))}
            </div>
          </CnSection>

          <CnSection t={t} eyebrow="Open points" title="Where sources disagree">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.disagreements.map(d => (
                <CnCard key={d.id} t={t} accent={t.poppy}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: t.ink, margin: '0 0 10px' }}>{d.point}</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {d.positions.map((p, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.65, color: t.inkMid }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.poppy, flexShrink: 0, marginTop: 9 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CnCard>
              ))}
            </div>
          </CnSection>

          <CnSection t={t} eyebrow="Sequence" title="Timeline">
            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: t.border }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {event.timeline.map((item, i) => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -19, top: 4, width: 8, height: 8, borderRadius: '50%', background: i === event.timeline.length - 1 ? t.pine : t.surfaceAlt, border: `2px solid ${i === event.timeline.length - 1 ? t.pine : t.borderMid}` }} />
                    <CnEyebrow t={t} color={t.pine}>{item.label}</CnEyebrow>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: t.inkMid, margin: '5px 0 2px' }}>{item.text}</p>
                    <p style={{ fontSize: 10, color: t.inkMuted }}>{cnFmtDate(item.time)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CnSection>
        </div>

        {/* Aside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: isMobile ? 28 : 0 }}>
          {event.impact && (
            <div style={{ background: t.ink, borderRadius: t.radius, padding: '20px 22px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.key === 'dark' ? t.bg + '90' : 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Why it matters</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: t.key === 'dark' ? t.bg + 'cc' : 'rgba(255,255,255,0.84)' }}>{event.impact}</p>
            </div>
          )}

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '18px 22px', boxShadow: t.shadow }}>
            <CnEyebrow t={t}>Brief state</CnEyebrow>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '14px 0 0' }}>
              {[['Claims', event.claims.length], ['Open points', event.disagreements.length], ['Stakeholders', event.stakeholders.length], ['Updates', event.whatChanged.length]].map(([label, val]) => (
                <div key={label}>
                  <dt style={{ fontSize: 10, color: t.inkMuted, fontWeight: 500 }}>{label}</dt>
                  <dd style={{ fontSize: 28, fontWeight: 700, color: t.ink, margin: '3px 0 0', lineHeight: 1 }}>{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          <button onClick={onOpenSources} style={{ width: '100%', padding: '13px 18px', background: t.accentBg, border: `1px solid ${t.pine}30`, borderRadius: t.radius, color: t.pine, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>View source profiles ({event.sources.length})</span>
            <span>→</span>
          </button>

          {event.tags && event.tags.length > 0 && (
            <div>
              <div style={{ marginBottom: 8 }}><CnEyebrow t={t} color={t.inkMuted}>Tags</CnEyebrow></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{event.tags.map(tag => <CnTag key={tag} t={t}>{tag}</CnTag>)}</div>
            </div>
          )}

          {event.audit && event.audit.length > 0 && (
            <div style={{ background: t.surface, border: `1px solid ${t.saffron}28`, borderRadius: t.radius, padding: '16px 20px', boxShadow: t.shadow }}>
              <CnEyebrow t={t} color={t.saffron}>Review notes</CnEyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {event.audit.map((a, i) => (
                  <div key={a.id} style={{ paddingTop: i > 0 ? 10 : 0, borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                    <CnEyebrow t={t} color={t.saffron}>{a.severity}</CnEyebrow>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: t.inkMid, margin: '5px 0 0' }}>{a.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function ClawNewsApp({ theme, isMobile }) {
  const [view, setView] = React.useState('home');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const t = CN_THEMES[theme] || CN_THEMES.editorial;

  const handleBack = () => { setView('home'); setDrawerOpen(false); };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg, fontFamily: t.bodyFont, color: t.ink }}>
      <CnHeader t={t} view={view} onBack={handleBack} isMobile={isMobile} />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {view === 'home'
          ? <CnHomeView t={t} onOpenEvent={() => setView('event')} isMobile={isMobile} />
          : <CnEventDetailView t={t} event={CN_EVENT} onOpenSources={() => setDrawerOpen(true)} isMobile={isMobile} />
        }
      </div>
      <CnSourceDrawer t={t} open={drawerOpen} onClose={() => setDrawerOpen(false)} sources={CN_EVENT.sources} />
    </div>
  );
}

Object.assign(window, { ClawNewsApp, CN_THEMES });
