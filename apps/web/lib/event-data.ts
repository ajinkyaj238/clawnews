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
  const sourceComparisons = normalizeComparisons(record);
  const disagreements = normalizeDisagreements(record, sourceComparisons);
  const agreedFacts = normalizeAgreedFacts(record, sourceComparisons);
  const disputedPoints = normalizeDisputedPoints(record, sourceComparisons, disagreements);
  const whatChanged = normalizeChanges(record, coreEvent, sourceComparisons, sources);

  return {
    agreedFacts,
    artifactPath,
    audit: normalizeAudit(record),
    claims: normalizeClaims(record, sources),
    confidence: normalizeScore(pickFirst(record, ["confidence"])),
    convergenceScore: normalizeScore(pickFirst(record, ["convergenceScore", "convergence_score"])),
    disagreements,
    disagreementScore: normalizeScore(pickFirst(record, ["disagreementScore", "disagreement_score"])),
    disputedPoints,
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
    sourceComparisons,
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

function normalizeAgreedFacts(record: JsonRecord, comparisons: SourceComparisonItem[]) {
  const comparisonFacts = comparisons
    .filter(isAgreementComparison)
    .map(comparisonToAgreementPoint);

  if (comparisonFacts.length > 0) {
    return dedupeStrings(comparisonFacts);
  }

  return dedupeStrings(
    normalizeStringArray(
      pickFirst(record, ["agreedFacts", "agreed_facts", "sourceAgreement", "source_agreement"])
    ).map(simplifyLegacyPoint)
  );
}

function normalizeDisputedPoints(
  record: JsonRecord,
  comparisons: SourceComparisonItem[],
  disagreements: DisagreementItem[]
) {
  if (disagreements.length > 0) {
    return disagreements.map((item) => item.point);
  }

  const comparisonDisputes = comparisons
    .filter(isConflictComparison)
    .map(comparisonToConflictPoint);

  if (comparisonDisputes.length > 0) {
    return dedupeStrings(comparisonDisputes);
  }

  return dedupeStrings(
    normalizeStringArray(
      pickFirst(record, ["disputedPoints", "disputed_points", "openQuestions", "open_questions"])
    ).map(simplifyLegacyPoint)
  );
}

function normalizeDisagreements(
  record: JsonRecord,
  comparisons: SourceComparisonItem[]
): DisagreementItem[] {
  const comparisonDisagreements = comparisons
    .filter(isConflictComparison)
    .map((comparison, index): DisagreementItem => {
      const positions = comparison.evidence.length > 0 ? comparison.evidence : [];

      return {
        confidence: comparison.confidence,
        id: stableId(comparison.id, `disagreement-${index + 1}`),
        point: comparisonToConflictPoint(comparison),
        positions
      };
    });

  if (comparisonDisagreements.length > 0) {
    return comparisonDisagreements;
  }

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
  const values = directValues;

  return values
    .map((value, index): DisagreementItem | undefined => {
      if (typeof value === "string") {
        return {
          id: `disagreement-${index + 1}`,
          point: simplifyLegacyPoint(value),
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
        point: simplifyLegacyPoint(point),
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

function normalizeChanges(
  record: JsonRecord,
  coreEvent: Partial<CoreEvent>,
  comparisons: SourceComparisonItem[],
  sources: SourceProfile[]
) {
  const directChanges = normalizeStringArray(
    pickFirst(record, ["whatChanged", "what_changed", "changes", "latestChanges", "latest_changes"])
  );

  if (directChanges.length > 0) {
    return dedupeStrings(
      directChanges.map((change) => simplifyChange(change, coreEvent, comparisons, sources))
    );
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

  return dedupeStrings(
    derivedChanges
      .filter((change): change is string => Boolean(change))
      .map((change) => simplifyChange(change, coreEvent, comparisons, sources))
  );
}

function isAgreementComparison(comparison: SourceComparisonItem) {
  const agreement = comparison.agreement?.toLowerCase() ?? "";
  return (
    agreement === "aligned" ||
    agreement === "partial" ||
    agreement.includes("agreement") ||
    agreement.includes("align")
  );
}

function isConflictComparison(comparison: SourceComparisonItem) {
  const agreement = comparison.agreement?.toLowerCase() ?? "";
  return (
    agreement === "conflicting" ||
    agreement.includes("conflict") ||
    agreement.includes("contest") ||
    agreement.includes("diverg")
  );
}

function comparisonToAgreementPoint(comparison: SourceComparisonItem) {
  const evidence = comparison.evidence.find(Boolean);

  if (evidence) {
    return sentenceCase(toSentence(trimAtSecondaryClause(evidence)));
  }

  return simplifyLegacyPoint(comparison.summary);
}

function comparisonToConflictPoint(comparison: SourceComparisonItem) {
  const question = extractQuestion(comparison.summary);

  if (question) {
    return `Sources split over ${questionAsWhether(question)}.`;
  }

  return simplifyLegacyPoint(comparison.summary);
}

function simplifyLegacyPoint(value: string) {
  const text = cleanText(value);
  const legacySummary = text.match(/show\s+(\w+)\s+claims\s+on:\s*(.+)$/i);

  if (legacySummary?.[1] && legacySummary[2]) {
    const agreement = legacySummary[1].toLowerCase();

    if (agreement === "conflicting") {
      return `Sources split over ${questionAsWhether(legacySummary[2])}.`;
    }

    return `Sources align on ${questionAsWhether(legacySummary[2])}.`;
  }

  return toSentence(text);
}

function simplifyChange(
  value: string,
  coreEvent: Partial<CoreEvent>,
  comparisons: SourceComparisonItem[],
  sources: SourceProfile[]
) {
  const text = cleanText(value);
  const latestSource = text.match(/^Latest source added:\s*(.+)$/i);

  if (latestSource?.[1]) {
    return summarizeLatestArticleChange(latestSource[1], coreEvent, sources);
  }

  if (/contested point\(s\) remain visible in the source comparison/i.test(text)) {
    const conflict = comparisons.find(isConflictComparison);

    if (conflict) {
      return summarizeOpenConflict(conflict);
    }

    return "A contested source comparison remains unresolved.";
  }

  return toSentence(text);
}

function summarizeLatestArticleChange(
  title: string,
  coreEvent: Partial<CoreEvent>,
  sources: SourceProfile[]
) {
  const article = findArticleByTitle(coreEvent, title);
  const source = sources.find((candidate) => candidate.id === article?.sourceId);
  const sourceName = source?.name ?? article?.sourceId;

  if (!sourceName) {
    return `Latest update: ${toSentence(title)}`;
  }

  const headline = stripSourcePrefix(title, sourceName);
  return `${sourceName} added the latest update, ${headlineAsClause(headline)}.`;
}

function summarizeOpenConflict(comparison: SourceComparisonItem) {
  const question = extractQuestion(comparison.summary);
  const tradeoff = question ? questionAsTradeoff(question) : undefined;

  if (tradeoff) {
    return `${sentenceCase(tradeoff)} remains unresolved.`;
  }

  if (question) {
    return `${sentenceCase(questionAsWhether(question))} remains unresolved.`;
  }

  return `${simplifyLegacyPoint(comparison.summary).replace(/\.$/, "")} remains unresolved.`;
}

function findArticleByTitle(coreEvent: Partial<CoreEvent>, title: string) {
  const articles = coreEvent.articles ?? [];
  const cleanedTitle = cleanText(title).toLowerCase();

  return (
    articles.find((article) => cleanText(article.title).toLowerCase() === cleanedTitle) ??
    articles.at(-1)
  );
}

function extractQuestion(value: string) {
  const claimsOn = value.match(/claims on:\s*(.+)$/i);

  if (claimsOn?.[1]) {
    return claimsOn[1];
  }

  const splitOver = value.match(/sources split over\s+(.+?)(?:\.)?$/i);

  return splitOver?.[1];
}

function questionAsWhether(question: string) {
  const cleaned = cleanText(question).replace(/\?$/, "");
  const lowered = cleaned.toLowerCase();

  if (lowered.startsWith("whether ")) {
    return lowered;
  }

  const modalMatch = cleaned.match(/^(Will|Would|Can|Could|Should)\s+(.+)$/i);

  if (modalMatch?.[1] && modalMatch[2]) {
    return invertQuestion(modalMatch[1].toLowerCase(), modalMatch[2]);
  }

  const beMatch = cleaned.match(/^(Is|Are|Was|Were)\s+(.+)$/i);

  if (beMatch?.[1] && beMatch[2]) {
    return invertBeQuestion(beMatch[1].toLowerCase(), beMatch[2]);
  }

  return `whether ${lowered}`;
}

function questionAsTradeoff(question: string) {
  const cleaned = cleanText(question)
    .replace(/\?$/, "")
    .replace(/^whether\s+/i, "");
  const justified =
    cleaned.match(/^Are\s+(.+?)\s+justified by\s+(.+)$/i) ??
    cleaned.match(/^(.+?)\s+(?:are|is|were|was)\s+justified by\s+(.+)$/i);

  if (justified?.[1] && justified[2]) {
    return `the tradeoff between ${lowerFirst(justified[1])} and ${lowerFirst(justified[2])}`;
  }

  return undefined;
}

function invertQuestion(modal: string, rest: string) {
  const words = rest.split(" ").filter(Boolean);
  const subjectLength = inferSubjectLength(words);
  const subject = words.slice(0, subjectLength).join(" ");
  const predicate = words.slice(subjectLength).join(" ");

  if (!subject || !predicate) {
    return `whether ${lowerFirst(rest)}`;
  }

  return `whether ${lowerFirst(subject)} ${modal} ${predicate}`;
}

function invertBeQuestion(verb: string, rest: string) {
  const predicateMatch = rest.match(
    /^(.+?)\s+(adequate|available|clear|credible|enough|included|justified|required|resolved|visible)\b(.*)$/i
  );

  if (predicateMatch?.[1] && predicateMatch[2]) {
    return `whether ${lowerFirst(predicateMatch[1])} ${verb} ${lowerFirst(
      `${predicateMatch[2]}${predicateMatch[3] ?? ""}`
    )}`;
  }

  return `whether ${lowerFirst(rest)} ${verb}`;
}

function inferSubjectLength(words: string[]) {
  if (words.length <= 2) {
    return Math.max(1, words.length - 1);
  }

  if (["a", "an", "the", "this", "that"].includes(words[0]?.toLowerCase() ?? "")) {
    return Math.min(2, words.length - 1);
  }

  return Math.min(3, words.length - 1);
}

function trimAtSecondaryClause(value: string) {
  return cleanText(value)
    .replace(/\s*;\s*.*$/, "")
    .replace(/\s*,\s*while\s+.*$/i, "")
    .replace(/\s*,\s*but\s+.*$/i, "");
}

function headlineAsClause(value: string) {
  const headline = cleanText(value).replace(/\.$/, "");
  const lowerHeadline = lowerFirst(headline);
  const replacements: Array<[RegExp, string]> = [
    [/^asks\s+(.+)$/i, "asking $1"],
    [/^backs\s+(.+)$/i, "backing $1"],
    [/^challenges\s+(.+)$/i, "challenging $1"],
    [/^says\s+(.+)$/i, "saying $1"],
    [/^supports\s+(.+)$/i, "supporting $1"],
    [/^urges\s+(.+)$/i, "urging $1"],
    [/^warns\s+(.+)$/i, "warning $1"]
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(headline)) {
      return headline.replace(pattern, replacement);
    }
  }

  return `covering ${lowerHeadline}`;
}

function stripSourcePrefix(title: string, sourceName: string) {
  const normalizedTitle = cleanText(title);
  const normalizedSource = cleanText(sourceName);

  if (normalizedTitle.toLowerCase().startsWith(`${normalizedSource.toLowerCase()} `)) {
    return normalizedTitle.slice(normalizedSource.length).trim();
  }

  return normalizedTitle;
}

function toSentence(value: string) {
  const cleaned = cleanText(value);

  if (/[.!?]$/.test(cleaned)) {
    return cleaned;
  }

  return `${cleaned}.`;
}

function sentenceCase(value: string) {
  const cleaned = cleanText(value);
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function lowerFirst(value: string) {
  const cleaned = cleanText(value);
  return `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
}

function dedupeStrings(items: string[]) {
  return dedupeBy(
    items.map(cleanText).filter(Boolean),
    (item) => item.toLowerCase()
  );
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
