# ZeroClaw Integration

## Role

ZeroClaw is helper/runtime infrastructure for ClawNews. It can make the pipeline easier to run, but it should not become the hidden owner of editorial decisions or user-facing policy.

ClawNews owns:

- Product behavior.
- Brief schema.
- Source transparency rules.
- Citation requirements.
- UI presentation.
- Local test fixtures and expected outputs.

ZeroClaw may assist with:

- Running ingestion jobs.
- Scheduling refreshes.
- Calling extraction or enrichment helpers.
- Managing temporary caches.
- Coordinating local runtime tasks.
- Producing intermediate artifacts for ClawNews to validate.

## Boundary

Generated output must be accepted by ClawNews only after validation against local types, schemas, and policy checks. The UI should not depend on opaque ZeroClaw-only state.

Good integration shape:

1. ClawNews sends explicit inputs: feed list, source metadata, previous brief, and generation options.
2. ZeroClaw performs helper work.
3. ZeroClaw returns structured candidate records.
4. ClawNews validates, stores, and renders accepted artifacts.

Avoid:

- Uncited generated claims.
- Runtime-only source metadata that cannot be inspected locally.
- Policy decisions that live outside this repo.
- UI behavior that changes based on hidden helper state.

## Expected Interfaces

Early interfaces are file or function based and live in `packages/core/src/zeroclaw/contracts.ts`:

- `clawnews.rss.fetch`: feed list in, normalized articles out.
- `clawnews.article.dedupe`: article batch in, deduped articles out.
- `clawnews.event.cluster`: articles in, event cluster/brief candidate out for the MVP.
- `clawnews.claim.extract`: event/articles in, extracted claim records out.
- `clawnews.source.enrich`: source IDs or seed profiles in, verified ownership/funding profile updates out.
- `clawnews.event.summarize`: event/articles/source profiles/stakeholders in, event brief artifact out.
- `clawnews.event.audit`: generated brief in, audit findings out.

Each output should include enough provenance for debugging: source article IDs, source URLs, generation time, helper version when available, and warnings for incomplete data.

The current local runner is a mock adapter. It executes the same core functions used by the npm scripts and writes local artifacts, which makes it replaceable by real ZeroClaw invocation later without changing the PWA contract.

## Failure Behavior

If ZeroClaw is unavailable, ClawNews should still support:

- Rendering existing generated artifacts.
- Running deterministic tests.
- Showing source metadata fixtures.
- Documenting which generation step is missing.

If helper output is incomplete, ClawNews should prefer partial transparent briefs over polished but unsupported summaries.
