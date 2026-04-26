import {
  Article,
  ArticleSchema,
  AuditFinding,
  AuditFindingSchema,
  ContestedQuestion,
  DEFAULT_CONFIDENCE,
  Event,
  EventSchema,
  SourceComparison,
  SourceComparisonSchema,
  SourceProfile,
  SourceProfileSchema,
  Stance,
  Topic,
  TopicSchema
} from "./schemas.js";
import { createStableId } from "./ids.js";

export interface GenerateEventInput {
  topic: unknown;
  articles: unknown[];
  sourceProfiles: unknown[];
  generatedAt?: string;
}

export function generateEventFromArticles(input: GenerateEventInput): Event {
  const topic = TopicSchema.parse(input.topic);
  const articles = input.articles.map((article) => ArticleSchema.parse(article));
  const sourceProfiles = input.sourceProfiles.map((source) =>
    SourceProfileSchema.parse(source)
  );
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const topicArticles = selectTopicArticles(topic, articles);
  const sortedArticles = [...topicArticles].sort((left, right) =>
    left.publishedAt.localeCompare(right.publishedAt)
  );
  const eventId = createStableId("event", [
    topic.id,
    sortedArticles[0]?.publishedAt ?? generatedAt,
    sortedArticles.length
  ]);
  const linkedSourceProfiles = sourceProfiles.filter((source) =>
    sortedArticles.some((article) => article.sourceId === source.id)
  );
  const comparisons = buildSourceComparisons(
    eventId,
    topic,
    sortedArticles,
    linkedSourceProfiles
  );
  const auditFindings = buildAuditFindings(
    eventId,
    sortedArticles,
    linkedSourceProfiles,
    comparisons
  );

  return EventSchema.parse({
    id: eventId,
    topicId: topic.id,
    topic: topic.title,
    title: topic.title,
    neutralSummary: buildEventSummary(topic, sortedArticles, comparisons),
    summary: buildEventSummary(topic, sortedArticles, comparisons),
    status: "monitoring",
    generatedAt,
    timeframe: {
      start: sortedArticles[0]?.publishedAt ?? generatedAt,
      end: sortedArticles.at(-1)?.publishedAt ?? generatedAt
    },
    firstSeenAt: sortedArticles[0]?.publishedAt ?? generatedAt,
    lastUpdatedAt: sortedArticles.at(-1)?.publishedAt ?? generatedAt,
    sourceCount: unique(sortedArticles.map((article) => article.sourceId)).length,
    convergenceScore: calculateConvergenceScore(comparisons),
    disagreementScore: calculateDisagreementScore(comparisons),
    evidenceQualityScore: calculateEvidenceQualityScore(
      sortedArticles,
      linkedSourceProfiles,
      comparisons
    ),
    agreedFacts: buildAgreedFacts(comparisons),
    disputedPoints: buildDisputedPoints(comparisons),
    whatChanged: buildWhatChanged(sortedArticles, comparisons),
    articles: sortedArticles,
    sourceProfiles: linkedSourceProfiles,
    stakeholders: topic.stakeholders,
    sourceComparisons: comparisons,
    auditFindings,
    audit: auditFindings,
    confidence: calculateEventConfidence(
      sortedArticles,
      linkedSourceProfiles,
      comparisons,
      auditFindings
    )
  });
}

function selectTopicArticles(topic: Topic, articles: Article[]): Article[] {
  return articles.filter((article) => {
    if (article.topicIds.includes(topic.id)) {
      return true;
    }

    const haystack = [
      article.title,
      article.summary,
      article.body ?? "",
      ...article.tags,
      ...article.claims.map((claim) => claim.text)
    ]
      .join(" ")
      .toLowerCase();

    return topic.keywords.some((keyword) =>
      haystack.includes(keyword.toLowerCase())
    );
  });
}

function buildSourceComparisons(
  eventId: string,
  topic: Topic,
  articles: Article[],
  sourceProfiles: SourceProfile[]
): SourceComparison[] {
  return topic.contestedQuestions.flatMap((question) => {
    const claims = matchingClaims(question, articles);
    const sourceIds = unique(
      claims.map((claim) => {
        const article = articles.find((candidate) =>
          candidate.claims.some((articleClaim) => articleClaim.id === claim.id)
        );
        return article?.sourceId;
      })
    );

    if (claims.length === 0 || sourceIds.length < 2) {
      return [];
    }

    const articleIds = unique(
      articles
        .filter((article) =>
          article.claims.some((claim) =>
            claims.some((matchingClaim) => matchingClaim.id === claim.id)
          )
        )
        .map((article) => article.id)
    );
    const stanceSpread = unique(
      claims
        .map((claim) => claim.stance)
        .filter((stance): stance is Stance => stance !== "unclear")
    );
    const agreement = agreementFromStances(stanceSpread);
    const sourceNames = sourceIds
      .map((sourceId) => {
        const source = sourceProfiles.find((profile) => profile.id === sourceId);
        return source?.name ?? sourceId;
      })
      .join(", ");

    return [
      SourceComparisonSchema.parse({
        id: createStableId("comparison", [eventId, question.id, agreement]),
        eventId,
        questionId: question.id,
        dimension: "claim",
        agreement,
        sourceIds,
        articleIds,
        stanceSpread,
        stance: stanceSpread.length === 1 ? stanceSpread[0] : "mixed",
        framing: describeFraming(agreement),
        claims: claims.map((claim) => claim.text),
        ownershipNotes: "See linked source profiles for ownership and funding context.",
        biasNotes:
          "Framing is inferred from article claims for this event and should be reviewed before publishing.",
        summary: `${sourceNames} show ${agreement} claims on: ${question.question}`,
        evidence: claims.slice(0, 4).map((claim) => claim.text),
        confidence: average(
          claims.map((claim) => claim.confidence),
          DEFAULT_CONFIDENCE
        )
      })
    ];
  });
}

function matchingClaims(question: ContestedQuestion, articles: Article[]) {
  const keywords = question.relatedKeywords.map((keyword) =>
    keyword.toLowerCase()
  );

  return articles.flatMap((article) =>
    article.claims.filter((claim) => {
      if (claim.questionId === question.id) {
        return true;
      }

      const haystack = `${claim.text} ${claim.evidence ?? ""}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    })
  );
}

function buildAuditFindings(
  eventId: string,
  articles: Article[],
  sourceProfiles: SourceProfile[],
  comparisons: SourceComparison[]
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const profiledSourceIds = new Set(sourceProfiles.map((source) => source.id));
  const articleSourceIds = unique(articles.map((article) => article.sourceId));
  const missingSourceIds = articleSourceIds.filter(
    (sourceId) => !profiledSourceIds.has(sourceId)
  );

  if (missingSourceIds.length > 0) {
    findings.push(
      AuditFindingSchema.parse({
        id: createStableId("audit", [eventId, "missing-source-profile"]),
        eventId,
        severity: "high",
        category: "missing-source-profile",
        summary: `Missing source profiles for ${missingSourceIds.join(", ")}.`,
        sourceIds: missingSourceIds,
        remediation: "Create SourceProfile records before publishing the brief."
      })
    );
  }

  if (articleSourceIds.length > 0 && articleSourceIds.length < 3) {
    findings.push(
      AuditFindingSchema.parse({
        id: createStableId("audit", [eventId, "low-source-diversity"]),
        eventId,
        severity: "medium",
        category: "low-source-diversity",
        summary: "Coverage is based on fewer than three distinct sources.",
        sourceIds: articleSourceIds,
        remediation: "Add sources with materially different vantage points."
      })
    );
  }

  const lowConfidenceClaims = articles.flatMap((article) =>
    article.claims
      .filter((claim) => claim.confidence < 0.5)
      .map((claim) => ({ articleId: article.id, sourceId: article.sourceId, claim }))
  );

  if (lowConfidenceClaims.length > 0) {
    findings.push(
      AuditFindingSchema.parse({
        id: createStableId("audit", [eventId, "low-confidence-claim"]),
        eventId,
        severity: "medium",
        category: "low-confidence-claim",
        summary: `${lowConfidenceClaims.length} claim(s) need stronger evidence or attribution.`,
        articleIds: unique(lowConfidenceClaims.map((claim) => claim.articleId)),
        sourceIds: unique(lowConfidenceClaims.map((claim) => claim.sourceId)),
        remediation: "Keep low-confidence claims out of generated headlines."
      })
    );
  }

  if (comparisons.some((comparison) => comparison.agreement === "conflicting")) {
    findings.push(
      AuditFindingSchema.parse({
        id: createStableId("audit", [eventId, "claim-conflict"]),
        eventId,
        severity: "info",
        category: "claim-conflict",
        summary: "At least one contested question has conflicting claims across sources.",
        articleIds: unique(comparisons.flatMap((comparison) => comparison.articleIds)),
        sourceIds: unique(comparisons.flatMap((comparison) => comparison.sourceIds))
      })
    );
  }

  if (articles.length > 0 && comparisons.length === 0) {
    findings.push(
      AuditFindingSchema.parse({
        id: createStableId("audit", [eventId, "coverage-gap"]),
        eventId,
        severity: "low",
        category: "coverage-gap",
        summary: "No multi-source comparisons were generated for this topic.",
        remediation: "Review topic keywords or add claim annotations."
      })
    );
  }

  return findings;
}

function buildEventSummary(
  topic: Topic,
  articles: Article[],
  comparisons: SourceComparison[]
): string {
  const sourceCount = unique(articles.map((article) => article.sourceId)).length;
  const contestedCount = comparisons.filter(
    (comparison) => comparison.agreement === "conflicting"
  ).length;

  return `${topic.description} This event view uses ${articles.length} article(s) from ${sourceCount} source(s), with ${contestedCount} contested comparison(s) surfaced for review.`;
}

function agreementFromStances(stances: Stance[]) {
  if (stances.length === 0) {
    return "unclear";
  }

  if (stances.length === 1) {
    return "aligned";
  }

  if (stances.includes("mixed") || stances.includes("neutral")) {
    return "partial";
  }

  return "conflicting";
}

function calculateEventConfidence(
  articles: Article[],
  sourceProfiles: SourceProfile[],
  comparisons: SourceComparison[],
  auditFindings: AuditFinding[]
) {
  const articleConfidence = average(
    articles.map((article) => article.confidence),
    DEFAULT_CONFIDENCE
  );
  const sourceConfidence = average(
    sourceProfiles.map((source) => (source.reliability + source.transparency) / 2),
    DEFAULT_CONFIDENCE
  );
  const comparisonConfidence = average(
    comparisons.map((comparison) => comparison.confidence),
    DEFAULT_CONFIDENCE
  );
  const penalty = auditFindings.reduce((total, finding) => {
    if (finding.severity === "high") {
      return total + 0.12;
    }

    if (finding.severity === "medium") {
      return total + 0.06;
    }

    return total;
  }, 0);

  return roundConfidence(
    articleConfidence * 0.3 + sourceConfidence * 0.35 + comparisonConfidence * 0.35 - penalty
  );
}

function calculateConvergenceScore(comparisons: SourceComparison[]) {
  if (comparisons.length === 0) {
    return DEFAULT_CONFIDENCE;
  }

  const positive = comparisons.filter(
    (comparison) =>
      comparison.agreement === "aligned" || comparison.agreement === "partial"
  ).length;

  return roundConfidence(positive / comparisons.length);
}

function calculateDisagreementScore(comparisons: SourceComparison[]) {
  if (comparisons.length === 0) {
    return 0;
  }

  const contested = comparisons.filter(
    (comparison) => comparison.agreement === "conflicting"
  ).length;

  return roundConfidence(contested / comparisons.length);
}

function calculateEvidenceQualityScore(
  articles: Article[],
  sourceProfiles: SourceProfile[],
  comparisons: SourceComparison[]
) {
  const articleConfidence = average(
    articles.map((article) => article.confidence),
    DEFAULT_CONFIDENCE
  );
  const sourceConfidence = average(
    sourceProfiles.map((source) => source.confidence),
    DEFAULT_CONFIDENCE
  );
  const comparisonConfidence = average(
    comparisons.map((comparison) => comparison.confidence),
    DEFAULT_CONFIDENCE
  );

  return roundConfidence(
    articleConfidence * 0.35 + sourceConfidence * 0.35 + comparisonConfidence * 0.3
  );
}

function buildAgreedFacts(comparisons: SourceComparison[]) {
  return comparisons
    .filter((comparison) => comparison.agreement === "aligned" || comparison.agreement === "partial")
    .map((comparison) => comparison.summary);
}

function buildDisputedPoints(comparisons: SourceComparison[]) {
  return comparisons
    .filter((comparison) => comparison.agreement === "conflicting")
    .map((comparison) => comparison.summary);
}

function buildWhatChanged(articles: Article[], comparisons: SourceComparison[]) {
  const latest = articles.at(-1);
  const changes = [];

  if (latest) {
    changes.push(`Latest source added: ${latest.title}`);
  }

  const conflicting = comparisons.filter(
    (comparison) => comparison.agreement === "conflicting"
  );

  if (conflicting.length > 0) {
    changes.push(
      `${conflicting.length} contested point(s) remain visible in the source comparison.`
    );
  }

  return changes;
}

function describeFraming(agreement: SourceComparison["agreement"]) {
  if (agreement === "conflicting") {
    return "Sources emphasize different costs, risks, or benefits.";
  }

  if (agreement === "partial") {
    return "Sources share part of the factual frame while stressing different caveats.";
  }

  if (agreement === "aligned") {
    return "Sources substantially align on the claim.";
  }

  return "The available framing is unclear.";
}

function unique<T>(items: Array<T | undefined>): T[] {
  return [...new Set(items.filter((item): item is T => item !== undefined))];
}

function average(values: number[], fallback: number) {
  if (values.length === 0) {
    return fallback;
  }

  return roundConfidence(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function roundConfidence(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return Number(clamped.toFixed(2));
}
