# clawnews

clawnews is a phone-first PWA for source-transparent news intelligence. It reads RSS feeds, normalizes article records, groups related coverage into real-world events, and renders a Daily Brief with convergence, disagreement, stakeholder incentives, source ownership/funding notes, confidence labels, and raw article links.

The goal is not to decide what readers must believe. The goal is to make the evidence trail easier to inspect.

## What It Is

- A multi-source event brief reader.
- A lightweight intelligence layer over RSS and source metadata.
- A place to compare claims, disagreements, stakeholders, incentives, and source context.
- A PWA intended to feel good on a phone first, then scale up to desktop.

## What It Is Not

- Not a breaking-news wire or social feed.
- Not a replacement for original reporting.
- Not a truth oracle, fact-checking authority, or political ranking engine.
- Not a tool for hiding sources behind AI summaries.
- Not a chatbot, Telegram-first product, or ClawHub surface.
- Not legal, financial, medical, or safety advice.

## ZeroClaw Role

ZeroClaw is treated as helper/runtime infrastructure, not the editorial source of truth. It may assist with feed execution, clustering, extraction, enrichment, scheduled jobs, caching, or local runtime tasks, depending on the implementation path. ClawNews owns the product contract: cited source inputs, event brief schema, transparency rules, policy text, and user-facing presentation.

See [docs/zeroclaw-integration.md](docs/zeroclaw-integration.md) for the boundary.

## Local Setup

Expected runtime: Node.js `>=18.17.0`.

```sh
npm install
npm run dev
npm run ingest:rss
npm run generate:brief
npm run build
npm test
```

Useful validation commands:

```sh
npm run typecheck
npm run lint
npm run zeroclaw:mock --workspace @clawnews/core
```

`npm run ingest:rss` reads `data/feeds.seed.json` and writes `artifacts/articles.latest.json`. The seed RSS URLs are placeholders, so the worker falls back to `data/sample_articles.json` when those feeds fail.

`npm run generate:brief` reads the latest article artifact when present, falls back to sample articles when needed, and writes `artifacts/sample-event.json` plus `artifacts/sample-brief.md`.

## Phone Install

Once the web app is running:

1. Run `npm --workspace apps/web run dev -- --hostname 0.0.0.0`.
2. Open `http://<your-computer-lan-ip>:3000` on a phone connected to the same network.
3. On iOS Safari, tap Share, then Add to Home Screen.
4. On Android Chrome, open the browser menu, then Install app or Add to Home screen.
5. Launch from the home-screen icon to verify standalone PWA behavior.

The MVP should be usable as a normal browser page even before full install prompts, service worker caching, or offline behavior are complete.

## Hosted Preview

Corporate and campus Wi-Fi often block device-to-device traffic, so a phone may not be able to reach `http://<your-computer-lan-ip>:3000` even when the Mac is serving correctly. For phone testing, deploy a hosted preview and open the HTTPS URL on the phone.

The repo includes `vercel.json` for a root-level Vercel deployment:

```sh
npm install
npm run build
```

Recommended Vercel settings:

- Project root: repository root.
- Install command: `npm install`.
- Build command: `npm run build`.
- Output directory: `apps/web/.next`.
- Framework preset: Next.js.

The hosted preview renders the generated artifact at `artifacts/sample-event.json`. Run `npm run ingest:rss` and `npm run generate:brief` before deploying when you want the preview artifact refreshed.

## Design References

The current PWA uses the analytical theme from the redesign exploration. The original standalone canvas files are kept in `docs/design/` for reference:

- `docs/design/ClawNews-Redesign.html`
- `docs/design/clawnews-components.jsx`
- `docs/design/tweaks-panel.jsx`

## MVP Status

This repo now has a first vertical slice:

- RSS ingestion into normalized article records with sample fallback.
- Event generation across multiple sources with convergence, disagreement, evidence, and audit scores.
- Seed source profiles with ownership/funding fields and confidence labels.
- Mock ZeroClaw job contracts and local runner.
- A phone-first PWA reader for browsing a Daily Brief and inspecting event details.
- Clear policy language around citations, uncertainty, and source handling.

See [docs/product-spec.md](docs/product-spec.md) and [docs/architecture.md](docs/architecture.md).

## What Is Mocked

- The seed event uses fictional sources and `example.org` article links.
- RSS feeds are placeholder URLs and intentionally demonstrate fallback behavior.
- ZeroClaw execution is represented by local contracts and a mock runner.
- Claim extraction and source enrichment are seeded/simple; real verification and provenance should come next.

## Next Steps

- Replace placeholder feeds with real RSS feeds and source-profile provenance.
- Add a real source-enrichment workflow with citations for ownership and funding claims.
- Persist event history so "what changed" compares against the previous generated brief.
- Wire real ZeroClaw scheduled execution behind the existing job contracts.
- Add browser-level PWA tests for install metadata and mobile layout.

## Docs

- [Product spec](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [ZeroClaw integration](docs/zeroclaw-integration.md)
- [Source transparency policy](docs/source-transparency-policy.md)
