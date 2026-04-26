import { Event, EventSchema } from "./schemas.js";

export function buildBrief(rawEvent: unknown): string {
  const event = EventSchema.parse(rawEvent);
  const stakeholderLines = event.stakeholders.map(
    (stakeholder) =>
      `- ${stakeholder.name}: ${stakeholder.positionSummary}`
  );
  const comparisonLines = event.sourceComparisons.map(
    (comparison) =>
      `- ${comparison.agreement.toUpperCase()}: ${comparison.summary}`
  );
  const auditLines = event.auditFindings.map(
    (finding) => `- ${finding.severity.toUpperCase()}: ${finding.summary}`
  );
  const articleLines = event.articles.map(
    (article) => `- ${article.title} (${article.sourceId}, ${article.publishedAt})`
  );

  return [
    `# ${event.title}`,
    "",
    event.summary,
    "",
    `Confidence: ${Math.round(event.confidence * 100)}%`,
    "",
    "## Stakeholders",
    stakeholderLines.length > 0 ? stakeholderLines.join("\n") : "- None identified",
    "",
    "## Source Comparisons",
    comparisonLines.length > 0 ? comparisonLines.join("\n") : "- None generated",
    "",
    "## Audit Findings",
    auditLines.length > 0 ? auditLines.join("\n") : "- No findings",
    "",
    "## Articles",
    articleLines.length > 0 ? articleLines.join("\n") : "- None"
  ].join("\n");
}

export function summarizeEventForCard(rawEvent: unknown): Pick<
  Event,
  "id" | "topicId" | "title" | "summary" | "confidence" | "generatedAt"
> & {
  articleCount: number;
  sourceCount: number;
  findingCount: number;
} {
  const event = EventSchema.parse(rawEvent);

  return {
    id: event.id,
    topicId: event.topicId,
    title: event.title,
    summary: event.summary,
    confidence: event.confidence,
    generatedAt: event.generatedAt,
    articleCount: event.articles.length,
    sourceCount: event.sourceProfiles.length,
    findingCount: event.auditFindings.length
  };
}
