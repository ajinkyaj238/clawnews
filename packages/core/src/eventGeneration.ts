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
    whatChanged: buildWhatChanged(sortedArticles, comparisons, linkedSourceProfiles),
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
        summary: summarizeComparison(question.question, agreement, claims),
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
      if (claim.questionId) {
        return claim.questionId === question.id;
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
  const contestedPhrase =
    contestedCount === 0
      ? "no unresolved source splits"
      : formatCount(contestedCount, "unresolved source split");

  return `${topic.description} This brief compares ${formatCount(
    articles.length,
    "article"
  )} from ${formatCount(sourceCount, "source")} and surfaces ${contestedPhrase}.`;
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
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

function buildWhatChanged(
  articles: Article[],
  comparisons: SourceComparison[],
  sourceProfiles: SourceProfile[]
) {
  const latest = articles.at(-1);
  const changes = [];

  if (latest) {
    changes.push(summarizeLatestArticle(latest, sourceProfiles));
  }

  const conflicting = comparisons.filter(
    (comparison) => comparison.agreement === "conflicting"
  );

  if (conflicting.length === 1 && conflicting[0]) {
    changes.push(summarizeOpenConflict(conflicting[0]));
  } else if (conflicting.length > 1) {
    changes.push(`${conflicting.length} contested points remain unresolved.`);
  }

  return changes;
}

function summarizeComparison(
  question: string,
  agreement: SourceComparison["agreement"],
  claims: Article["claims"]
) {
  if (agreement === "conflicting") {
    return `Sources split over ${questionAsWhether(question)}.`;
  }

  const representativeClaim = claims.at(0)?.text;

  if (representativeClaim) {
    return sentenceCase(toSentence(trimAtSecondaryClause(representativeClaim)));
  }

  if (agreement === "aligned") {
    return `Sources agree on ${questionAsWhether(question)}.`;
  }

  if (agreement === "partial") {
    return `Sources share the basics on ${questionAsWhether(
      question
    )}, with details still disputed.`;
  }

  return `Sources have limited agreement on ${questionAsWhether(question)}.`;
}

function summarizeLatestArticle(article: Article, sourceProfiles: SourceProfile[]) {
  const source = sourceProfiles.find((profile) => profile.id === article.sourceId);
  const sourceName = source?.name ?? article.sourceId;
  const headline = stripSourcePrefix(article.title, sourceName);

  return `${sourceName} added the latest update, ${headlineAsClause(headline)}.`;
}

function summarizeOpenConflict(comparison: SourceComparison) {
  const question = extractQuestion(comparison.summary);
  const tradeoff = question ? questionAsTradeoff(question) : undefined;

  if (tradeoff) {
    return `${sentenceCase(tradeoff)} remains unresolved.`;
  }

  return `${sentenceCase(questionAsWhether(question ?? comparison.summary))} remains unresolved.`;
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
  const cleaned = cleanSentence(question).replace(/\?$/, "");
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
  const cleaned = cleanSentence(question)
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
  const adjectiveEnoughMatch = rest.match(
    /^(.+?)\s+(adequate|clear|credible|strong|sufficient)\s+enough\b(.*)$/i
  );

  if (adjectiveEnoughMatch?.[1] && adjectiveEnoughMatch[2]) {
    return `whether ${lowerFirst(adjectiveEnoughMatch[1])} ${verb} ${lowerFirst(
      `${adjectiveEnoughMatch[2]} enough${adjectiveEnoughMatch[3] ?? ""}`
    )}`;
  }

  const predicateMatch = rest.match(
    /^(.+?)\s+(adequate|available|clear|credible|included|justified|required|resolved|sufficient|visible)\b(.*)$/i
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
  return cleanSentence(value)
    .replace(/\s*;\s*.*$/, "")
    .replace(/\s*,\s*while\s+.*$/i, "")
    .replace(/\s*,\s*but\s+.*$/i, "");
}

function headlineAsClause(value: string) {
  const headline = cleanSentence(value).replace(/\.$/, "");
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
  const normalizedTitle = cleanSentence(title);
  const normalizedSource = cleanSentence(sourceName);

  if (normalizedTitle.toLowerCase().startsWith(`${normalizedSource.toLowerCase()} `)) {
    return normalizedTitle.slice(normalizedSource.length).trim();
  }

  return normalizedTitle;
}

function toSentence(value: string) {
  const cleaned = cleanSentence(value);

  if (/[.!?]$/.test(cleaned)) {
    return cleaned;
  }

  return `${cleaned}.`;
}

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string) {
  const cleaned = cleanSentence(value);
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function lowerFirst(value: string) {
  const cleaned = cleanSentence(value);
  return `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
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
