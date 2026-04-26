import fs from "node:fs/promises";
import path from "node:path";
import type {
  Article as CoreArticle,
  AuditFinding as CoreAuditFinding,
  Event as CoreEvent,
  SourceProfile as CoreSourceProfile,
  Stakeholder as CoreStakeholder
} from "@clawnews/core";

import { fallbackEvent } from "@/lib/fallback-event";
import type {
  AuditItem,
  ClaimItem,
  DisagreementItem,
  EventBrief,
  SourceProfile,
  SourceComparisonItem,
  StakeholderItem,
  TimelineItem
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

const ARTIFACT_CANDIDATES = [
  "../../artifacts/sample-event.json",
  "artifacts/sample-event.json",
  "../artifacts/sample-event.json"
];

export async function getDailyBriefEvents(): Promise<EventBrief[]> {
  const artifact = await readArtifact();

  if (!artifact) {
    return [fallbackEvent];
  }

  const events = extractEventRecords(artifact.data)
    .map((record, index) => normalizeEvent(record, index, artifact.path))
    .filter((event): event is EventBrief => Boolean(event));

  return events.length > 0 ? events : [fallbackEvent];
}

export async function getEventById(eventId: string): Promise<EventBrief | undefined> {
  const events = await getDailyBriefEvents();

  return events.find((event) => event.id === eventId || event.slug === eventId);
}

async function readArtifact(): Promise<{ data: unknown; path: string } | undefined> {
  const candidates = Array.from(
    new Set(ARTIFACT_CANDIDATES.map((candidate) => path.resolve(process.cwd(), candidate)))
  );

  for (const candidate of candidates) {
    try {
      const contents = await fs.readFile(candidate, "utf8");
      return { data: JSON.parse(contents), path: candidate };
    } catch (error) {
      if (isMissingFile(error)) {
        continue;
      }

      console.warn(`Unable to read sample event artifact at ${candidate}`, error);
      return undefined;
    }
  }

  return undefined;
}

function normalizeEvent(raw: JsonRecord, index: number, artifactPath: string): EventBrief | undefined {
  const eventRecord = isRecord(raw.event) ? raw.event : raw;
  const briefRecord = isRecord(raw.brief) ? raw.brief : {};
  const record = { ...raw, ...eventRecord, ...briefRecord };
  const coreEvent = record as Partial<CoreEvent>;

  const title = pickString(record, ["title", "headline", "name", "eventTitle", "event_title"]);
  const summary = pickString(record, [
    "summary",
    "description",
    "lede",
    "dek",
    "whatHappened",
    "what_happened"
  ]);

  if (!title && !summary) {
    return undefined;
  }

  const id = stableId(
    pickString(record, ["id", "eventId", "event_id", "slug"]),
    title ?? `event-${index + 1}`
  );
  const sources = normalizeSources(record);
  const whatChanged = normalizeChanges(record, coreEvent);

  return {
    agreedFacts: normalizeStringArray(
      pickFirst(record, ["agreedFacts", "agreed_facts", "sourceAgreement", "source_agreement"])
    ),
    artifactPath,
    audit: normalizeAudit(record),
    claims: normalizeClaims(record, sources),
    confidence: normalizeScore(pickFirst(record, ["confidence"])),
    convergenceScore: normalizeScore(pickFirst(record, ["convergenceScore", "convergence_score"])),
    disagreements: normalizeDisagreements(record),
    disagreementScore: normalizeScore(pickFirst(record, ["disagreementScore", "disagreement_score"])),
    disputedPoints: normalizeStringArray(
      pickFirst(record, ["disputedPoints", "disputed_points", "openQuestions", "open_questions"])
    ),
    evidenceQualityScore: normalizeScore(
      pickFirst(record, ["evidenceQualityScore", "evidence_quality_score"])
    ),
    happenedAt:
      pickString(record, [
        "happenedAt",
        "happened_at",
        "eventDate",
        "event_date",
        "publishedAt",
        "published_at"
      ]) ?? coreEvent.timeframe?.start,
    id,
    impact: pickString(record, ["impact", "whyItMatters", "why_it_matters", "stakes"]),
    kicker: pickString(record, ["kicker", "category", "topic"]),
    location: pickString(record, ["location", "place", "dateline"]),
    origin: "artifact",
    slug: stableId(pickString(record, ["slug"]), title ?? id),
    sourceComparisons: normalizeComparisons(record),
    sources,
    stakeholders: normalizeStakeholders(record),
    status: pickString(record, ["status", "state"]),
    summary: summary ?? title ?? "Generated event brief",
    tags: normalizeTags(record),
    timeline: normalizeTimeline(record),
    title: title ?? summary ?? "Generated event brief",
    updatedAt:
      pickString(record, [
        "updatedAt",
        "updated_at",
        "lastUpdated",
        "last_updated",
        "generatedAt",
        "generated_at"
      ]) ??
      coreEvent.timeframe?.end ??
      coreEvent.generatedAt,
    whatChanged
  };
}

function normalizeSources(record: JsonRecord): SourceProfile[] {
  const sourceValues = [
    ...asArray(pickFirst(record, ["sources", "sourceProfiles", "source_profiles", "publishers"])),
    ...asArray(pickFirst(record, ["articles", "stories", "citations", "links"]))
  ];
  const articles = asArray(pickFirst(record, ["articles", "stories", "citations", "links"]));

  const sources = sourceValues
    .map((value, index) => normalizeSource(value, index))
    .filter((source): source is SourceProfile => Boolean(source));

  return mergeSources(enrichSourcesWithArticles(sources, articles));
}

function normalizeSource(value: unknown, index: number): SourceProfile | undefined {
  if (typeof value === "string") {
    const name = cleanText(value);
    return {
      id: stableId(undefined, name || `source-${index + 1}`),
      incentives: [],
      name: name || `Source ${index + 1}`,
      notes: []
    };
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const nestedSource = isRecord(value.source) ? value.source : {};
  const merged = { ...nestedSource, ...value };
  const name =
    pickString(value, ["sourceName", "source_name", "publisher", "outlet", "name"]) ??
    pickString(nestedSource, ["sourceName", "source_name", "publisher", "outlet", "name"]);

  if (!name) {
    return undefined;
  }

  const id = stableId(pickString(merged, ["id", "sourceId", "source_id", "slug"]), name);
  const title = pickString(value, ["articleTitle", "article_title", "headline", "title"]);

  return {
    articleTitle: title && title !== name ? title : undefined,
    businessModel: pickString(merged, ["businessModel", "business_model", "revenueModel"]),
    confidence: normalizeScore(pickFirst(merged, ["confidence", "transparency", "reliability"])),
    country: pickString(merged, ["country", "region", "market"]),
    editorialProfile: pickString(merged, ["editorialProfile", "editorial_profile", "knownPerspective"]),
    funding:
      pickString(merged, ["funding", "funding_model", "revenueModel"]) ??
      normalizeStringArray((merged as Partial<CoreSourceProfile>).fundingModel).join(", "),
    homepage: pickString(merged, ["homepage", "homePage", "site", "website"]),
    id,
    incentives: normalizeStringArray(
      pickFirst(merged, ["incentives", "interests", "motives", "knownPerspective"])
    ),
    knownFunding: normalizeStringArray(pickFirst(merged, ["knownFunding", "known_funding"])),
    lastVerifiedAt: pickString(merged, ["lastVerifiedAt", "last_verified_at"]),
    likelyFraming: pickString(merged, ["likelyFraming", "likely_framing", "framing"]),
    name,
    notes: normalizeStringArray(
      pickFirst(merged, [
        "notes",
        "context",
        "sourceNotes",
        "source_notes",
        "editorialStandards",
        "editorial_standards"
      ])
    ),
    outletType: pickString(merged, ["type", "outletType", "outlet_type", "medium"]),
    parentCompany: pickString(merged, ["parentCompany", "parent_company"]),
    ownership: pickString(merged, ["ownership", "owner", "ownedBy", "owned_by", "parentCompany"]),
    publishedAt: pickString(merged, ["publishedAt", "published_at", "date", "timestamp"]),
    ultimateOwner: pickString(merged, ["ultimateOwner", "ultimate_owner"]),
    url: pickString(merged, ["url", "link", "href", "articleUrl", "article_url"])
  };
}

function normalizeClaims(record: JsonRecord, sources: SourceProfile[]): ClaimItem[] {
  const directValues = asArray(
    pickFirst(record, ["claims", "mainClaims", "main_claims", "claimSummaries"])
  );
  const values = directValues.length > 0 ? directValues : extractArticleClaims(record);

  return values
    .map((value, index): ClaimItem | undefined => {
      if (typeof value === "string") {
        return {
          id: `claim-${index + 1}`,
          sourceIds: [],
          text: cleanText(value)
        };
      }

      if (!isRecord(value)) {
        return undefined;
      }

      const text = pickString(value, ["text", "claim", "summary", "description", "title"]);

      if (!text) {
        return undefined;
      }

      return {
        confidence: normalizeScore(pickFirst(value, ["confidence"])),
        id: stableId(pickString(value, ["id", "claimId", "claim_id"]), `claim-${index + 1}`),
        label: pickString(value, ["label", "type", "stance", "topic"]),
        sourceIds: normalizeSourceRefs(
          pickFirst(value, ["sourceIds", "source_ids", "sources", "sourceNames", "source_names"]),
          sources
        ),
        text
      };
    })
    .filter((claim): claim is ClaimItem => Boolean(claim));
}

function normalizeDisagreements(record: JsonRecord): DisagreementItem[] {
  const directValues = asArray(
    pickFirst(record, [
      "disagreements",
      "disputes",
      "tensions",
      "disputedPoints",
      "disputed_points",
      "openQuestions",
      "open_questions"
    ])
  );
  const values = directValues.length > 0 ? directValues : asArray(record.sourceComparisons);

  return values
    .map((value, index): DisagreementItem | undefined => {
      if (typeof value === "string") {
        return {
          id: `disagreement-${index + 1}`,
          point: cleanText(value),
          positions: []
        };
      }

      if (!isRecord(value)) {
        return undefined;
      }

      const point = pickString(value, ["point", "question", "text", "summary", "title"]);

      if (!point) {
        return undefined;
      }

      return {
        confidence: normalizeScore(pickFirst(value, ["confidence"])),
        id: stableId(pickString(value, ["id", "disagreementId"]), `disagreement-${index + 1}`),
        point,
        positions: normalizeStringArray(
          pickFirst(value, ["positions", "sides", "claims", "views", "evidence"])
        )
      };
    })
    .filter((item): item is DisagreementItem => Boolean(item));
}

function normalizeStakeholders(record: JsonRecord): StakeholderItem[] {
  const values = asArray(pickFirst(record, ["stakeholders", "actors", "parties"]));

  return values
    .map((value, index): StakeholderItem | undefined => {
      if (typeof value === "string") {
        const name = cleanText(value);
        return {
          id: stableId(undefined, name || `stakeholder-${index + 1}`),
          name
        };
      }

      if (!isRecord(value)) {
        return undefined;
      }

      const name = pickString(value, ["name", "title", "organization", "person"]);

      if (!name) {
        return undefined;
      }

      return {
        confidence: normalizeScore(pickFirst(value, ["confidence"])),
        fundingOrBackers: pickString(value, ["fundingOrBackers", "funding_or_backers", "backers"]),
        id: stableId(pickString(value, ["id", "stakeholderId"]), name),
        interest:
          pickString(value, ["interest", "incentive", "whyTheyCare", "why_they_care"]) ??
          normalizeStringArray((value as Partial<CoreStakeholder>).interests).join("; "),
        name,
        possibleBias: pickString(value, ["possibleBias", "possible_bias", "bias"]),
        position: pickString(value, [
          "position",
          "positionSummary",
          "position_summary",
          "stance",
          "claim",
          "view"
        ]),
        role: pickString(value, ["role", "type", "category"])
      };
    })
    .filter((item): item is StakeholderItem => Boolean(item));
}

function normalizeComparisons(record: JsonRecord): SourceComparisonItem[] {
  return asArray(record.sourceComparisons)
    .map((value, index): SourceComparisonItem | undefined => {
      if (!isRecord(value)) {
        return undefined;
      }

      const summary = pickString(value, ["summary", "text", "claim"]);

      if (!summary) {
        return undefined;
      }

      return {
        agreement: pickString(value, ["agreement"]),
        confidence: normalizeScore(pickFirst(value, ["confidence"])),
        evidence: normalizeStringArray(pickFirst(value, ["evidence", "claims"])),
        framing: pickString(value, ["framing", "biasNotes", "bias_notes"]),
        id: stableId(pickString(value, ["id"]), `comparison-${index + 1}`),
        sourceIds: normalizeStringArray(pickFirst(value, ["sourceIds", "source_ids"])),
        stance: pickString(value, ["stance"]),
        summary
      };
    })
    .filter((item): item is SourceComparisonItem => Boolean(item));
}

function normalizeAudit(record: JsonRecord): AuditItem[] {
  return asArray(pickFirst(record, ["audit", "auditFindings", "audit_findings"]))
    .map((value, index): AuditItem | undefined => {
      if (!isRecord(value)) {
        return undefined;
      }

      const summary = pickString(value, ["summary", "summaryRisk", "summary_risk", "text"]);

      if (!summary) {
        return undefined;
      }

      return {
        confidence: normalizeScore(pickFirst(value, ["confidence"])),
        id: stableId(pickString(value, ["id"]), `audit-${index + 1}`),
        recommendedReview: Boolean(pickFirst(value, ["recommendedReview", "recommended_review"])),
        severity: pickString(value, ["severity"]),
        summary
      };
    })
    .filter((item): item is AuditItem => Boolean(item));
}

function normalizeTimeline(record: JsonRecord): TimelineItem[] {
  const directValues = asArray(pickFirst(record, ["timeline", "updates", "events", "history"]));
  const values =
    directValues.length > 0
      ? directValues
      : asArray(record.articles).map((article) => {
          if (!isRecord(article)) {
            return article;
          }

          return {
            id: pickString(article, ["id"]),
            label: "Article",
            text: pickString(article, ["summary", "title"]),
            time: pickString(article, ["publishedAt", "published_at"])
          };
        });

  return values
    .map((value, index): TimelineItem | undefined => {
      if (typeof value === "string") {
        return {
          id: `timeline-${index + 1}`,
          text: cleanText(value)
        };
      }

      if (!isRecord(value)) {
        return undefined;
      }

      const text = pickString(value, ["text", "summary", "description", "change", "title"]);

      if (!text) {
        return undefined;
      }

      return {
        id: stableId(pickString(value, ["id"]), `timeline-${index + 1}`),
        label: pickString(value, ["label", "type", "phase"]),
        text,
        time: pickString(value, ["time", "date", "timestamp", "publishedAt", "published_at"])
      };
    })
    .filter((item): item is TimelineItem => Boolean(item));
}

function enrichSourcesWithArticles(sources: SourceProfile[], articles: unknown[]): SourceProfile[] {
  const articleRecords = articles.filter(isRecord);

  return sources.map((source) => {
    const article = articleRecords.find(
      (candidate) =>
        pickString(candidate, ["sourceId", "source_id", "id"]) === source.id ||
        stableId(undefined, pickString(candidate, ["sourceName", "publisher", "outlet"]) ?? "") === source.id
    ) as (Partial<CoreArticle> & JsonRecord) | undefined;

    if (!article) {
      return source;
    }

    return {
      ...source,
      articleTitle: source.articleTitle ?? pickString(article, ["title", "headline"]),
      publishedAt: source.publishedAt ?? pickString(article, ["publishedAt", "published_at"]),
      url: source.url ?? pickString(article, ["url", "link", "href"])
    };
  });
}

function mergeSources(sources: SourceProfile[]) {
  const merged = new Map<string, SourceProfile>();

  for (const source of sources) {
    const existing = merged.get(source.id);

    if (!existing) {
      merged.set(source.id, source);
      continue;
    }

    merged.set(source.id, {
      ...existing,
      ...withoutEmpty(source),
      incentives: Array.from(new Set([...existing.incentives, ...source.incentives])),
      knownFunding: Array.from(
        new Set([...(existing.knownFunding ?? []), ...(source.knownFunding ?? [])])
      ),
      notes: Array.from(new Set([...existing.notes, ...source.notes]))
    });
  }

  return [...merged.values()];
}

function withoutEmpty(source: SourceProfile) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== "";
    })
  ) as Partial<SourceProfile>;
}

function extractArticleClaims(record: JsonRecord) {
  return asArray(record.articles).flatMap((article) => {
    if (!isRecord(article)) {
      return [];
    }

    const sourceId = pickString(article, ["sourceId", "source_id"]);
    const articleTitle = pickString(article, ["title", "headline"]);

    return asArray(article.claims).map((claim) => {
      if (!isRecord(claim)) {
        return claim;
      }

      return {
        ...claim,
        articleTitle,
        label: pickString(claim, ["label", "stance", "topic"]),
        sourceIds: sourceId ? [sourceId] : []
      };
    });
  });
}

function normalizeChanges(record: JsonRecord, coreEvent: Partial<CoreEvent>) {
  const directChanges = normalizeStringArray(
    pickFirst(record, ["whatChanged", "what_changed", "changes", "latestChanges", "latest_changes"])
  );

  if (directChanges.length > 0) {
    return directChanges;
  }

  const auditFindings = (coreEvent.auditFindings ?? []) as Partial<CoreAuditFinding>[];
  const derivedChanges = [
    coreEvent.articles?.length
      ? `${coreEvent.articles.length} articles clustered from ${
          coreEvent.sourceProfiles?.length ?? 0
        } source profiles.`
      : undefined,
    coreEvent.sourceComparisons?.length
      ? `${coreEvent.sourceComparisons.length} source comparison points surfaced.`
      : undefined,
    ...normalizeStringArray(auditFindings.map((finding) => finding.summary))
  ];

  return derivedChanges.filter((change): change is string => Boolean(change));
}

function normalizeTags(record: JsonRecord) {
  const directTags = normalizeStringArray(pickFirst(record, ["tags", "topics", "categories"]));

  if (directTags.length > 0) {
    return directTags;
  }

  return Array.from(
    new Set(
      asArray(record.articles)
        .flatMap((article) =>
          isRecord(article) ? normalizeStringArray((article as Partial<CoreArticle>).tags) : []
        )
        .filter(Boolean)
    )
  );
}

function extractEventRecords(data: unknown): JsonRecord[] {
  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of ["events", "items", "briefs"]) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  for (const key of ["event", "brief", "data"]) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }

    if (isRecord(value)) {
      return [value];
    }
  }

  return [data];
}

function normalizeSourceRefs(value: unknown, sources: SourceProfile[]) {
  return normalizeStringArray(value)
    .map((ref) => {
      const source = sources.find(
        (candidate) =>
          candidate.id === ref ||
          candidate.name.toLowerCase() === ref.toLowerCase() ||
          candidate.id === stableId(undefined, ref)
      );

      return source?.id ?? stableId(undefined, ref);
    })
    .filter(Boolean);
}

function normalizeStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return cleanText(String(item));
      }

      if (isRecord(item)) {
        return pickString(item, ["text", "name", "title", "summary", "label", "id"]) ?? "";
      }

      return "";
    })
    .filter(Boolean);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

function pickFirst(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function pickString(record: JsonRecord, keys: string[]) {
  const value = pickFirst(record, keys);

  if (typeof value === "string" || typeof value === "number") {
    return cleanText(String(value));
  }

  return undefined;
}

function normalizeScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(1, value));
  }

  if (typeof value === "string" && value.trim()) {
    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return Math.max(0, Math.min(1, numberValue));
    }
  }

  return undefined;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stableId(preferred: string | undefined, fallback: string) {
  return slugify(preferred ?? fallback) || slugify(fallback) || "item";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingFile(error: unknown) {
  return isRecord(error) && error.code === "ENOENT";
}
