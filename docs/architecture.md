# Architecture

## Overview

ClawNews is organized as a small workspace with a web app, a core news pipeline, and generated or fixture data. The architecture should keep editorial policy and data contracts explicit so the UI never has to guess where a claim came from.

Expected workspace shape:

- `apps/web`: phone-first PWA reader.
- `packages/core`: RSS ingestion, normalization, clustering, enrichment, brief generation, and shared types.
- `docs`: product, architecture, integration, and policy notes.
- `data` or `artifacts`: local fixtures, generated briefs, and pipeline outputs when those slices land.

## Data Flow

1. Feed list defines RSS sources and source metadata keys.
2. RSS ingestion fetches feed items.
3. Normalization creates article records with stable IDs, source IDs, timestamps, URLs, titles, summaries, and extracted text when available.
4. Deduplication merges repeated wire copies or identical URLs.
5. Clustering groups articles into candidate real-world events.
6. Brief generation extracts claims, disagreements, stakeholders, incentives, uncertainty notes, and update deltas.
7. Source enrichment attaches ownership, funding, affiliation, and known context.
8. The PWA renders event briefs and source cards.

## Package Boundaries

`packages/core` should own:

- Shared TypeScript types.
- RSS fetch and parse helpers.
- Article normalization.
- Clustering logic.
- Source metadata lookup.
- Brief generation and validation.
- Serialization of generated artifacts.

`apps/web` should own:

- Routes and PWA shell.
- Brief list and detail views.
- Source cards and citation UI.
- Install metadata, manifest, icons, and service worker behavior.
- Client-side presentation state.

Docs should own:

- Product requirements.
- Architecture and integration contracts.
- Transparency policy.
- Human-readable operating assumptions.

## Data Contracts

The core package should expose typed records similar to:

- `Source`: stable ID, name, URL, feed URL, country or region, ownership, funding, affiliations, notes, metadata status.
- `Article`: stable ID, source ID, URL, title, author, published time, fetched time, summary, content hash, language.
- `EventCluster`: stable ID, article IDs, event title, time range, entities, topics, cluster rationale.
- `EventBrief`: stable ID, cluster ID, summary, claims, agreements, disagreements, stakeholders, source notes, uncertainty notes, generated time, previous brief ID.

The UI should render only validated brief data. Unknown fields should remain visible as unknown where relevant instead of being omitted in ways that imply certainty.

## Persistence

For the vertical slice, file-based JSON artifacts are enough. A database can come later if ingestion volume, history queries, or multi-user features require it.

Recommended early artifacts:

- Normalized articles.
- Source metadata fixtures.
- Event clusters.
- Generated event briefs.

## Testing Strategy

- Unit tests for normalization, deduplication, clustering, and policy helpers.
- Snapshot or schema tests for generated brief artifacts.
- UI tests for brief rendering, source links, and PWA metadata.
- Fixture-based tests for ambiguous or incomplete source metadata.

## Runtime Notes

ZeroClaw may provide helper/runtime capabilities around execution, scheduling, caching, or automation, but ClawNews should keep its public contracts in this repo. See [zeroclaw-integration.md](zeroclaw-integration.md).

