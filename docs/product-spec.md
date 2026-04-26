# Product Spec

## Summary

ClawNews turns many RSS articles into clean event briefs. Each brief should help a reader answer: what happened, who is saying what, where sources disagree, why stakeholders may frame the story differently, who owns or funds relevant sources, and what changed since the last update.

The product is optimized for fast phone reading without hiding the underlying sources.

## Users

- Readers who want a compact brief without losing access to original articles.
- Researchers who want to inspect claims and source incentives quickly.
- Builders evaluating whether RSS plus transparent enrichment can produce useful event intelligence.

## Core Workflow

1. Pull many RSS feeds.
2. Normalize articles into source, title, URL, published time, summary, and content fields where available.
3. Cluster articles into real-world events.
4. Extract key claims, disagreements, stakeholders, incentives, and update deltas.
5. Enrich sources and stakeholders with ownership, funding, or affiliation context.
6. Render a concise event brief with citations and transparency notes.

## Event Brief Contents

An MVP event brief should include:

- Headline and short neutral summary.
- Timeline of known updates.
- Main claims and which sources make them.
- Areas of agreement and disagreement.
- Stakeholders and their known incentives or interests.
- Source cards with ownership, funding, affiliation, and citation links.
- Confidence and uncertainty notes where evidence is incomplete.
- Change log since the previous generated brief.

## MVP Scope

- RSS ingestion from a small curated feed list.
- Deterministic article normalization and deduplication.
- Initial clustering by URL, title similarity, entities, time window, and source overlap.
- Brief generation from clustered source material.
- Phone-first PWA views for brief list, brief detail, and source inspection.
- Explicit source transparency policy in the UI or linked docs.

## Out Of Scope For MVP

- User accounts, personalization, comments, or social posting.
- Real-time push alerts.
- Paid subscriptions or publisher integrations.
- Automated factual verdicts.
- Hidden source scoring that cannot be inspected by users.
- Full offline archive.

## Product Principles

- Show sources before polish.
- Separate article claims from generated synthesis.
- Prefer uncertainty over false confidence.
- Preserve links to original reporting.
- Make source ownership and funding visible when known.
- Keep the phone experience fast, readable, and calm.

## Success Criteria

- A reader can understand an event in under two minutes.
- Every generated claim can be traced to one or more source URLs.
- Disagreements are visible without requiring the reader to open every article.
- Missing metadata is labeled as unknown rather than inferred silently.
- The app can be installed on a phone as a PWA.

